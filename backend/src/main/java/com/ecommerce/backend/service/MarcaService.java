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
}