package com.ecommerce.backend;

import com.ecommerce.backend.config.CorsConfig;
import com.ecommerce.backend.service.JWTUtils;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.cors.CorsConfiguration;

import java.security.SecureRandom;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class SeguridadConfigTest {

    private static String clave(int bytes) {
        byte[] b = new byte[bytes];
        new SecureRandom().nextBytes(b);
        return Base64.getEncoder().encodeToString(b);
    }

    @Test
    void jwtRechazaClaveVaciaOCorta() {
        assertThrows(IllegalStateException.class, () -> new JWTUtils(null));
        assertThrows(IllegalStateException.class, () -> new JWTUtils("  "));
        assertThrows(IllegalStateException.class, () -> new JWTUtils(clave(16)));
        assertThrows(IllegalStateException.class, () -> new JWTUtils("no es base64 !!"));
    }

    @Test
    void jwtGeneraYValidaToken() {
        JWTUtils jwt = new JWTUtils(clave(64));
        UserDetails u = new User("a@b.com", "x", List.of());
        String t = jwt.generateToken(u);
        assertEquals("a@b.com", jwt.extractUsername(t));
        assertTrue(jwt.isTokenValid(t, u));
        // token firmado con otra clave no vale
        String ajeno = new JWTUtils(clave(64)).generateToken(u);
        assertThrows(Exception.class, () -> jwt.extractUsername(ajeno));
    }

    private static List<String> origenes(String raw) {
        CorsConfig c = new CorsConfig();
        ReflectionTestUtils.setField(c, "allowedOrigins", raw);
        WebMvcConfigurer w = ReflectionTestUtils.invokeMethod(c, "webMvcConfigurer");
        class R extends CorsRegistry { Map<String, CorsConfiguration> m() { return getCorsConfigurations(); } }
        R r = new R();
        w.addCorsMappings(r);
        List<String> o = r.m().get("/**").getAllowedOrigins();
        return o == null ? List.of() : o;
    }

    @Test
    void corsListaExacta() {
        assertEquals(List.of("http://localhost:5173", "http://otro.com"), origenes("http://localhost:5173, ,http://otro.com"));
        assertTrue(origenes("").isEmpty());
        assertTrue(origenes(null).isEmpty());
        assertFalse(origenes("").contains("*"));
    }
}
