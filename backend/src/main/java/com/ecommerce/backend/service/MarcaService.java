package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MarcaDTO;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.repository.MarcaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarcaService {
    private final MarcaRepository marcaRepository;

    private final String uploadDir = Paths.get("backend", "src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    @Transactional
    public Marca crearMarca(MarcaDTO req) throws IOException {
        // Validaciones
        if (req.getNombre() == null || req.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }

        if (marcaRepository.existsByNombre(req.getNombre())) {
            throw new IllegalArgumentException("Ya existe una marca con ese nombre");
        }

        // Crear entidad
        Marca marca = new Marca();
        marca.setNombre(req.getNombre());
        marca = marcaRepository.save(marca);

        // Manejo de imagen
        if (req.getImagen() != null && !req.getImagen().isEmpty()) {
            String nombreImagen = UUID.randomUUID() + "_" + req.getImagen().getOriginalFilename();

            // Guardar en sistema de archivos
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));

            // Actualizar entidad
            marca.setImagen(nombreImagen);
            marca = marcaRepository.save(marca);
        }

        return marca;
    }

    // Método para obtener una marca por su ID
    public Marca obtenerMarcaPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));
    }

    @Transactional
    public Marca actualizarMarca(Long id, MarcaDTO req) throws IOException {
        Marca marca = obtenerMarcaPorId(id);
        String nuevoNombre = req.getNombre();

        // Validación de nombre
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }

        if (!marca.getNombre().equalsIgnoreCase(nuevoNombre.trim())) {
            if (marcaRepository.existsByNombre(nuevoNombre.trim())) {
                throw new IllegalArgumentException("Ya existe otra marca con ese nombre");
            }
            marca.setNombre(nuevoNombre.trim());
        }

        // Manejo de imagen
        if (req.getImagen() != null && !req.getImagen().isEmpty()) {
            // Eliminar imagen anterior si existe
            if (marca.getImagen() != null && !marca.getImagen().isEmpty()) {
                File oldImage = new File(uploadDir + marca.getImagen());
                if (oldImage.exists()) {
                    oldImage.delete();
                }
            }

            // Guardar nueva imagen
            String nombreImagen = UUID.randomUUID() + "_" + req.getImagen().getOriginalFilename();
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));
            marca.setImagen(nombreImagen);
        }

        return marcaRepository.save(marca);
    }

    // Método para eliminar una marca
    public void eliminarMarca(Long id) {
        if (!marcaRepository.existsById(id)) {
            throw new IllegalArgumentException("Marca no encontrada");
        }
        marcaRepository.deleteById(id);
    }
}
