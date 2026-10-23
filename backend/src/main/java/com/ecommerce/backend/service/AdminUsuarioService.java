package com.ecommerce.backend.service;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.CambiarEstadoRequest;
import com.ecommerce.backend.dto.CambiarRolRequest;
import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.dto.UsuarioResponse;
import com.ecommerce.backend.dto.UsuariosPaginaResponse;
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
    private EstadoCuentaPersistencia estadoPersistencia;
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

    private static UsuariosPaginaResponse rPagina(int status, String msg) {
        UsuariosPaginaResponse d = new UsuariosPaginaResponse();
        d.setStatusCode(status);
        d.setMessage(msg);
        return d;
    }

    /** GET /api/admin/usuarios. Busqueda opcional por nombre/apellido/correo; page/size acotados. */
    public UsuariosPaginaResponse listarUsuarios(Usuario admin, String search, Integer page, Integer size) {
        try {
            if (admin == null) {
                return rPagina(401, "Sesión no válida o expirada");
            }
            int sizeFinal = (size == null || size <= 0 || size > 50) ? 10 : size;
            int pageFinal = (page == null || page < 0) ? 0 : page;
            Pageable pageable = PageRequest.of(pageFinal, sizeFinal, Sort.by("iduser").ascending());
            var pagina = (search == null || search.isBlank())
                    ? usuarios.findAll(pageable)
                    : usuarios.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrCorreoContainingIgnoreCase(
                        search, search, search, pageable);
            UsuariosPaginaResponse r = rPagina(200, "OK");
            r.setContent(pagina.getContent().stream().map(UsuarioResponse::de).toList());
            r.setPage(pagina.getNumber());
            r.setSize(pagina.getSize());
            r.setTotalElements(pagina.getTotalElements());
            r.setTotalPages(pagina.getTotalPages());
            return r;
        } catch (Exception e) {
            log.error("Fallo al listar usuarios (admin={})", admin == null ? null : admin.getIduser(), e);
            return rPagina(500, MSG_GENERICO);
        }
    }

    /**
     * PUT /api/admin/usuarios/{iduser}/estado. Orden: body valido -> usuario existe -> mismo estado (200 sin
     * cambios) -> cambio (activo + sesion_version en una transaccion, protegido contra dejar 0 admins activos).
     */
    public UsuarioDTO cambiarEstado(Usuario admin, Integer iduser, CambiarEstadoRequest req, String ipCruda) {
        final String ip = Auditoria.limpiarIp(ipCruda);
        try {
            if (admin == null) {
                return r(401, "Sesión no válida o expirada");
            }
            if (req == null || req.getActivo() == null) {
                return campo(400, "Estado no válido", "activo");
            }
            boolean nuevo = req.getActivo();
            Optional<Usuario> ou = iduser == null ? Optional.empty() : usuarios.findById(iduser);
            if (ou.isEmpty()) {
                return r(404, "Usuario no encontrado");
            }
            Usuario objetivo = ou.get();
            if (nuevo == objetivo.isActivo()) {   // ya esta en ese estado: 200 sin cambios
                UsuarioDTO ok = r(200, "Estado actualizado");
                ok.setUsuario(UsuarioResponse.de(objetivo));
                return ok;
            }
            switch (estadoPersistencia.cambiarEstado(objetivo.getIduser(), nuevo)) {
                case NO_EXISTE:
                    return r(404, "Usuario no encontrado");
                case ULTIMO_ADMIN:
                    return r(409, "No se puede desactivar al único administrador activo");
                case CAMBIO_CONCURRENTE:
                    return r(409, "El estado cambió mientras tanto, vuelve a intentarlo");
                default:
                    break;
            }
            String evento = nuevo ? "cuenta_reactivada" : "cuenta_desactivada";
            Auditoria.evento(evento, objetivo.getIduser(), ip);
            log.info("Estado de cuenta cambiado (admin={}, objetivo={}, activo={})", admin.getIduser(), objetivo.getIduser(), nuevo);
            UsuarioDTO ok = r(200, "Estado actualizado");
            ok.setUsuario(UsuarioResponse.de(usuarios.findById(objetivo.getIduser()).orElse(objetivo)));
            return ok;
        } catch (Exception e) {
            log.error("Fallo al cambiar el estado (admin={}, objetivo={})", admin == null ? null : admin.getIduser(), iduser, e);
            return r(500, MSG_GENERICO);
        }
    }
}
