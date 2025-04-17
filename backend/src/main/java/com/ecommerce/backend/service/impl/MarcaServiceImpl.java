package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.repository.MarcaRepository;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.service.MarcaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaServiceImpl implements MarcaService {

    @Autowired
    private MarcaRepository marcaRepository;

    @Override
    public List<Marca> findAll() {
        return marcaRepository.findAll();
    }

    @Override
    public Marca findById(Integer id) {
        return marcaRepository.findById(id).orElse(null);
    }

    @Override
    public Marca save(Marca marca) {
        return marcaRepository.save(marca);
    }

    @Override
    public void deleteById(Integer id) {
        marcaRepository.deleteById(id);
    }
}