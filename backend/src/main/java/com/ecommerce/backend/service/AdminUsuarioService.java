package com.ecommerce.backend.service;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.CambiarRolRequest;
import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.dto.UsuarioResponse;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepository;

/**
 * Acciones de administracion de cuentas. Quien actua (el admin) sale SIEMPRE de la sesion; el body solo trae el rol nuevo.
 */
@Service
public class AdminUsuarioService {

    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioService.class);

    static final int ROL_ADMIN = 1;
    static final int ROL_CLIENTE = 2;
    static final String MSG_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";

    @Autowired
    private UsuarioRepository usuarios;
    @Autowired
    private RolPersistencia persistencia;
    @Autowired
    private EmailService emailService;

    private static UsuarioDTO r(int status, String msg) {
        UsuarioDTO d = new UsuarioDTO();
        d.setStatusCode(status);
        d.setMessage(msg);
        return d;
    }

    private static UsuarioDTO campo(int status, String msg, String campo) {
        UsuarioDTO d = r(status, msg);
        d.setFieldErrors(Map.of(campo, msg));
        return d;
    }

    /**
     * PUT /api/admin/usuarios/{iduser}/rol. Orden: rol valido -> usuario existe -> no es uno mismo -> mismo rol (200 sin
     * cambios) -> cambio (rol + sesion_version en una transaccion; correo al afectado despues del commit).
     */
    public UsuarioDTO cambiarRol(Usuario admin, Integer iduser, CambiarRolRequest req, String ipCruda) {
        final String ip = Auditoria.limpiarIp(ipCruda);
        try {
            if (admin == null) {
                return r(401, "Sesión no válida o expirada");
            }
            Integer nuevo = req == null ? null : req.getIdrol();
            if (req == null || req.isIdrolInvalido() || nuevo == null || (nuevo != ROL_ADMIN && nuevo != ROL_CLIENTE)) {
                return campo(400, "Rol no válido", "idrol");
            }
            Optional<Usuario> ou = iduser == null ? Optional.empty() : usuarios.findById(iduser);
            if (ou.isEmpty()) {
                return r(404, "Usuario no encontrado");
            }
            Usuario objetivo = ou.get();
            if (admin.getIduser().equals(objetivo.getIduser())) {
                return r(409, "No puedes cambiar tu propio rol");
            }
            Integer actual = objetivo.getRol() == null ? null : objetivo.getRol().getIdrol();
            if (nuevo.equals(actual)) {   // ya tiene ese rol: 200 sin cambios
                UsuarioDTO ok = r(200, "Rol actualizado");
                ok.setUsuario(UsuarioResponse.de(objetivo));
                return ok;
            }
            switch (persistencia.cambiarRol(objetivo.getIduser(), nuevo)) {
                case NO_EXISTE:
                    return r(404, "Usuario no encontrado");
                case ULTIMO_ADMIN:
                    return r(409, "No se puede quitar el último administrador");
                case CAMBIO_CONCURRENTE:
                    return r(409, "El rol cambió mientras tanto, vuelve a intentarlo");
                default:
                    break;
            }
            Auditoria.rolCambiado(admin.getIduser(), objetivo.getIduser(), actual, nuevo, ip);
            log.info("Rol cambiado (admin={}, objetivo={}, {} -> {})", admin.getIduser(), objetivo.getIduser(), actual, nuevo);
            final String correo = objetivo.getCorreo();
            final String nombre = objetivo.getNombre();
            final String nombreRol = nuevo == ROL_ADMIN ? "administrador" : "cliente";
            CorreoSegundoPlano.enviar("aviso cambio de rol", () -> emailService.sendRolCambiadoEmail(correo, nombre, nombreRol));
            UsuarioDTO ok = r(200, "Rol actualizado");
            ok.setUsuario(UsuarioResponse.de(usuarios.findById(objetivo.getIduser()).orElse(objetivo)));
            return ok;
        } catch (Exception e) {
            log.error("Fallo al cambiar el rol (admin={}, objetivo={})", admin == null ? null : admin.getIduser(), iduser, e);
            return r(500, MSG_GENERICO);
        }
    }
}
