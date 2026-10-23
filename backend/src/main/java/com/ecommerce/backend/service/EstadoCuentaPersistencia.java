package com.ecommerce.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepository;

/**
 * Escritura del cambio de estado (activo/desactivado), aparte de AdminUsuarioService para que @Transactional
 * se aplique de verdad (una llamada interna dentro de la misma clase no pasa por el proxy). Mismo patron que
 * RolPersistencia.
 */
@Service
public class EstadoCuentaPersistencia {

    public enum ResultadoEstado { OK, NO_EXISTE, ULTIMO_ADMIN, CAMBIO_CONCURRENTE }

    @Autowired
    private UsuarioRepository usuarios;

    /**
     * Cambia el estado en una transaccion. UPDATE condicionado al activo leido (0 filas = CAMBIO_CONCURRENTE,
     * no toca nada). Al desactivar a un administrador bloquea las filas admin activas+habilitadas (FOR UPDATE)
     * y, si no quedara otro administrador activo y habilitado distinto del objetivo, devuelve ULTIMO_ADMIN sin
     * cambiar nada (cubre tanto que se desactive a si mismo como que desactive a otro admin que sea el ultimo).
     * Sube sesion_version en el mismo UPDATE (sus sesiones mueren).
     */
    @Transactional
    public ResultadoEstado cambiarEstado(Integer iduser, boolean activoNuevo) {
        Optional<Usuario> ou = usuarios.findById(iduser);
        if (ou.isEmpty()) {
            return ResultadoEstado.NO_EXISTE;
        }
        Usuario objetivo = ou.get();
        boolean actual = objetivo.isActivo();
        Integer rolActual = objetivo.getRol() == null ? null : objetivo.getRol().getIdrol();
        if (!activoNuevo && rolActual != null && rolActual == 1) {
            boolean quedaOtro = usuarios.bloquearAdminsActivosYHabilitados().stream().anyMatch(id -> !id.equals(iduser));
            if (!quedaOtro) {
                return ResultadoEstado.ULTIMO_ADMIN;
            }
        }
        if (usuarios.cambiarEstado(iduser, activoNuevo, actual) != 1) {
            return ResultadoEstado.CAMBIO_CONCURRENTE;
        }
        return ResultadoEstado.OK;
    }
}
