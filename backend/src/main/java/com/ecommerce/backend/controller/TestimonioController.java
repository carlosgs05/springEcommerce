package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Testimonio;
import com.ecommerce.backend.service.TestimonioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testimonios")
@RequiredArgsConstructor
public class TestimonioController {
    private final TestimonioService testimonioService;

    @GetMapping("/listar")
    public ResponseEntity<?> listarTodos() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Testimonio> testimonios = testimonioService.listarTestimonios();
            response.put("success", true);
            response.put("message", "Testimonios listados correctamente");
            response.put("data", testimonios);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al listar testimonios: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> listarPorEstado(@PathVariable Integer estado) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Testimonio> testimonios = testimonioService.listarTestimoniosPorEstado(estado);

            // Mapeamos los testimonios con la información necesaria del usuario
            List<Map<String, Object>> testimoniosConUsuario = testimonios.stream()
                    .map(testimonio -> {
                        Map<String, Object> testimonioMap = new HashMap<>();
                        testimonioMap.put("idtestimonio", testimonio.getIdtestimonio());
                        testimonioMap.put("descripcion", testimonio.getDescripcion());
                        testimonioMap.put("fechatestimonio", testimonio.getFechatestimonio());
                        testimonioMap.put("estado", testimonio.getEstado());

                        if (testimonio.getUsuario() != null) {
                            Map<String, Object> usuarioMap = new HashMap<>();
                            usuarioMap.put("iduser", testimonio.getUsuario().getIduser());
                            usuarioMap.put("nombre", testimonio.getUsuario().getNombre());
                            usuarioMap.put("apellido", testimonio.getUsuario().getApellido());
                            usuarioMap.put("correo", testimonio.getUsuario().getCorreo());
                            testimonioMap.put("usuario", usuarioMap);
                        }

                        return testimonioMap;
                    })
                    .toList();

            response.put("success", true);
            response.put("message", "Testimonios listados por estado correctamente");
            response.put("data", testimoniosConUsuario);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al listar testimonios por estado: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable Integer idUsuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Testimonio> testimonios = testimonioService.listarTestimoniosPorUsuario(idUsuario);
            response.put("success", true);
            response.put("message", "Testimonios del usuario listados correctamente");
            response.put("data", testimonios);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al listar testimonios del usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/crear/{idUsuario}")
    public ResponseEntity<?> crearTestimonio(@RequestBody Testimonio testimonio, @PathVariable Integer idUsuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            Testimonio nuevoTestimonio = testimonioService.crearTestimonio(testimonio, idUsuario);
            response.put("success", true);
            response.put("message", "Testimonio creado correctamente");
            response.put("data", nuevoTestimonio);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear testimonio: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/estado_update/{idTestimonio}")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Integer idTestimonio,
            @RequestBody Map<String, Integer> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (!request.containsKey("estado")) {
                throw new IllegalArgumentException("El campo 'estado' es requerido");
            }

            Integer estado = request.get("estado");
            Testimonio testimonioActualizado = testimonioService.actualizarEstadoTestimonio(idTestimonio, estado);

            response.put("success", true);
            response.put("message", "Estado del testimonio actualizado correctamente");
            response.put("data", testimonioActualizado);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar estado del testimonio: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}