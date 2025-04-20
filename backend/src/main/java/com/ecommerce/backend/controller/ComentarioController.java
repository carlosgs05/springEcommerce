package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Comentario;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comentarios")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    @PostMapping("/crear")
    public ResponseEntity<?> createComentario(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String descripcion = (String) payload.get("descripcion");
            Long idProducto = Long.valueOf(payload.get("idproducto").toString());
            Integer idUser = (Integer) payload.get("iduser");

            Comentario comentario = new Comentario();
            comentario.setDescripcion(descripcion);
            Usuario usuario = new Usuario();
            usuario.setIduser(idUser);
            comentario.setUsuario(usuario);
            Producto producto = new Producto();
            producto.setIdproducto(idProducto);
            comentario.setProducto(producto);

            Comentario creado = comentarioService.createComentario(comentario);

            // Construir respuesta con producto asociado
            Map<String, Object> data = new HashMap<>();
            data.put("idcomentario", creado.getIdcomentario());
            data.put("descripcion", creado.getDescripcion());
            data.put("fechacomentario", creado.getFechacomentario());
            data.put("estado", creado.getEstado());
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("idproducto", creado.getProducto().getIdproducto());
            productoMap.put("nombre", creado.getProducto().getNombre());
            data.put("producto", productoMap);

            response.put("success", true);
            response.put("message", "Comentario creado correctamente");
            response.put("data", data);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear comentario: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> getComentariosByEstado(@PathVariable Integer estado) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Comentario> comentarios = comentarioService.getComentariosByEstado(estado);
    
            List<Map<String, Object>> data = comentarios.stream().map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("idcomentario", c.getIdcomentario());
                m.put("descripcion", c.getDescripcion());
                m.put("fechacomentario", c.getFechacomentario());
                m.put("estado", c.getEstado());
    
                // Producto asociado
                Map<String, Object> prod = new HashMap<>();
                prod.put("idproducto", c.getProducto().getIdproducto());
                prod.put("nombre", c.getProducto().getNombre());
                m.put("producto", prod);
    
                // Usuario asociado
                Map<String, Object> user = new HashMap<>();
                user.put("iduser", c.getUsuario().getIduser());
                user.put("nombre", c.getUsuario().getNombre());
                user.put("apellido", c.getUsuario().getApellido());
                user.put("correo", c.getUsuario().getCorreo());
                m.put("usuario", user);
    
                return m;
            }).collect(Collectors.toList());
    
            response.put("success", true);
            response.put("message", "Comentarios listados correctamente por estado");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al listar comentarios: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    

    @PutMapping("/estado_update/{idProducto}/{idComentario}")
    public ResponseEntity<?> updateEstado(@PathVariable("idProducto") Long idProducto,
            @PathVariable("idComentario") Long idComentario,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer estado = (Integer) payload.get("estado");

            Comentario actualizado = comentarioService.updateEstado(idProducto, idComentario, estado);

            // Armar data con producto y usuario
            Map<String, Object> data = new HashMap<>();
            data.put("idcomentario", actualizado.getIdcomentario());
            data.put("descripcion", actualizado.getDescripcion());
            data.put("fechacomentario", actualizado.getFechacomentario());
            data.put("estado", actualizado.getEstado());

            // Producto asociado
            Map<String, Object> productoMap = new HashMap<>();
            productoMap.put("idproducto", actualizado.getProducto().getIdproducto());
            productoMap.put("nombre", actualizado.getProducto().getNombre());
            data.put("producto", productoMap);

            // Usuario asociado
            Map<String, Object> usuarioMap = new HashMap<>();
            usuarioMap.put("iduser", actualizado.getUsuario().getIduser());
            usuarioMap.put("nombre", actualizado.getUsuario().getNombre());
            usuarioMap.put("apellido", actualizado.getUsuario().getApellido());
            usuarioMap.put("correo", actualizado.getUsuario().getCorreo());
            data.put("usuario", usuarioMap);

            response.put("success", true);
            response.put("message", "Estado del comentario actualizado correctamente");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar estado del comentario: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

}