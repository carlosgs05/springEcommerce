package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "celular", length = 9)
    private String celular;

    @Column(name = "reset_code")
    private Integer resetCode;

    @Column(name = "reset_code_expires_at", columnDefinition = "TIMESTAMP")
    private LocalDateTime resetCodeExpiresAt;

    @Column(name = "verification_token", length = 255)
    private String verificationToken;

    @Column(name = "is_enabled")
    private boolean enabled;

    @Column(name = "token_expiration", columnDefinition = "TIMESTAMP")
    private LocalDateTime tokenExpiration;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idrol", referencedColumnName = "idrol")
    private Rol rol;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comentario> comentarios;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Testimonio> testimonios;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Venta> ventas = new ArrayList<>();

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