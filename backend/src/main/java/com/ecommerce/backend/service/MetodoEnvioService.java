package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MetodoEnvioDTO;
import com.ecommerce.backend.entity.MetodoEnvio;
import com.ecommerce.backend.repository.MetodoEnvioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetodoEnvioService {

    private final MetodoEnvioRepository metodoEnvioRepository;
    private final ObjectMapper objectMapper;
    private final String uploadDir = Paths.get("src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    public MetodoEnvioService(MetodoEnvioRepository metodoEnvioRepository, ObjectMapper objectMapper) {
        this.metodoEnvioRepository = metodoEnvioRepository;
        this.objectMapper = objectMapper;
    }

    public MetodoEnvioDTO parsearJson(String json, MultipartFile icono) throws IOException {
        MetodoEnvioDTO dto = objectMapper.readValue(json, MetodoEnvioDTO.class);
        if (icono != null && !icono.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + icono.getOriginalFilename();
            dto.setIconoImg(nombreArchivo);
            dto.setIconoMultipart(icono);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosEnvio")
    public List<MetodoEnvioDTO> obtenerTodosMetodosEnvio() {
        List<MetodoEnvio> lista = metodoEnvioRepository.findAll();
        return lista.stream().map(m -> {
            MetodoEnvioDTO dto = new MetodoEnvioDTO();
            dto.setIdMetodoEnvio(m.getIdMetodoEnvio());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setEstado(m.getEstado());
            dto.setIconoImg(m.getIconoImg());
            dto.setCosto(m.getCosto());
            dto.setTiempoEstimado(m.getTiempoEstimado());
            dto.setPuntosRecojo(m.getPuntosRecojo());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "metodosEnvioActivos")
    public List<MetodoEnvioDTO> obtenerMetodosEnvioActivos() {
        List<MetodoEnvio> lista = metodoEnvioRepository.findByEstado(true);
        return lista.stream().map(m -> {
            MetodoEnvioDTO dto = new MetodoEnvioDTO();
            dto.setIdMetodoEnvio(m.getIdMetodoEnvio());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setEstado(m.getEstado());
            dto.setIconoImg(m.getIconoImg());
            dto.setCosto(m.getCosto());
            dto.setTiempoEstimado(m.getTiempoEstimado());
            dto.setPuntosRecojo(m.getPuntosRecojo());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MetodoEnvioDTO> obtenerPrimerosCuatroMetodosEnvio() {
        return metodoEnvioRepository.findTop4ByOrderByIdMetodoEnvioAsc().stream().map(m -> {
            MetodoEnvioDTO dto = new MetodoEnvioDTO();
            dto.setIdMetodoEnvio(m.getIdMetodoEnvio());
            dto.setNombre(m.getNombre());
            dto.setDescripcion(m.getDescripcion());
            dto.setEstado(m.getEstado());
            dto.setIconoImg(m.getIconoImg());
            dto.setCosto(m.getCosto());
            dto.setTiempoEstimado(m.getTiempoEstimado());
            dto.setPuntosRecojo(m.getPuntosRecojo());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = { "metodosEnvio", "metodoEnvio", "metodosEnvioActivos" }, allEntries = true)
    public MetodoEnvioDTO crearMetodoEnvio(MetodoEnvioDTO req) throws IOException {
        MetodoEnvio m = new MetodoEnvio();
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setEstado(req.getEstado());
        m.setIconoImg(req.getIconoImg());
        m.setCosto(req.getCosto());
        m.setTiempoEstimado(req.getTiempoEstimado());
        m.setPuntosRecojo(req.getPuntosRecojo());
        m = metodoEnvioRepository.save(m);

        if (req.getIconoMultipart() != null) {
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            req.getIconoMultipart().transferTo(new File(uploadDir + req.getIconoImg()));
        }

        MetodoEnvioDTO out = new MetodoEnvioDTO();
        out.setIdMetodoEnvio(m.getIdMetodoEnvio());
        out.setNombre(m.getNombre());
        out.setDescripcion(m.getDescripcion());
        out.setEstado(m.getEstado());
        out.setIconoImg(m.getIconoImg());
        out.setCosto(m.getCosto());
        out.setTiempoEstimado(m.getTiempoEstimado());
        out.setPuntosRecojo(m.getPuntosRecojo());
        return out;
    }

    @Transactional
    @CacheEvict(value = { "metodosEnvio", "metodoEnvio", "metodosEnvioActivos" }, allEntries = true)
    public MetodoEnvioDTO actualizarMetodoEnvio(Long id, MetodoEnvioDTO req) throws IOException {
        MetodoEnvio m = metodoEnvioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Método de envío no encontrado"));
        m.setNombre(req.getNombre());
        m.setDescripcion(req.getDescripcion());
        m.setEstado(req.getEstado());
        m.setCosto(req.getCosto());
        m.setTiempoEstimado(req.getTiempoEstimado());
        m.setPuntosRecojo(req.getPuntosRecojo());

        MultipartFile icono = req.getIconoMultipart();
        if (icono != null && !icono.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + icono.getOriginalFilename();
            m.setIconoImg(nombreArchivo);
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();
            icono.transferTo(new File(uploadDir + nombreArchivo));
        }

        m = metodoEnvioRepository.save(m);

        MetodoEnvioDTO out = new MetodoEnvioDTO();
        out.setIdMetodoEnvio(m.getIdMetodoEnvio());
        out.setNombre(m.getNombre());
        out.setDescripcion(m.getDescripcion());
        out.setEstado(m.getEstado());
        out.setIconoImg(m.getIconoImg());
        out.setCosto(m.getCosto());
        out.setTiempoEstimado(m.getTiempoEstimado());
        out.setPuntosRecojo(m.getPuntosRecojo());
        return out;
    }

    @Transactional
    @CacheEvict(value = { "metodosEnvio", "metodoEnvio", "metodosEnvioActivos" }, allEntries = true)
    public void eliminarMetodoEnvio(Long id) {
        if (!metodoEnvioRepository.existsById(id)) {
            throw new IllegalArgumentException("Método de envío no encontrado");
        }
        metodoEnvioRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = { "metodosEnvio", "metodoEnvio", "metodosEnvioActivos" }, allEntries = true)
    public MetodoEnvioDTO cambiarEstadoMetodoEnvio(Long id, boolean estado) {
        MetodoEnvio m = metodoEnvioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Método de envío no encontrado"));
        m.setEstado(estado);
        m = metodoEnvioRepository.save(m);

        MetodoEnvioDTO dto = new MetodoEnvioDTO();
        dto.setIdMetodoEnvio(m.getIdMetodoEnvio());
        dto.setNombre(m.getNombre());
        dto.setDescripcion(m.getDescripcion());
        dto.setEstado(m.getEstado());
        dto.setIconoImg(m.getIconoImg());
        dto.setCosto(m.getCosto());
        dto.setTiempoEstimado(m.getTiempoEstimado());
        dto.setPuntosRecojo(m.getPuntosRecojo());
        return dto;
    }
}
