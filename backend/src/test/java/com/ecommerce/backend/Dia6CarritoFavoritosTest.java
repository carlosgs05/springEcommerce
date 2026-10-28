package com.ecommerce.backend;

import com.ecommerce.backend.config.JWTAuthFilter;
import com.ecommerce.backend.config.SecurityConfig;
import com.ecommerce.backend.controller.CarritoController;
import com.ecommerce.backend.controller.FavoritoController;
import com.ecommerce.backend.controller.ProductoController;
import com.ecommerce.backend.dto.ProductoDTO;
import com.ecommerce.backend.entity.Carrito;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.CarritoService;
import com.ecommerce.backend.service.FavoritoService;
import com.ecommerce.backend.service.JWTUtils;
import com.ecommerce.backend.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Dia 6: carrito (corregido de IDOR) + favoritos (nuevo) + comparador de productos.
 * Sin base real: servicios simulados, foco en el contrato HTTP y en que el id de usuario
 * SIEMPRE sale del token, nunca de la URL/body.
 */
@WebMvcTest({CarritoController.class, FavoritoController.class, ProductoController.class})
@Import({SecurityConfig.class, JWTAuthFilter.class, JWTUtils.class})
@TestPropertySource(properties = {"app.jwt.secret=" + Dia6CarritoFavoritosTest.SECRETO})
class Dia6CarritoFavoritosTest {

    static final String SECRETO = "dGVzdC1zZWNyZXRvLXBhcmEtcHJ1ZWJhcy1kZS1qd3QtMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dQ==";

    @Autowired MockMvc mvc;
    @Autowired JWTUtils jwt;
    @MockitoBean CarritoService carritoService;
    @MockitoBean FavoritoService favoritoService;
    @MockitoBean ProductoService productoService;
    // UsuarioDetailsService lo necesita SecurityConfig/DaoAuthenticationProvider, aunque no se use en estas rutas.
    @MockitoBean com.ecommerce.backend.service.UsuarioDetailsService usuarioDetailsService;

    Usuario ana, beto;

    private Usuario usuario(int id, String correo) {
        Rol r = new Rol();
        r.setIdrol(2);
        r.setNombre("CLIENTE");
        Usuario u = new Usuario();
        u.setIduser(id);
        u.setCorreo(correo);
        u.setPassword("x");
        u.setEnabled(true);
        u.setRol(r);
        return u;
    }

    @BeforeEach
    void preparar() {
        ana = usuario(1, "ana@x.com");
        beto = usuario(2, "beto@x.com");
        when(usuarioDetailsService.loadUserByUsername("ana@x.com")).thenReturn(ana);
        when(usuarioDetailsService.loadUserByUsername("beto@x.com")).thenReturn(beto);
    }

    private String bearer(Usuario u) {
        return "Bearer " + jwt.generateToken(u);
    }

    // --- Sin sesion: 401 en los 3 de carrito y los 4 de favoritos ---

    @Test
    void carritoSinSesionDa401() throws Exception {
        mvc.perform(get("/api/carrito")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/carrito/guardar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"listaProductos\":\"[]\"}")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/carrito")).andExpect(status().isUnauthorized());
    }

    @Test
    void favoritosSinSesionDa401() throws Exception {
        mvc.perform(get("/api/favoritos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/favoritos/ids")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/favoritos/5")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/favoritos/5")).andExpect(status().isUnauthorized());
    }

    // --- Carrito: el id de usuario sale del token, nunca de la URL/body ---

    @Test
    void carritoGetUsaIdDeLaSesion() throws Exception {
        when(carritoService.obtenerCarritoPorUsuario(1)).thenReturn(Optional.empty());
        mvc.perform(get("/api/carrito").header("Authorization", bearer(ana)))
                .andExpect(status().isOk());
        verify(carritoService).obtenerCarritoPorUsuario(1);
        verify(carritoService, never()).obtenerCarritoPorUsuario(2);
    }

    @Test
    void carritoGuardarUsaIdDeLaSesionIgnorandoCualquierOtro() throws Exception {
        Carrito c = new Carrito();
        when(carritoService.guardarActualizarCarrito(eq(2), any())).thenReturn(c);
        // beto manda su token; aunque el body no tiene (ya no existe) campo iduser, probamos
        // que el servicio se invoca con el id de beto (2), no con otro.
        mvc.perform(post("/api/carrito/guardar").header("Authorization", bearer(beto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"listaProductos\":\"[{\\\"id\\\":1}]\"}"))
                .andExpect(status().isOk());
        verify(carritoService).guardarActualizarCarrito(eq(2), any());
        verify(carritoService, never()).guardarActualizarCarrito(eq(1), any());
    }

    @Test
    void carritoDeleteUsaIdDeLaSesion() throws Exception {
        mvc.perform(delete("/api/carrito").header("Authorization", bearer(ana)))
                .andExpect(status().isOk());
        verify(carritoService).eliminarCarritoPorUsuario(1);
    }

    // --- Favoritos: no hay id en ninguna URL; siempre debe salir del token ---

    @Test
    void favoritosAgregarUsaIdDeLaSesion() throws Exception {
        mvc.perform(post("/api/favoritos/10").header("Authorization", bearer(beto)))
                .andExpect(status().isOk());
        verify(favoritoService).agregarFavorito(2, 10L);
        verify(favoritoService, never()).agregarFavorito(1, 10L);
    }

    @Test
    void favoritosQuitarUsaIdDeLaSesion() throws Exception {
        mvc.perform(delete("/api/favoritos/10").header("Authorization", bearer(ana)))
                .andExpect(status().isOk());
        verify(favoritoService).quitarFavorito(1, 10L);
    }

    @Test
    void favoritosListarYIdsUsanIdDeLaSesion() throws Exception {
        when(favoritoService.listarFavoritos(1)).thenReturn(List.of());
        when(favoritoService.listarIdsFavoritos(1)).thenReturn(List.of());
        mvc.perform(get("/api/favoritos").header("Authorization", bearer(ana))).andExpect(status().isOk());
        mvc.perform(get("/api/favoritos/ids").header("Authorization", bearer(ana))).andExpect(status().isOk());
        verify(favoritoService).listarFavoritos(1);
        verify(favoritoService).listarIdsFavoritos(1);
    }

    @Test
    void favoritosAgregarProductoInexistenteDa400() throws Exception {
        doThrow(new IllegalArgumentException("Producto no encontrado"))
                .when(favoritoService).agregarFavorito(1, 999L);
        mvc.perform(post("/api/favoritos/999").header("Authorization", bearer(ana)))
                .andExpect(status().isBadRequest());
    }

    // --- Comparador: publico, hasta 3 ids, omite los que no existan ---

    @Test
    void compararEsPublicoYDevuelveLosProductosEncontrados() throws Exception {
        ProductoDTO p1 = new ProductoDTO();
        p1.setIdproducto(1L);
        ProductoDTO p2 = new ProductoDTO();
        p2.setIdproducto(2L);
        when(productoService.compararProductos(List.of(1L, 2L, 3L))).thenReturn(List.of(p1, p2));
        mvc.perform(get("/api/productos/comparar?ids=1,2,3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }
}
