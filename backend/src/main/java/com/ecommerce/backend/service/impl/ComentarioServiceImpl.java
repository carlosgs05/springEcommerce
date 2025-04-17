package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.repository.ComentarioRepository;
import com.ecommerce.backend.entity.Comentario;
import com.ecommerce.backend.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComentarioServiceImpl implements ComentarioService {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Override
    public List<Comentario> findAll() {
        return comentarioRepository.findAll();
    }

    @Override
    public Comentario findById(Integer id) {
        return comentarioRepository.findById(id).orElse(null);
    }

    @Override
    public Comentario save(Comentario comentario) {
        return comentarioRepository.save(comentario);
    }

    @Override
    public void deleteById(Integer id) {
        comentarioRepository.deleteById(id);
    }

    @Override
    public List<Comentario> findByUsuario(Integer usuarioId) {
        return comentarioRepository.findByUsuarioId(usuarioId);
    }
}