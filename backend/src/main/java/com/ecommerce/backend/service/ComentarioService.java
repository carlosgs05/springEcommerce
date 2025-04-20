package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Comentario;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.ComentarioRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.repository.UsuarioRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepo usuarioRepo;

    public Comentario createComentario(Comentario comentario) {
        Long productoId = comentario.getProducto().getIdproducto();
        Integer usuarioId = comentario.getUsuario().getIduser();

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto not found with id " + productoId));
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario not found with id " + usuarioId));

        comentario.setProducto(producto);
        comentario.setUsuario(usuario);
        comentario.setFechacomentario(LocalDateTime.now());

        return comentarioRepository.save(comentario);
    }

    public Comentario updateEstado(Long idProducto, Long idComentario, Integer estado) {
        Comentario comentario = comentarioRepository.findByProductoIdAndComentarioId(idProducto, idComentario)
                .orElseThrow(() -> new RuntimeException("Comentario not found with id " + idComentario + " for producto id " + idProducto));
        comentario.setEstado(estado);
        return comentarioRepository.save(comentario);
    }

    @Transactional(readOnly = true)
    public List<Comentario> getComentariosByEstado(Integer estado) {
        return comentarioRepository.findByEstadoWithProducto(estado);
    }

}