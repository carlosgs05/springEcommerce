package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MarcaDTO;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.repository.MarcaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    /**
     * Devuelve la lista completa de marcas.
     * La primera llamada consulta la BD; las siguientes, el caché "marcas".
     */
    @Cacheable(value = "marcas", sync = true)
    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    /**
     * Crea una nueva marca y limpia la caché "marcas"
     * para que el listado se recargue con datos actualizados.
     */
    @Transactional
    @CacheEvict(value = "marcas", allEntries = true)
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

            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));

            marca.setImagen(nombreImagen);
            marca = marcaRepository.save(marca);
        }

        return marca;
    }

    /**
     * Obtiene una marca por su ID.
     * Cachea bajo clave igual a ID y no almacena resultados nulos.
     */
    @Cacheable(value = "marcas", key = "#id", unless = "#result == null")
    public Marca obtenerMarcaPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));
    }

    /**
     * Actualiza una marca existente y limpia la caché "marcas"
     * para que las próximas lecturas reflejen los cambios.
     */
    @Transactional
    @CacheEvict(value = "marcas", allEntries = true)
    public Marca actualizarMarca(Long id, MarcaDTO req) throws IOException {
        Marca marca = obtenerMarcaPorId(id);
        String nuevoNombre = req.getNombre();

        // Validación de nombre
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }
        if (!marca.getNombre().equalsIgnoreCase(nuevoNombre.trim())
                && marcaRepository.existsByNombre(nuevoNombre.trim())) {
            throw new IllegalArgumentException("Ya existe otra marca con ese nombre");
        }
        marca.setNombre(nuevoNombre.trim());

        // Manejo de imagen
        if (req.getImagen() != null && !req.getImagen().isEmpty()) {
            if (marca.getImagen() != null && !marca.getImagen().isEmpty()) {
                File oldImage = new File(uploadDir + marca.getImagen());
                if (oldImage.exists()) {
                    oldImage.delete();
                }
            }
            String nombreImagen = UUID.randomUUID() + "_" + req.getImagen().getOriginalFilename();
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));
            marca.setImagen(nombreImagen);
        }

        return marcaRepository.save(marca);
    }

    /**
     * Elimina una marca y limpia la caché "marcas"
     * para que el listado no incluya la entrada eliminada.
     */
    @CacheEvict(value = "marcas", allEntries = true)
    public void eliminarMarca(Long id) {
        if (!marcaRepository.existsById(id)) {
            throw new IllegalArgumentException("Marca no encontrada");
        }
        marcaRepository.deleteById(id);
    }
}
