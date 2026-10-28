package com.ecommerce.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Habilita de verdad los @Cacheable/@CacheEvict ya presentes en
 * CategoriaService, MarcaService, ProductoService, MetodoEnvioService y
 * MetodoPagoService. Antes de esto no hacían nada: faltaba esta anotación y
 * la dependencia spring-boot-starter-cache en pom.xml.
 *
 * No hay Redis ni caché distribuida configurada en el proyecto, así que
 * Spring usa su CacheManager por defecto (ConcurrentMapCacheManager),
 * en memoria del propio proceso.
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
