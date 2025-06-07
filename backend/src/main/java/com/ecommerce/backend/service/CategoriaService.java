package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    public Categoria crearCategoria(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría no puede estar vacío");
        }
        
        if (categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        
        return categoriaRepository.save(categoria);
    }

    // Método para obtener una categoría por su ID
    public Categoria obtenerCategoriaPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
    }

    // Método para actualizar una categoría existente
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

    // Método para eliminar una categoría
    public void eliminarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}