package com.ecommerce.backend.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

import java.nio.file.Paths;
import java.util.Arrays;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    /**
     * Misma carpeta que Marca/Producto/MetodoEnvio/MetodoPagoService usan para
     * guardar archivos subidos (uploadDir en cada uno). Se sirve directo desde
     * disco (no desde el classpath compilado) para que un archivo subido en
     * caliente se vea sin recompilar, y sobreviva a "mvnw clean".
     */
    private static final String UPLOAD_DIR = Paths.get("src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString();

    /** Separa por coma, recorta espacios e ignora vacíos. */
    static String[] parseOrigins(String raw) {
        if (raw == null) return new String[0];
        return Arrays.stream(raw.split(",")).map(String::trim).filter(o -> !o.isEmpty()).toArray(String[]::new);
    }

    @Bean
    WebMvcConfigurer webMvcConfigurer(){
        final String[] origins = parseOrigins(allowedOrigins);
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedOrigins(origins);
            }

            @Override
            public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:" + UPLOAD_DIR + "/");
            }
        };
    }
}
