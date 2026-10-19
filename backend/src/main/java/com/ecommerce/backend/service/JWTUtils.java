package com.ecommerce.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import com.ecommerce.backend.entity.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Date;

@Component
public class JWTUtils {

    private SecretKey Key;
    private  static  final long EXPIRATION_TIME = 86400000;  //24 hours

    // Claim "typ": solo "access" autentica peticiones; cualquier otro tipo de token no sirve como sesion.
    public static final String CLAIM_TYP = "typ";
    public static final String TYP_ACCESS = "access";

    public JWTUtils(@Value("${app.jwt.secret}") String secret){
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Falta la clave JWT (app.jwt.secret / JWT_SECRET). Defínela en backend/.env o como variable de entorno.");
        }
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secret.trim().getBytes(StandardCharsets.UTF_8));
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("La clave JWT (app.jwt.secret / JWT_SECRET) no es Base64 válido.");
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("La clave JWT es demasiado corta: debe tener al menos 32 bytes (256 bits) en Base64.");
        }
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    /** Claim con la huella de la contraseña vigente: al cambiarla, los tokens anteriores dejan de valer. */
    public static final String CLAIM_PWV = "pwv";

    /** Primeros 16 hex de SHA-256 del hash de contraseña (no revela el hash ni sirve para adivinarlo). */
    public static String pwv(String passwordHash) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256")
                    .digest((passwordHash == null ? "" : passwordHash).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(h, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /** true si el token trae un pwv igual al de la contraseña actual (comparacion en tiempo constante). */
    public static boolean pwvCoincide(Claims claims, String passwordHash) {
        String del = claims.get(CLAIM_PWV, String.class);
        return del != null && MessageDigest.isEqual(
                del.getBytes(StandardCharsets.UTF_8), pwv(passwordHash).getBytes(StandardCharsets.UTF_8));
    }

    /** Claim con la version de sesion de la cuenta: si cambia (rol cambiado, correo cambiado), los tokens anteriores mueren. */
    public static final String CLAIM_SV = "sv";

    /** true si el token trae un sv igual a la version actual de la cuenta (sin sv = no vale). */
    public static boolean svCoincide(Claims claims, int sesionVersion) {
        Integer del = claims.get(CLAIM_SV, Integer.class);
        return del != null && del == sesionVersion;
    }

    /** Generico (sin version de sesion conocida: sv=0). Para cuentas reales usar la sobrecarga con Usuario. */
    public String generateToken(UserDetails u){
        return u instanceof Usuario us ? generateToken(us) : generateToken(u.getUsername(), u.getPassword(), 0);
    }

    public String generateToken(Usuario u){
        return generateToken(u.getUsername(), u.getPassword(), u.getSesionVersion());
    }

    /** Token de sesion para un correo, el hash de contraseña vigente (p. ej. recien cambiado) y la version de sesion. */
    public String generateToken(String subject, String passwordHash, int sesionVersion){
        return Jwts.builder()
                .claim(CLAIM_TYP, TYP_ACCESS)
                .claim(CLAIM_PWV, pwv(passwordHash))
                .claim(CLAIM_SV, sesionVersion)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    /** Claims de un token firmado y vigente; lanza JwtException/IllegalArgumentException si no vale. */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(Key).build().parseClaimsJws(token).getBody();
    }
}
