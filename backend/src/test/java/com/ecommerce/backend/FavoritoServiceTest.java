package com.ecommerce.backend;

import com.ecommerce.backend.entity.Favorito;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.FavoritoRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.service.FavoritoService;
import com.ecommerce.backend.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Toggle de favorito: idempotente, no duplica si se llama dos veces. */
class FavoritoServiceTest {

    @Mock FavoritoRepository favoritoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock ProductoRepository productoRepository;
    @Mock ProductoService productoService;

    FavoritoService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new FavoritoService(favoritoRepository, usuarioRepository, productoRepository, productoService);
    }

    @Test
    void agregarDosVecesNoDuplica() {
        Usuario u = new Usuario();
        u.setIduser(1);
        Producto p = new Producto();
        p.setIdproducto(10L);

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(u));
        when(productoRepository.findById(10L)).thenReturn(Optional.of(p));
        // primera llamada: no existe aun
        when(favoritoRepository.findByUsuario_IduserAndProducto_Idproducto(1, 10L))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new Favorito()));

        service.agregarFavorito(1, 10L);
        service.agregarFavorito(1, 10L);

        verify(favoritoRepository, times(1)).save(any(Favorito.class));
    }

    @Test
    void agregarProductoInexistenteLanzaExcepcion() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(new Usuario()));
        when(productoRepository.findById(999L)).thenReturn(Optional.empty());
        when(favoritoRepository.findByUsuario_IduserAndProducto_Idproducto(1, 999L))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.agregarFavorito(1, 999L));
        verify(favoritoRepository, never()).save(any());
    }

    @Test
    void quitarDosVecesNoFalla() {
        service.quitarFavorito(1, 10L);
        service.quitarFavorito(1, 10L);
        verify(favoritoRepository, times(2)).deleteByUsuario_IduserAndProducto_Idproducto(1, 10L);
    }
}
