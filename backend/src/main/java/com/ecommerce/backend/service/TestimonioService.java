package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Testimonio;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.TestimonioRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonioService {
    private final TestimonioRepository testimonioRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    public List<Testimonio> listarTestimonios() {
        return testimonioRepository.findAll();
    }

    public List<Testimonio> listarTestimoniosPorEstado(Integer estado) {
        return testimonioRepository.findByEstadoWithUsuario(estado);
    }

    public List<Testimonio> listarTestimoniosPorUsuario(Integer idUsuario) {
        return testimonioRepository.findByUsuario_Iduser(idUsuario);
    }

    public Testimonio crearTestimonio(Testimonio testimonio, Integer idUsuario) {
        if (testimonio.getDescripcion() == null || testimonio.getDescripcion().trim().isEmpty()) {
            throw new IllegalArgumentException("La descripción del testimonio no puede estar vacía");
        }

        if (testimonio.getCalificacion() == null || testimonio.getCalificacion() < 1
                || testimonio.getCalificacion() > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        testimonio.setUsuario(usuario);
        Testimonio guardado = testimonioRepository.save(testimonio);

        // Enviar notificación a administradores
        String titulo = "Nuevo testimonio recibido";
        String mensaje = "Se ha registrado un nuevo testimonio del usuario: " + usuario.getNombre() + " "
                + usuario.getApellido();
        String tipo = "testimonio";
        String url = "admin/testimonios";
        notificacionService.crearNotificacionParaAdmins(titulo, mensaje, tipo, url);

        return guardado;
    }

    public Testimonio actualizarEstadoTestimonio(Integer idTestimonio, Integer nuevoEstado) {
        if (nuevoEstado == null || (nuevoEstado != -1 && nuevoEstado != 0 && nuevoEstado != 1)) {
            throw new IllegalArgumentException(
                    "Estado inválido. Los valores permitidos son: -1 (Pendiente), 0 (Rechazado), 1 (Aprobado)");
        }

        Testimonio testimonio = testimonioRepository.findById(idTestimonio)
                .orElseThrow(() -> new IllegalArgumentException("Testimonio no encontrado"));

        testimonio.setEstado(nuevoEstado);
        return testimonioRepository.save(testimonio);
    }

    // Agrega este método en TestimonioService
    @Transactional(readOnly = true)
    public long contarTestimoniosPendientes() {
        return listarTestimoniosPorEstado(-1).size();
    }
}