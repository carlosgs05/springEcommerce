package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

  @Query("SELECT u FROM Usuario u WHERE u.iduser = :iduser")
  Optional<Usuario> findByIdUser(@Param("iduser") Integer iduser);

  @Query("""
        SELECT DISTINCT u
          FROM Usuario u
          JOIN FETCH u.rol r
          LEFT JOIN FETCH r.permisos rp
          LEFT JOIN FETCH rp.permiso p
         WHERE lower(u.correo) = lower(:correo)
      """)
  Optional<Usuario> findByCorreo(@Param("correo") String correo);

  Optional<Usuario> findByVerificationToken(String token);

  // ---- UPDATE puntuales: solo tocan sus columnas, asi ninguna operacion puede pisar otras con valores
  // viejos (guardar la fila entera si lo haria). clearAutomatically
  // vacia el contexto de persistencia para que la siguiente lectura traiga lo que hay de verdad en la base. ----

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.nombre = :nombre, u.apellido = :apellido, u.celular = :celular WHERE u.iduser = :iduser")
  int actualizarPerfil(@Param("iduser") Integer iduser, @Param("nombre") String nombre,
                       @Param("apellido") String apellido, @Param("celular") String celular);

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.password = :hash, u.correoPendiente = null, u.correoPendienteCodigo = null, "
       + "u.correoPendienteExpira = null WHERE u.iduser = :iduser")
  int cambiarPassword(@Param("iduser") Integer iduser, @Param("hash") String hash);

  /**
   * Clave nueva + codigo anulado en un solo UPDATE, y solo si el codigo sigue siendo ese y vigente.
   * Tambien anula un cambio de correo pendiente.
   */
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.password = :hash, u.resetCode = null, u.resetCodeExpiresAt = null, "
       + "u.correoPendiente = null, u.correoPendienteCodigo = null, u.correoPendienteExpira = null "
       + "WHERE u.iduser = :iduser AND u.resetCode = :codigo "
       + "AND u.resetCodeExpiresAt >= :ahora")
  int restablecerPassword(@Param("iduser") Integer iduser, @Param("hash") String hash, @Param("codigo") Integer codigo,
                          @Param("ahora") LocalDateTime ahora);

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.resetCode = :codigo, u.resetCodeExpiresAt = :vence WHERE u.iduser = :iduser")
  int guardarCodigoReset(@Param("iduser") Integer iduser, @Param("codigo") Integer codigo,
                         @Param("vence") LocalDateTime vence);

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.resetCode = null, u.resetCodeExpiresAt = null "
       + "WHERE u.iduser = :iduser")
  int anularCodigoReset(@Param("iduser") Integer iduser);

  /** Activa la cuenta solo si el token de verificacion sigue siendo ese (un enlace sirve una sola vez). */
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.enabled = true, u.verificationToken = null, u.tokenExpiration = null "
       + "WHERE u.iduser = :iduser AND u.verificationToken = :token")
  int activarCuenta(@Param("iduser") Integer iduser, @Param("token") String token);

  /** Borra la cuenta solo si sigue sin verificar (no borra una recien activada). */
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("DELETE FROM Usuario u WHERE u.iduser = :iduser AND u.enabled = false")
  int borrarSiNoVerificada(@Param("iduser") Integer iduser);

  /** Misma comparacion que el indice unico uq_usuario_correo_lower (V6): sin distinguir mayusculas. */
  @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE lower(u.correo) = lower(:correo)")
  boolean existsByCorreo(@Param("correo") String correo);

  // ---- Cambiar correo: pedido pendiente (correo nuevo + codigo + vencimiento) ----

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.correoPendiente = :correo, u.correoPendienteCodigo = :codigo, "
       + "u.correoPendienteExpira = :vence WHERE u.iduser = :iduser")
  int guardarCorreoPendiente(@Param("iduser") Integer iduser, @Param("correo") String correo,
                             @Param("codigo") Integer codigo, @Param("vence") LocalDateTime vence);

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.correoPendiente = null, u.correoPendienteCodigo = null, "
       + "u.correoPendienteExpira = null WHERE u.iduser = :iduser")
  int anularCorreoPendiente(@Param("iduser") Integer iduser);

  /** Confirma el cambio en UN UPDATE: solo si el codigo sigue siendo ese y no vencio (uso unico, atomico). */
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.correo = u.correoPendiente, u.correoPendiente = null, "
       + "u.correoPendienteCodigo = null, u.correoPendienteExpira = null, u.sesionVersion = u.sesionVersion + 1 "
       + "WHERE u.iduser = :iduser AND u.correoPendiente IS NOT NULL AND u.correoPendienteCodigo = :codigo "
       + "AND u.correoPendienteExpira >= :ahora")
  int confirmarCambioCorreo(@Param("iduser") Integer iduser, @Param("codigo") Integer codigo,
                            @Param("ahora") LocalDateTime ahora);

  // ---- Cambio de rol (lo usa RolPersistencia) ----

  /** Cambia el rol y sube la version de sesion, solo si el rol sigue siendo rolActual (0 filas = cambio concurrente). */
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("UPDATE Usuario u SET u.rol.idrol = :idrol, u.sesionVersion = u.sesionVersion + 1 "
       + "WHERE u.iduser = :iduser AND u.rol.idrol = :rolActual")
  int cambiarRol(@Param("iduser") Integer iduser, @Param("idrol") Integer idrol, @Param("rolActual") Integer rolActual);

  /** Bloquea (FOR UPDATE) las filas de administradores habilitados y devuelve sus ids. Solo dentro de una transaccion. */
  @Query(value = "SELECT iduser FROM usuario WHERE idrol = 1 AND is_enabled = true ORDER BY iduser FOR UPDATE",
         nativeQuery = true)
  List<Integer> bloquearAdminsActivos();

  List<Usuario> findByEnabledFalseAndTokenExpirationBefore(LocalDateTime expirationTime);

  @Query("SELECT u FROM Usuario u WHERE u.rol.idrol = :idrol")
  List<Usuario> findAllByRolId(@Param("idrol") Integer idrol);

}