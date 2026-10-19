package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.Usuario;
import lombok.Data;

/**
 * Unico formato en que un usuario sale del backend (contrato Dia 2).
 * Nunca incluye password, codigos de reset, token de verificacion.
 */
@Data
public class UsuarioResponse {

    private Integer iduser;
    private String nombre;
    private String apellido;
    private String correo;
    private String celular;
    private String dni;
    private RolResumen rol;


    @Data
    public static class RolResumen {
        private Integer idrol;
        private String nombre;
    }

    public static UsuarioResponse de(Usuario u) {
        if (u == null) {
            return null;
        }
        UsuarioResponse r = new UsuarioResponse();
        r.setIduser(u.getIduser());
        r.setNombre(u.getNombre());
        r.setApellido(u.getApellido());
        r.setCorreo(u.getCorreo());
        r.setCelular(u.getCelular());
        r.setDni(u.getDni());
        if (u.getRol() != null) {
            RolResumen rr = new RolResumen();
            rr.setIdrol(u.getRol().getIdrol());
            rr.setNombre(u.getRol().getNombre());
            r.setRol(rr);
        }
        return r;
    }
}
