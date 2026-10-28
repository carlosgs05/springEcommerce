package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.PedidoDTO;
import com.ecommerce.backend.entity.DetallePedido;
import com.ecommerce.backend.entity.Pedido;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.entity.Venta;
import com.ecommerce.backend.repository.MetodoEnvioRepository;
import com.ecommerce.backend.repository.MetodoPagoRepository;
import com.ecommerce.backend.repository.PedidoRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.repository.VentaRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MetodoEnvioRepository metodoEnvioRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final ProductoRepository productoRepository;
    private final ObjectMapper objectMapper;
    private final NotificacionService notificacionService;
    private final VentaRepository ventaRepository;

    private final String comprobanteDir = Paths
            .get("backend", "src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    public PedidoDTO parsearJson(String json, MultipartFile comprobante) throws IOException {
        PedidoDTO dto = objectMapper.readValue(json, PedidoDTO.class);
        if (comprobante != null && !comprobante.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + comprobante.getOriginalFilename();
            dto.setComprobantePago(nombreArchivo);
            dto.setComprobanteMultipart(comprobante);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> validarStockProductos(String productosJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<PedidoDTO.DetalleProductoDTO> productos = mapper.readValue(
                productosJson,
                new TypeReference<List<PedidoDTO.DetalleProductoDTO>>() {
                });

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (PedidoDTO.DetalleProductoDTO dto : productos) {
            Optional<Producto> productoOpt = productoRepository.findById(dto.getIdproducto());
            Map<String, Object> res = new HashMap<>();
            res.put("idproducto", dto.getIdproducto());
            res.put("nombre", dto.getNombre());
            res.put("cantidadSolicitada", dto.getCantidad());
            if (productoOpt.isEmpty()) {
                res.put("stockDisponible", 0);
                res.put("mensaje", "Producto no encontrado");
                res.put("suficiente", false);
            } else {
                Producto producto = productoOpt.get();
                res.put("stockDisponible", producto.getStock());
                if (dto.getCantidad() <= producto.getStock()) {
                    res.put("mensaje", "Stock suficiente");
                    res.put("suficiente", true);
                } else {
                    res.put("mensaje", "Stock insuficiente. Disponible: " + producto.getStock());
                    res.put("suficiente", false);
                }
            }
            resultado.add(res);
        }
        return resultado;
    }

    @Transactional
    public Pedido registrarPedido(PedidoDTO dto) throws IOException {
        // Validar que el comprobante existe
        if (dto.getComprobanteMultipart() == null || dto.getComprobanteMultipart().isEmpty()) {
            throw new IllegalArgumentException("El comprobante de pago es obligatorio");
        }

        Pedido pedido = new Pedido();
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Configurar los datos básicos del pedido
        pedido.setUsuario(usuario);
        pedido.setFechaPedido(dto.getFechaPedido() != null ? dto.getFechaPedido() : LocalDateTime.now());
        pedido.setMetodoEnvio(metodoEnvioRepository.findById(dto.getIdMetodoEnvio())
                .orElseThrow(() -> new IllegalArgumentException("Método de envío no encontrado")));
        com.ecommerce.backend.entity.MetodoPago metodoPago = metodoPagoRepository.findById(dto.getIdMetodoPago())
                .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));
        pedido.setMetodoPago(metodoPago);

        // Moneda y estado de pasarela: nunca se toman del body del cliente, se
        // derivan aquí del método de pago real guardado en la base.
        pedido.setMoneda("PEN");
        if ("PASARELA".equals(metodoPago.getTipo())) {
            pedido.setEstadoPagoPasarela("PENDIENTE");
        } else {
            pedido.setEstadoPagoPasarela(null);
        }
        pedido.setIdTransaccionPasarela(null);

        pedido.setEstado(dto.getEstado());
        pedido.setMontoPedido(dto.getMontoPedido());
        pedido.setMontoEnvio(dto.getMontoEnvio());
        pedido.setMontoTotal(dto.getMontoTotal());
        pedido.setDireccionEnvio(dto.getDireccionEnvio());
        pedido.setObservacion(dto.getObservacion());
        pedido.setComprobantePago(dto.getComprobantePago());

        // Guardar el comprobante en el sistema de archivos
        File carpeta = new File(comprobanteDir);
        if (!carpeta.exists()) {
            carpeta.mkdirs();
        }
        dto.getComprobanteMultipart().transferTo(new File(comprobanteDir + dto.getComprobantePago()));

        // Procesar los detalles del pedido
        List<DetallePedido> detalles = new ArrayList<>();
        for (PedidoDTO.DetalleProductoDTO item : dto.getProductos()) {
            Producto producto = productoRepository.findById(item.getIdproducto())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Producto con ID " + item.getIdproducto() + " no encontrado"));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecio());
            detalles.add(detalle);
        }
        pedido.setDetalles(detalles);

        // Guardar el pedido en la base de datos
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // Notificar a los administradores
        notificacionService.crearNotificacionParaAdmins(
                "Nuevo pedido registrado",
                "Se ha registrado un nuevo pedido del usuario: " + usuario.getNombre() + " " + usuario.getApellido(),
                "pedido",
                "admin/pedidos/" + pedidoGuardado.getIdPedido());

        return pedidoGuardado;
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorMesYAnioConDetalles(Integer iduser, int year, int month) {
        // Validación de parámetros
        if (iduser == null || iduser <= 0) {
            throw new IllegalArgumentException("ID de usuario inválido");
        }
        if (year <= 0) {
            throw new IllegalArgumentException("El año debe ser un valor positivo");
        }
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("El mes debe estar entre 1 y 12");
        }

        List<Pedido> pedidos = pedidoRepository.findByUsuarioAndMonthYearWithDetails(iduser, year, month);

        if (pedidos.isEmpty()) {
            throw new NoSuchElementException("No se encontraron pedidos para el usuario " + iduser +
                    " en " + month + "/" + year);
        }

        return pedidos;
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorEstadoConDetalles(Integer estado) {
        // Eliminamos la validación de rango
        List<Pedido> pedidos = pedidoRepository.findByEstadoWithDetails(estado);

        // Forzar inicialización de relaciones adicionales
        for (Pedido pedido : pedidos) {
            if (pedido.getDetalles() != null) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    if (detalle.getProducto() != null) {
                        Hibernate.initialize(detalle.getProducto().getImagenes());
                        Hibernate.initialize(detalle.getProducto().getEspecificaciones());
                    }
                }
            }
        }

        return pedidos;
    }

    @Transactional
    public Pedido actualizarEstadoPedido(Long idPedido, Integer nuevoEstado, String mensaje)
            throws JsonProcessingException {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + idPedido));

        // Procesar el JSON de observaciones
        List<Map<String, Object>> historialEstados = new ArrayList<>();

        if (pedido.getObservacion() != null && !pedido.getObservacion().isEmpty()) {
            try {
                historialEstados = objectMapper.readValue(
                        pedido.getObservacion(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {
                        });
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Error al procesar el historial de estados del pedido");
            }
        }

        // Añadir el nuevo estado al historial
        Map<String, Object> nuevoEstadoEntry = Map.of(
                "estado", nuevoEstado,
                "fecha", LocalDateTime.now().toString(),
                "mensaje", mensaje);
        historialEstados.add(nuevoEstadoEntry);

        // Convertir a JSON
        String nuevaObservacion = objectMapper.writeValueAsString(historialEstados);

        // Actualizar el pedido
        pedido.setEstado(nuevoEstado);
        pedido.setObservacion(nuevaObservacion);

        // Lógica para estado 2 (Descontar stock)
        if (nuevoEstado == 2) {
            descontarStockProductos(pedido);
        }

        // Lógica para estado 4 (Registrar venta)
        if (nuevoEstado == 4) {
            registrarVenta(pedido);
        }

        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        if (nuevoEstado == -1) {
            // Crear notificación para los administradores sobre pedido apelado
            notificacionService.crearNotificacionParaAdmins(
                    "Pedido apelado",
                    "El usuario " + pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido() + " ha apelado su pedido #" + pedido.getIdPedido(),
                    "pedido",
                    "admin/pedidos/" + pedido.getIdPedido());
        } else if (nuevoEstado == 4) {
            // Crear notificación para los administradores sobre venta registrada
            notificacionService.crearNotificacionParaAdmins(
                    "Pedido entregado",
                    "El pedido #" + pedido.getIdPedido() + " ha sido entregado al usuario: "
                            + pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido(),
                    "pedido",
                    "admin/pedidos/" + pedido.getIdPedido());
        } else {
            // Crear notificación para el usuario
            crearNotificacionUsuario(pedidoActualizado, nuevoEstado);
        }

        return pedidoActualizado;
    }

    private void descontarStockProductos(Pedido pedido) {
        for (DetallePedido detalle : pedido.getDetalles()) {
            Producto producto = detalle.getProducto();
            int cantidadComprada = detalle.getCantidad();

            if (producto.getStock() < cantidadComprada) {
                throw new IllegalStateException(
                        "Stock insuficiente para el producto: " + producto.getNombre() +
                                ". Stock actual: " + producto.getStock() +
                                ", cantidad solicitada: " + cantidadComprada);
            }

            producto.setStock(producto.getStock() - cantidadComprada);
            productoRepository.save(producto);
        }
    }

    private void registrarVenta(Pedido pedido) {
        if (pedido.getVenta() != null) {
            throw new IllegalStateException("Este pedido ya tiene una venta registrada");
        }

        Venta venta = new Venta();
        venta.setIdVenta(pedido.getIdPedido()); // Usamos el mismo ID del pedido
        venta.setPedido(pedido);
        venta.setFechaEntrega(LocalDateTime.now().plusDays(3)); // Ejemplo: entrega en 3 días

        ventaRepository.save(venta);
    }

    private void crearNotificacionUsuario(Pedido pedido, Integer nuevoEstado) {
        String titulo = "Actualización de tu pedido #" + pedido.getIdPedido();
        String mensajeNotificacion = "";
        String tipo = "pedido";
        String url = "mis-pedidos/" + pedido.getIdPedido();

        switch (nuevoEstado) {
            case -2:
                mensajeNotificacion = "Tu pedido ha sido rechazado, por favor contacta al soporte para apelaciones";
                break;
            case 1:
                mensajeNotificacion = "Tu pedido ha sido confirmado y está siendo procesado";
                break;
            case 2:
                mensajeNotificacion = "Tu pedido ha sido preparado y ya está en camino a tu dirección";
                break;
            case 3:
                mensajeNotificacion = "Tu pedido está listo para ser entregado, acércate a la dirección indicada";
                break;
        }

        // Verificar que el usuario existe y tiene rol cliente (idrol=2)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdUser(pedido.getUsuario().getIduser());
        if (usuarioOpt.isPresent() && usuarioOpt.get().getRol().getIdrol() == 2) {
            notificacionService.crearNotificacionParaUsuario(
                    usuarioOpt.get(),
                    titulo,
                    mensajeNotificacion,
                    tipo,
                    url);
        }
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPedidoCompletoPorId(Long idPedido) {
        Pedido pedido = pedidoRepository.findByIdWithDetails(idPedido)
                .orElseThrow(() -> new NoSuchElementException("Pedido no encontrado con ID: " + idPedido));

        // Inicializar imágenes y especificaciones de cada producto
        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                Producto producto = detalle.getProducto();
                if (producto != null) {
                    Hibernate.initialize(producto.getImagenes());
                    Hibernate.initialize(producto.getEspecificaciones());
                }
            }
        }
        return pedido;
    }
}
