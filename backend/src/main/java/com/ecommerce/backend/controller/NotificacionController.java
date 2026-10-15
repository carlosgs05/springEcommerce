package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Notificacion;
import com.ecommerce.backend.service.NotificacionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/pendientes/{iduser}")
    public ResponseEntity<?> getNoLeidas(@PathVariable Integer iduser) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Notificacion> notificaciones = notificacionService.obtenerNoLeidasPorUsuario(iduser);

            List<Map<String, Object>> data = notificaciones.stream().map(n -> {
                Map<String, Object> m = new HashMap<>();
                m.put("idnotificacion", n.getIdnotificacion());
                m.put("titulo", n.getTitulo());
                m.put("mensaje", n.getMensaje());
                m.put("tipo", n.getTipo());
                m.put("url", n.getUrl());
                m.put("leido", n.getLeido());
                m.put("fecha", n.getFecha());

                Map<String, Object> user = new HashMap<>();
                user.put("iduser", n.getUsuario().getIduser());
                user.put("nombre", n.getUsuario().getNombre());
                user.put("apellido", n.getUsuario().getApellido());
                m.put("usuario", user);

                return m;
            }).toList();

            response.put("success", true);
            response.put("message", "Notificaciones no leídas listadas correctamente");
            response.put("data", data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al listar notificaciones: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/marcar-leido/{id}")
    public ResponseEntity<?> marcarLeido(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            notificacionService.marcarComoLeida(id);
            response.put("success", true);
            response.put("message", "Notificación marcada como leída");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al marcar notificación como leída: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
