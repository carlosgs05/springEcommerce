package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.ToString;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@Getter
@Setter
@Table(name = "usuario")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iduser")
    private Integer iduser;

    @Column(name = "nombre", length = 50)
    private String nombre;

    @Column(name = "apellido", length = 50)
    private String apellido;

    @Column(name = "dni", length = 8)
    private String dni;

    @Column(name = "correo", length = 100)
    private String correo;

    @JsonIgnore
    @ToString.Exclude
    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "celular", length = 9)
    private String celular;

    @JsonIgnore
    @ToString.Exclude
    @Column(name = "reset_code")
    private Integer resetCode;

    @JsonIgnore
    @Column(name = "reset_code_expires_at", columnDefinition = "TIMESTAMP")
    private LocalDateTime resetCodeExpiresAt;

    @JsonIgnore
    @ToString.Exclude
    @Column(name = "verification_token", length = 255)
    private String verificationToken;

    @Column(name = "is_enabled")
    private boolean enabled;

    // --- Activo/desactivado por un administrador (migracion V8); distinto de is_enabled (correo verificado) ---
    @Column(name = "activo")
    private boolean activo = true;

    @JsonIgnore
    @Column(name = "token_expiration", columnDefinition = "TIMESTAMP")
    private LocalDateTime tokenExpiration;

    // --- Cambio de correo pendiente (migracion V3) ---
    @JsonIgnore
    @Column(name = "correo_pendiente", length = 100)
    private String correoPendiente;

    @JsonIgnore
    @ToString.Exclude
    @Column(name = "correo_pendiente_codigo")
    private Integer correoPendienteCodigo;

    @JsonIgnore
    @Column(name = "correo_pendiente_expira", columnDefinition = "TIMESTAMP")
    private LocalDateTime correoPendienteExpira;

    // --- Cierre Dia 2 (migracion V5): version de sesion; sube al cambiar rol o confirmar cambio de correo
    // y mata todos los JWT emitidos antes (claim "sv"). ---
    @JsonIgnore
    @Column(name = "sesion_version", nullable = false)
    private int sesionVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idrol", referencedColumnName = "idrol")
    private Rol rol;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Carrito> carritos;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comentario> comentarios;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Testimonio> testimonios;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(rol.getNombre()));
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

}