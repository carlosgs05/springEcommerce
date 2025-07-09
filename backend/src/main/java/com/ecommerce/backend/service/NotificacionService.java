package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Notificacion;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.NotificacionRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void crearNotificacionParaAdmins(String titulo, String mensaje, String tipo, String url) {
        List<Usuario> admins = usuarioRepository.findAllByRolId(1); // usuarios con rol ADMIN

        for (Usuario admin : admins) {
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo(titulo);
            notificacion.setMensaje(mensaje);
            notificacion.setTipo(tipo);
            notificacion.setUrl(url);
            notificacion.setUsuario(admin);
            notificacionRepository.save(notificacion);
        }
    }

    @Transactional
    public void crearNotificacionParaUsuario(Usuario usuario, String titulo, String mensaje, String tipo, String url) {
        Notificacion notificacion = new Notificacion();
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setTipo(tipo);
        notificacion.setUrl(url);
        notificacion.setUsuario(usuario);
        notificacionRepository.save(notificacion);
    }

    public List<Notificacion> obtenerNoLeidasPorUsuario(Integer iduser) {
        return notificacionRepository.findByUsuarioIduserAndLeidoFalseOrderByFechaDesc(iduser);
    }

    public void marcarComoLeida(Long idnotificacion) {
        Notificacion n = notificacionRepository.findById(idnotificacion)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeido(true);
        notificacionRepository.save(n);
    }
}
