package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.FavoritoDTO;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.FavoritoService;
import com.ecommerce.backend.service.SesionActual;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {
    private static final Logger log = LoggerFactory.getLogger(FavoritoController.class);
    private static final String MSG_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";

    private final FavoritoService favoritoService;

    /** Dueño del token de sesion (typ=access); SIEMPRE de la sesion, nunca de un parametro. */
    private static Integer idSesion() {
        return SesionActual.usuarioAccess().map(Usuario::getIduser).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> listarFavoritos() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<FavoritoDTO> favoritos = favoritoService.listarFavoritos(idSesion());
            response.put("success", true);
            response.put("data", favoritos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al listar favoritos", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/ids")
    public ResponseEntity<?> listarIdsFavoritos() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Long> ids = favoritoService.listarIdsFavoritos(idSesion());
            response.put("success", true);
            response.put("data", ids);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al listar ids de favoritos", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/{idProducto}")
    public ResponseEntity<?> agregarFavorito(@PathVariable Long idProducto) {
        Map<String, Object> response = new HashMap<>();
        try {
            favoritoService.agregarFavorito(idSesion(), idProducto);
            response.put("success", true);
            response.put("message", "Producto agregado a favoritos");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al agregar favorito", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{idProducto}")
    public ResponseEntity<?> quitarFavorito(@PathVariable Long idProducto) {
        Map<String, Object> response = new HashMap<>();
        try {
            favoritoService.quitarFavorito(idSesion(), idProducto);
            response.put("success", true);
            response.put("message", "Producto quitado de favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al quitar favorito", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }
}
