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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MetodoPagoService {

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

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosPago")
    public List<MetodoPagoDTO> obtenerTodosMetodosPago() {
        return metodoPagoRepository.findAll().stream().map(m -> {
            MetodoPagoDTO dto = new MetodoPagoDTO();
            dto.setIdMetodoPago(m.getIdMetodoPago());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setActivo(m.getActivo());
            dto.setIconoImg(m.getIconoImg());
            dto.setConfigAdicional(m.getConfigAdicional());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosPagoActivos")
    public List<MetodoPagoDTO> obtenerMetodosPagoActivos() {
        return metodoPagoRepository.findByActivo(true).stream().map(m -> {
            MetodoPagoDTO dto = new MetodoPagoDTO();
            dto.setIdMetodoPago(m.getIdMetodoPago());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setActivo(m.getActivo());
            dto.setIconoImg(m.getIconoImg());
            dto.setConfigAdicional(m.getConfigAdicional());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MetodoPagoDTO> obtenerPrimerosCuatroMetodosPago() {
        return metodoPagoRepository.findTop4ByOrderByIdMetodoPagoAsc().stream().map(m -> {
            MetodoPagoDTO dto = new MetodoPagoDTO();
            dto.setIdMetodoPago(m.getIdMetodoPago());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setActivo(m.getActivo());
            dto.setIconoImg(m.getIconoImg());
            dto.setConfigAdicional(m.getConfigAdicional());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public MetodoPagoDTO crearMetodoPago(MetodoPagoDTO req) throws IOException {
        MetodoPago m = new MetodoPago();
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setActivo(req.getActivo());
        m.setIconoImg(req.getIconoImg());
        m.setConfigAdicional(req.getConfigAdicional());
        m = metodoPagoRepository.save(m);

        if (req.getIconoMultipart() != null) {
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            req.getIconoMultipart().transferTo(new File(uploadDir + req.getIconoImg()));
        }

        MetodoPagoDTO out = new MetodoPagoDTO();
        out.setIdMetodoPago(m.getIdMetodoPago());
        out.setNombre(m.getNombre());
        out.setDescripcion(m.getDescripcion());
        out.setActivo(m.getActivo());
        out.setIconoImg(m.getIconoImg());
        out.setConfigAdicional(m.getConfigAdicional());
        return out;
    }

    @Transactional
    @CacheEvict(value = { "metodosPago", "metodoPago", "metodosPagoActivos" }, allEntries = true)
    public MetodoPagoDTO actualizarMetodoPago(Long id, MetodoPagoDTO req) throws IOException {
        MetodoPago m = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Método de pago no encontrado"));
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setActivo(req.getActivo());
        m.setConfigAdicional(req.getConfigAdicional());

        if (req.getIconoMultipart() != null && !req.getIconoMultipart().isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + req.getIconoMultipart().getOriginalFilename();
            m.setIconoImg(nombreArchivo);
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            req.getIconoMultipart().transferTo(new File(uploadDir + nombreArchivo));
        }

        m = metodoPagoRepository.save(m);

        MetodoPagoDTO out = new MetodoPagoDTO();
        out.setIdMetodoPago(m.getIdMetodoPago());
        out.setNombre(m.getNombre());
        out.setDescripcion(m.getDescripcion());
        out.setActivo(m.getActivo());
        out.setIconoImg(m.getIconoImg());
        out.setConfigAdicional(m.getConfigAdicional());
        return out;
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

        MetodoPagoDTO dto = new MetodoPagoDTO();
        dto.setIdMetodoPago(m.getIdMetodoPago());
        dto.setNombre(m.getNombre());
        dto.setDescripcion(m.getDescripcion());
        dto.setActivo(m.getActivo());
        dto.setIconoImg(m.getIconoImg());
        dto.setConfigAdicional(m.getConfigAdicional());
        return dto;
    }
}