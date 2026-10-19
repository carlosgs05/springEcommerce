package com.ecommerce.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepository;

/**
 * Escritura del cambio de rol, aparte de AdminUsuarioService para que @Transactional se aplique de verdad
 * (una llamada interna dentro de la misma clase no pasa por el proxy).
 */
@Service
public class RolPersistencia {

    public enum ResultadoRol { OK, NO_EXISTE, ULTIMO_ADMIN, CAMBIO_CONCURRENTE }

    @Autowired
    private UsuarioRepository usuarios;

    /**
     * Cambia el rol en una transaccion. UPDATE condicionado al rol leido (0 filas = CAMBIO_CONCURRENTE, no toca nada).
     * Al degradar 1->2 bloquea las filas admin (FOR UPDATE) y, si no quedara otro administrador habilitado,
     * devuelve ULTIMO_ADMIN sin cambiar nada. Sube sesion_version en el mismo UPDATE (sus sesiones mueren).
     */
    @Transactional
    public ResultadoRol cambiarRol(Integer iduser, Integer idrolNuevo) {
        Optional<Usuario> ou = usuarios.findById(iduser);
        if (ou.isEmpty()) {
            return ResultadoRol.NO_EXISTE;
        }
        Integer actual = ou.get().getRol() == null ? null : ou.get().getRol().getIdrol();
        if (actual == null) {
            return ResultadoRol.CAMBIO_CONCURRENTE;
        }
        if (actual == 1 && Integer.valueOf(2).equals(idrolNuevo)) {
            boolean quedaOtro = usuarios.bloquearAdminsActivos().stream().anyMatch(id -> !id.equals(iduser));
            if (!quedaOtro) {
                return ResultadoRol.ULTIMO_ADMIN;
            }
        }
        if (usuarios.cambiarRol(iduser, idrolNuevo, actual) != 1) {
            return ResultadoRol.CAMBIO_CONCURRENTE;
        }
        return ResultadoRol.OK;
    }
}
