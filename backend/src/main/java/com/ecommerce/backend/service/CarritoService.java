package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CarritoDTO;
import com.ecommerce.backend.entity.Carrito;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.CarritoRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarritoService {
    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;

    // Buscar carrito por usuario
    public Optional<Carrito> obtenerCarritoPorUsuario(Integer idUsuario) {
        return carritoRepository.findByUsuario_Iduser(idUsuario);
    }

    // Guardar o actualizar carrito (sincronización)
    public Carrito guardarActualizarCarrito(CarritoDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIduser())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Carrito carrito = carritoRepository.findByUsuario_Iduser(dto.getIduser())
                .orElse(new Carrito());

        carrito.setUsuario(usuario);
        carrito.setListaProductos(dto.getListaProductos());

        return carritoRepository.save(carrito);
    }

    // Eliminar carrito por usuario (logout o finalizar compra)
    @Transactional
    public void eliminarCarritoPorUsuario(Integer idUsuario) {
        carritoRepository.deleteByUsuario_Iduser(idUsuario);
    }
}