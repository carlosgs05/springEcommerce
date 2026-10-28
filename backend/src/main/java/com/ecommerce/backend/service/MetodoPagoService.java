package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MetodoPagoDTO;
import com.ecommerce.backend.entity.MetodoPago;
import com.ecommerce.backend.repository.MetodoPagoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MetodoPagoService {

    private static final Set<String> TIPOS_VALIDOS = Set.of("MANUAL", "PASARELA");
    private static final Set<String> PROVEEDORES_VALIDOS = Set.of("CULQI", "MERCADOPAGO");

    private final MetodoPagoRepository metodoPagoRepository;
    private final ObjectMapper objectMapper;
    private final String uploadDir = Paths.get("src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    public MetodoPagoService(MetodoPagoRepository metodoPagoRepository, ObjectMapper objectMapper) {
        this.metodoPagoRepository = metodoPagoRepository;
        this.objectMapper = objectMapper;
    }

    public MetodoPagoDTO parsearJson(String json, MultipartFile icono) throws IOException {
        MetodoPagoDTO dto = objectMapper.readValue(json, MetodoPagoDTO.class);
        if (icono != null && !icono.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + icono.getOriginalFilename();
            dto.setIconoImg(nombreArchivo);
            dto.setIconoMultipart(icono);
        }
        return dto;
    }

    /**
     * Valida tipo/proveedor y normaliza el DTO: si tipo=MANUAL, limpia cualquier
     * proveedor que haya llegado (se ignora, nunca se guarda).
     */
    private void validarYNormalizarTipoProveedor(MetodoPagoDTO dto) {
        String tipo = dto.getTipo();
        if (tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("El tipo de método de pago es obligatorio");
        }
        tipo = tipo.trim().toUpperCase();
        if (!TIPOS_VALIDOS.contains(tipo)) {
            throw new IllegalArgumentException("Tipo de método de pago inválido: " + tipo);
        }
        dto.setTipo(tipo);

        if ("PASARELA".equals(tipo)) {
            String proveedor = dto.getProveedor();
            if (proveedor == null || proveedor.isBlank()) {
                throw new IllegalArgumentException("El proveedor es obligatorio cuando el tipo es PASARELA");
            }
            proveedor = proveedor.trim().toUpperCase();
            if (!PROVEEDORES_VALIDOS.contains(proveedor)) {
                throw new IllegalArgumentException("Proveedor inválido: " + proveedor);
            }
            dto.setProveedor(proveedor);
        } else {
            // tipo MANUAL: cualquier proveedor que haya llegado se ignora/limpia
            dto.setProveedor(null);
        }
    }

    private MetodoPagoDTO aDTO(MetodoPago m) {
        MetodoPagoDTO dto = new MetodoPagoDTO();
        dto.setIdMetodoPago(m.getIdMetodoPago());
        dto.setNombre(m.getNombre());
        dto.setDescripcion(m.getDescripcion());
        dto.setActivo(m.getActivo());
        dto.setIconoImg(m.getIconoImg());
        dto.setConfigAdicional(m.getConfigAdicional());
        dto.setTipo(m.getTipo());
        dto.setProveedor(m.getProveedor());
        return dto;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosPago")
    public List<MetodoPagoDTO> obtenerTodosMetodosPago() {
        return metodoPagoRepository.findAll().stream().map(this::aDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosPagoActivos")
    public List<MetodoPagoDTO> obtenerMetodosPagoActivos() {
        return metodoPagoRepository.findByActivo(true).stream().map(this::aDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MetodoPagoDTO> obtenerPrimerosCuatroMetodosPago() {
        return metodoPagoRepository.findTop4ByOrderByIdMetodoPagoAsc().stream().map(this::aDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public MetodoPagoDTO crearMetodoPago(MetodoPagoDTO req) throws IOException {
        validarYNormalizarTipoProveedor(req);

        MetodoPago m = new MetodoPago();
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setActivo(req.getActivo());
        m.setIconoImg(req.getIconoImg());
        m.setConfigAdicional(req.getConfigAdicional());
        m.setTipo(req.getTipo());
        m.setProveedor(req.getProveedor());
        m = metodoPagoRepository.save(m);

        if (req.getIconoMultipart() != null) {
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            req.getIconoMultipart().transferTo(new File(uploadDir + req.getIconoImg()));
        }

        return aDTO(m);
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public MetodoPagoDTO actualizarMetodoPago(Long id, MetodoPagoDTO req) throws IOException {
        validarYNormalizarTipoProveedor(req);

        MetodoPago m = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setActivo(req.getActivo());
        m.setConfigAdicional(req.getConfigAdicional());
        m.setTipo(req.getTipo());
        m.setProveedor(req.getProveedor());

        if (req.getIconoMultipart() != null && !req.getIconoMultipart().isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + req.getIconoMultipart().getOriginalFilename();
            m.setIconoImg(nombreArchivo);
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            req.getIconoMultipart().transferTo(new File(uploadDir + nombreArchivo));
        }

        m = metodoPagoRepository.save(m);
        return aDTO(m);
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public void eliminarMetodoPago(Long id) {
        if (!metodoPagoRepository.existsById(id)) {
            throw new IllegalArgumentException("Método de pago no encontrado");
        }
        metodoPagoRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public MetodoPagoDTO cambiarEstadoMetodoPago(Long id, boolean activo) {
        MetodoPago m = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));
        m.setActivo(activo);
        m = metodoPagoRepository.save(m);
        return aDTO(m);
    }
}
