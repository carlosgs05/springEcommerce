package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.PedidoDTO;
import com.ecommerce.backend.entity.DetallePedido;
import com.ecommerce.backend.entity.Especificacion;
import com.ecommerce.backend.entity.Pedido;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.ProductoImg;
import com.ecommerce.backend.service.PedidoService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping("/validar-stock")
    public ResponseEntity<?> validarStockProductos(@RequestBody String productosJson) {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Map<String, Object>> resultado = pedidoService.validarStockProductos(productosJson);
            resp.put("success", true);
            resp.put("data", resultado);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarPedido(
            @RequestParam("pedido") String pedidoJson,
            @RequestParam("comprobante") MultipartFile comprobante) {

        Map<String, Object> response = new HashMap<>();
        try {
            // Parsear el JSON y procesar el comprobante
            PedidoDTO pedidoDTO = pedidoService.parsearJson(pedidoJson, comprobante);

            // Registrar el pedido
            Pedido pedidoRegistrado = pedidoService.registrarPedido(pedidoDTO);

            // Construir respuesta exitosa
            response.put("success", true);
            response.put("message", "Pedido registrado exitosamente");
            response.put("idPedido", pedidoRegistrado.getIdPedido());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Error de validación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Error al procesar el comprobante: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al registrar el pedido: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/usuario/{iduser}/filtro")
    public ResponseEntity<?> filtrarPedidosPorMesYAnio(
            @PathVariable Integer iduser,
            @RequestParam int year,
            @RequestParam int month) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", iduser);
        response.put("year", year);
        response.put("month", month);

        try {
            // Validación de parámetros
            if (iduser == null || iduser <= 0) {
                response.put("success", false);
                response.put("message", "ID de usuario inválido");
                return ResponseEntity.ok(response);
            }
            if (year <= 0) {
                response.put("success", false);
                response.put("message", "El año debe ser un valor positivo");
                return ResponseEntity.ok(response);
            }
            if (month < 1 || month > 12) {
                response.put("success", false);
                response.put("message", "El mes debe estar entre 1 y 12");
                return ResponseEntity.ok(response);
            }

            List<Pedido> pedidos;
            try {
                pedidos = pedidoService.obtenerPedidosPorMesYAnioConDetalles(iduser, year, month);
            } catch (Exception e) {
                response.put("success", false);
                response.put("message", "Error al obtener pedidos: " + e.getMessage());
                return ResponseEntity.ok(response);
            }

            response.put("count", pedidos.size());

            if (pedidos.isEmpty()) {
                response.put("success", true);
                response.put("message",
                        "No se encontraron pedidos para el usuario " + iduser + " en " + month + "/" + year);
                response.put("pedidos", Collections.emptyList());
                return ResponseEntity.ok(response);
            }

            // Mapeo de pedidos a DTOs
            List<Map<String, Object>> pedidosData = new ArrayList<>();
            for (Pedido pedido : pedidos) {
                try {
                    Map<String, Object> pedidoMap = new LinkedHashMap<>();
                    // Datos básicos del pedido
                    pedidoMap.put("idPedido", pedido.getIdPedido());
                    pedidoMap.put("fechaPedido",
                            pedido.getFechaPedido() != null ? pedido.getFechaPedido().toString() : null);
                    pedidoMap.put("estado", pedido.getEstado());
                    pedidoMap.put("montoPedido", pedido.getMontoPedido());
                    pedidoMap.put("montoEnvio", pedido.getMontoEnvio());
                    pedidoMap.put("montoTotal", pedido.getMontoTotal());
                    pedidoMap.put("comprobantePago", pedido.getComprobantePago());
                    pedidoMap.put("direccionEnvio", pedido.getDireccionEnvio());
                    pedidoMap.put("observacion", pedido.getObservacion());

                    // Información del usuario
                    if (pedido.getUsuario() != null) {
                        Map<String, Object> usuarioMap = new LinkedHashMap<>();
                        usuarioMap.put("idUsuario", pedido.getUsuario().getIduser());
                        usuarioMap.put("nombreCompleto",
                                pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido());
                        usuarioMap.put("email", pedido.getUsuario().getCorreo());
                        pedidoMap.put("usuario", usuarioMap);
                    }

                    // Información del método de envío
                    if (pedido.getMetodoEnvio() != null) {
                        Map<String, Object> metodoEnvioMap = new LinkedHashMap<>();
                        metodoEnvioMap.put("idMetodoEnvio", pedido.getMetodoEnvio().getIdMetodoEnvio());
                        metodoEnvioMap.put("nombre", pedido.getMetodoEnvio().getNombre());
                        metodoEnvioMap.put("costo", pedido.getMetodoEnvio().getCosto());
                        metodoEnvioMap.put("tiempoEstimado", pedido.getMetodoEnvio().getTiempoEstimado());
                        pedidoMap.put("metodoEnvio", metodoEnvioMap);
                    }

                    // Información del método de pago
                    if (pedido.getMetodoPago() != null) {
                        Map<String, Object> metodoPagoMap = new LinkedHashMap<>();
                        metodoPagoMap.put("idMetodoPago", pedido.getMetodoPago().getIdMetodoPago());
                        metodoPagoMap.put("nombre", pedido.getMetodoPago().getNombre());
                        pedidoMap.put("metodoPago", metodoPagoMap);
                    }

                    // Detalles del pedido con información completa de productos
                    List<Map<String, Object>> detalles = new ArrayList<>();
                    if (pedido.getDetalles() != null) {
                        for (DetallePedido detalle : pedido.getDetalles()) {
                            try {
                                Map<String, Object> detalleMap = new LinkedHashMap<>();
                                detalleMap.put("cantidad", detalle.getCantidad());
                                detalleMap.put("precioUnitario", detalle.getPrecioUnitario());
                                detalleMap.put("subtotal", detalle.getPrecioUnitario()
                                        .multiply(BigDecimal.valueOf(detalle.getCantidad())));

                                // Información completa del producto
                                if (detalle.getProducto() != null) {
                                    Map<String, Object> productoMap = new LinkedHashMap<>();
                                    Producto producto = detalle.getProducto();

                                    productoMap.put("idProducto", producto.getIdproducto());
                                    productoMap.put("nombre", producto.getNombre());
                                    productoMap.put("descripcion", producto.getDescripcion());
                                    productoMap.put("precio", producto.getPrecio());

                                    // Imágenes del producto
                                    List<Map<String, String>> imagenes = new ArrayList<>();
                                    if (producto.getImagenes() != null) {
                                        for (ProductoImg imagen : producto.getImagenes()) {
                                            try {
                                                Map<String, String> imgMap = new LinkedHashMap<>();
                                                imgMap.put("idImagen", imagen.getIdImagen().toString());
                                                imgMap.put("nombre", imagen.getNombre());
                                                imagenes.add(imgMap);
                                            } catch (Exception e) {
                                                continue; // Si falla una imagen, continuamos con las demás
                                            }
                                        }
                                    }
                                    productoMap.put("imagenes", imagenes);

                                    // Especificaciones del producto
                                    List<Map<String, Object>> especificaciones = new ArrayList<>();
                                    if (producto.getEspecificaciones() != null) {
                                        for (Especificacion espec : producto.getEspecificaciones()) {
                                            try {
                                                Map<String, Object> espMap = new LinkedHashMap<>();
                                                espMap.put("idEspecificacion", espec.getIdEspecificacion());
                                                espMap.put("unidadMedida", espec.getUnidadMedida());
                                                espMap.put("valor", espec.getValor());
                                                espMap.put("descripcion", espec.getDescripcion());
                                                especificaciones.add(espMap);
                                            } catch (Exception e) {
                                                continue; // Si falla una especificación, continuamos con las demás
                                            }
                                        }
                                    }
                                    productoMap.put("especificaciones", especificaciones);

                                    detalleMap.put("producto", productoMap);
                                }

                                detalles.add(detalleMap);
                            } catch (Exception e) {
                                // Si falla un detalle, continuamos con los demás
                                continue;
                            }
                        }
                    }
                    pedidoMap.put("detalles", detalles);
                    pedidosData.add(pedidoMap);
                } catch (Exception e) {
                    // Si falla un pedido, continuamos con los demás
                    continue;
                }
            }

            response.put("success", true);
            response.put("message",
                    pedidosData.isEmpty() ? "No se encontraron pedidos válidos" : "Pedidos obtenidos correctamente");
            response.put("pedidos", pedidosData);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error inesperado: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // Obtener pedidos por estado (modificado para aceptar cualquier entero)
    @GetMapping("/por-estado")
    public ResponseEntity<?> obtenerPedidosPorEstado(@RequestParam Integer estado) {
        Map<String, Object> response = new LinkedHashMap<>();

        try {
            // Eliminamos la validación de rango para permitir cualquier entero
            List<Pedido> pedidos = pedidoService.obtenerPedidosPorEstadoConDetalles(estado);

            if (pedidos.isEmpty()) {
                response.put("success", true);
                response.put("message", "No se encontraron pedidos con estado: " + estado);
                response.put("pedidos", Collections.emptyList());
                return ResponseEntity.ok(response);
            }

            List<Map<String, Object>> pedidosData = new ArrayList<>();
            for (Pedido pedido : pedidos) {
                pedidosData.add(mapearPedido(pedido));
            }

            response.put("success", true);
            response.put("count", pedidos.size());
            response.put("pedidos", pedidosData);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener pedidos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Método de mapeo reusable (extraído del método existente)
    private Map<String, Object> mapearPedido(Pedido pedido) {
        Map<String, Object> pedidoMap = new LinkedHashMap<>();

        // Datos básicos del pedido
        pedidoMap.put("idPedido", pedido.getIdPedido());
        pedidoMap.put("fechaPedido", pedido.getFechaPedido() != null ? pedido.getFechaPedido().toString() : null);
        pedidoMap.put("estado", pedido.getEstado());
        pedidoMap.put("montoPedido", pedido.getMontoPedido());
        pedidoMap.put("montoEnvio", pedido.getMontoEnvio());
        pedidoMap.put("montoTotal", pedido.getMontoTotal());
        pedidoMap.put("comprobantePago", pedido.getComprobantePago());
        pedidoMap.put("direccionEnvio", pedido.getDireccionEnvio());
        pedidoMap.put("observacion", pedido.getObservacion());

        // Información del usuario
        if (pedido.getUsuario() != null) {
            Map<String, Object> usuarioMap = new LinkedHashMap<>();
            usuarioMap.put("idUsuario", pedido.getUsuario().getIduser());
            usuarioMap.put("nombreCompleto", pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido());
            usuarioMap.put("email", pedido.getUsuario().getCorreo());
            pedidoMap.put("usuario", usuarioMap);
        }

        // Información del método de envío
        if (pedido.getMetodoEnvio() != null) {
            Map<String, Object> metodoEnvioMap = new LinkedHashMap<>();
            metodoEnvioMap.put("idMetodoEnvio", pedido.getMetodoEnvio().getIdMetodoEnvio());
            metodoEnvioMap.put("nombre", pedido.getMetodoEnvio().getNombre());
            metodoEnvioMap.put("costo", pedido.getMetodoEnvio().getCosto());
            metodoEnvioMap.put("tiempoEstimado", pedido.getMetodoEnvio().getTiempoEstimado());
            pedidoMap.put("metodoEnvio", metodoEnvioMap);
        }

        // Información del método de pago
        if (pedido.getMetodoPago() != null) {
            Map<String, Object> metodoPagoMap = new LinkedHashMap<>();
            metodoPagoMap.put("idMetodoPago", pedido.getMetodoPago().getIdMetodoPago());
            metodoPagoMap.put("nombre", pedido.getMetodoPago().getNombre());
            pedidoMap.put("metodoPago", metodoPagoMap);
        }

        // Detalles del pedido
        List<Map<String, Object>> detalles = new ArrayList<>();
        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                Map<String, Object> detalleMap = new LinkedHashMap<>();
                detalleMap.put("cantidad", detalle.getCantidad());
                detalleMap.put("precioUnitario", detalle.getPrecioUnitario());
                detalleMap.put("subtotal",
                        detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad())));

                // Información del producto
                if (detalle.getProducto() != null) {
                    Producto producto = detalle.getProducto();
                    Map<String, Object> productoMap = new LinkedHashMap<>();
                    productoMap.put("idProducto", producto.getIdproducto());
                    productoMap.put("nombre", producto.getNombre());
                    productoMap.put("descripcion", producto.getDescripcion());
                    productoMap.put("precio", producto.getPrecio());

                    // Imágenes del producto
                    List<Map<String, String>> imagenes = new ArrayList<>();
                    if (producto.getImagenes() != null) {
                        for (ProductoImg imagen : producto.getImagenes()) {
                            Map<String, String> imgMap = new LinkedHashMap<>();
                            imgMap.put("idImagen", imagen.getIdImagen().toString());
                            imgMap.put("nombre", imagen.getNombre());
                            imgMap.put("url", "/uploads/" + imagen.getNombre()); // Ruta completa
                            imagenes.add(imgMap);
                        }
                    }
                    productoMap.put("imagenes", imagenes);

                    // Especificaciones del producto
                    List<Map<String, Object>> especificaciones = new ArrayList<>();
                    if (producto.getEspecificaciones() != null) {
                        for (Especificacion espec : producto.getEspecificaciones()) {
                            Map<String, Object> espMap = new LinkedHashMap<>();
                            espMap.put("idEspecificacion", espec.getIdEspecificacion());
                            espMap.put("unidadMedida", espec.getUnidadMedida());
                            espMap.put("valor", espec.getValor());
                            espMap.put("descripcion", espec.getDescripcion());
                            especificaciones.add(espMap);
                        }
                    }
                    productoMap.put("especificaciones", especificaciones);

                    detalleMap.put("producto", productoMap);
                }
                detalles.add(detalleMap);
            }
        }
        pedidoMap.put("detalles", detalles);

        return pedidoMap;
    }

    @PatchMapping("/{idPedido}/estado")
    public ResponseEntity<?> actualizarEstadoPedido(
            @PathVariable Long idPedido,
            @RequestBody Map<String, Object> requestBody) {

        Map<String, Object> response = new HashMap<>();

        try {
            Integer nuevoEstado = (Integer) requestBody.get("estado");
            String mensaje = (String) requestBody.get("mensaje");

            if (nuevoEstado == null || mensaje == null || mensaje.isEmpty()) {
                throw new IllegalArgumentException("Estado y mensaje son requeridos");
            }

            Pedido pedidoActualizado = pedidoService.actualizarEstadoPedido(idPedido, nuevoEstado, mensaje);

            response.put("success", true);
            response.put("message", "Estado del pedido actualizado correctamente");
            response.put("idPedido", pedidoActualizado.getIdPedido());
            response.put("nuevoEstado", pedidoActualizado.getEstado());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (JsonProcessingException e) {
            response.put("success", false);
            response.put("message", "Error al procesar el historial de estados");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar el estado del pedido: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{idPedido}")
    public ResponseEntity<?> obtenerPedidoPorId(@PathVariable Long idPedido) {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
            Pedido pedido = pedidoService.obtenerPedidoCompletoPorId(idPedido);
            response.put("success", true);
            response.put("pedido", mapearPedido(pedido));
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener el pedido: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}