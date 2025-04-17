package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Comentario;
import java.util.List;

public interface ComentarioService {
    List<Comentario> findAll();
    Comentario findById(Integer id);
    Comentario save(Comentario comentario);
    void deleteById(Integer id);
    List<Comentario> findByUsuario(Integer usuarioId);
}