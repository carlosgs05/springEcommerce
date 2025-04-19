package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Testimonio;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.TestimonioRepository;
import com.ecommerce.backend.repository.UsuarioRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonioService {
    private final TestimonioRepository testimonioRepository;
    private final UsuarioRepo usuarioRepository;

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

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        testimonio.setUsuario(usuario);
        return testimonioRepository.save(testimonio);
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
}