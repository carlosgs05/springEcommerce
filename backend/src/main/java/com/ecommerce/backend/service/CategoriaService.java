package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    /**
     * Devuelve la lista completa de categorías.
     * La primera llamada trae los datos de la BD;
     * las siguientes, del caché "categorias".
     */
    @Cacheable(value = "categorias", sync = true)
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    /**
     * Crea una nueva categoría y limpia la caché
     * para que la lista actualizada se recargue en la próxima lectura.
     */
    @CacheEvict(value = "categorias", allEntries = true)
    public Categoria crearCategoria(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría no puede estar vacío");
        }
        if (categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        return categoriaRepository.save(categoria);
    }

    /**
     * Obtiene una categoría por su ID.
     * Se cachea el resultado bajo la clave igual al ID,
     * pero no se almacena si el resultado es null.
     */
    @Cacheable(value = "categorias", key = "#id", unless = "#result == null")
    public Categoria obtenerCategoriaPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
    }

    /**
     * Actualiza una categoría existente y limpia la caché
     * para que la información modificada se recargue.
     */
    @CacheEvict(value = "categorias", allEntries = true)
    public Categoria actualizarCategoria(Long id, Categoria datos) {
        Categoria categoria = obtenerCategoriaPorId(id);
        String nuevoNombre = datos.getNombre();
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría no puede estar vacío");
        }
        if (!categoria.getNombre().equalsIgnoreCase(nuevoNombre.trim())
                && categoriaRepository.existsByNombre(nuevoNombre.trim())) {
            throw new IllegalArgumentException("Ya existe otra categoría con ese nombre");
        }
        categoria.setNombre(nuevoNombre.trim());
        return categoriaRepository.save(categoria);
    }

    /**
     * Elimina una categoría y limpia la caché
     * para que la lista de categorías refleje la eliminación.
     */
    @CacheEvict(value = "categorias", allEntries = true)
    public void eliminarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}
