package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcaService {
    private final MarcaRepository marcaRepository;

    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    public Marca crearMarca(Marca marca) {
        if (marca.getNombre() == null || marca.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }
        
        // Validar si la marca ya existe
        if (marcaRepository.existsByNombre(marca.getNombre())) {
            throw new IllegalArgumentException("Ya existe una marca con ese nombre");
        }
        
        return marcaRepository.save(marca);
    }

    // Método para obtener una marca por su ID
    public Marca obtenerMarcaPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));
    }

    // Método para actualizar una marca existente
    public Marca actualizarMarca(Long id, Marca datos) {
        Marca marca = obtenerMarcaPorId(id);
        String nuevoNombre = datos.getNombre();
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }
        if (!marca.getNombre().equalsIgnoreCase(nuevoNombre.trim())
                && marcaRepository.existsByNombre(nuevoNombre.trim())) {
            throw new IllegalArgumentException("Ya existe otra marca con ese nombre");
        }
        marca.setNombre(nuevoNombre.trim());
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