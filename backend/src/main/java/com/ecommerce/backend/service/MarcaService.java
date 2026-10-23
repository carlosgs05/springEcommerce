package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MarcaDTO;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.repository.MarcaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarcaService {
    private final MarcaRepository marcaRepository;

    private final String uploadDir = Paths.get("src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    private static final long TAMANO_MAXIMO_IMAGEN = 5L * 1024 * 1024; // 5 MB

    private static final Map<String, String> TIPOS_PERMITIDOS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif");

    /**
     * Valida tipo, extension, tamaño y los primeros bytes del archivo subido como logo
     * y devuelve un nombre de archivo seguro (UUID + extension), sin usar nada del
     * nombre original para evitar path traversal o nombres manipulados.
     */
    private String validarYGenerarNombreImagen(MultipartFile imagen) throws IOException {
        if (imagen.getSize() > TAMANO_MAXIMO_IMAGEN) {
            throw new IllegalArgumentException("La imagen no puede superar los 5 MB");
        }

        String contentType = imagen.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.containsKey(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Tipo de imagen no permitido. Solo se aceptan JPEG, PNG, WEBP o GIF");
        }

        String nombreOriginal = imagen.getOriginalFilename();
        String extensionNombre = "";
        if (nombreOriginal != null) {
            // Solo nos interesa la extension; nunca usamos el resto del nombre original.
            String soloNombre = Paths.get(nombreOriginal).getFileName().toString();
            int punto = soloNombre.lastIndexOf('.');
            if (punto >= 0 && punto < soloNombre.length() - 1) {
                extensionNombre = soloNombre.substring(punto + 1).toLowerCase();
            }
        }
        String extensionEsperada = TIPOS_PERMITIDOS.get(contentType.toLowerCase());
        boolean extensionValida = extensionEsperada.equals(extensionNombre)
                || ("jpg".equals(extensionEsperada) && "jpeg".equals(extensionNombre));
        if (!extensionValida) {
            throw new IllegalArgumentException(
                    "La extensión del archivo no corresponde al tipo de imagen declarado");
        }

        // Revision de los primeros bytes (magic bytes) para no fiarse solo del content-type.
        byte[] cabecera = new byte[12];
        int leidos;
        try (var in = imagen.getInputStream()) {
            leidos = in.read(cabecera);
        }
        if (!cabeceraValida(contentType.toLowerCase(), cabecera, leidos)) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a una imagen válida");
        }

        // Nombre de archivo generado por nosotros: nunca se usa el nombre original en el path.
        return UUID.randomUUID() + "." + extensionEsperada;
    }

    private boolean cabeceraValida(String contentType, byte[] c, int leidos) {
        if (leidos < 4) return false;
        switch (contentType) {
            case "image/jpeg":
                return (c[0] & 0xFF) == 0xFF && (c[1] & 0xFF) == 0xD8;
            case "image/png":
                return leidos >= 8 && (c[0] & 0xFF) == 0x89 && c[1] == 'P' && c[2] == 'N' && c[3] == 'G';
            case "image/gif":
                return c[0] == 'G' && c[1] == 'I' && c[2] == 'F';
            case "image/webp":
                return leidos >= 12 && c[0] == 'R' && c[1] == 'I' && c[2] == 'F' && c[3] == 'F'
                        && c[8] == 'W' && c[9] == 'E' && c[10] == 'B' && c[11] == 'P';
            default:
                return false;
        }
    }

    /**
     * Devuelve la lista completa de marcas.
     * La primera llamada consulta la BD; las siguientes, el caché "marcas".
     */
    @Cacheable(value = "marcas", sync = true)
    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    /**
     * Crea una nueva marca y limpia la caché "marcas"
     * para que el listado se recargue con datos actualizados.
     */
    @Transactional
    @CacheEvict(value = "marcas", allEntries = true)
    public Marca crearMarca(MarcaDTO req) throws IOException {
        // Validaciones
        if (req.getNombre() == null || req.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }
        if (marcaRepository.existsByNombre(req.getNombre())) {
            throw new IllegalArgumentException("Ya existe una marca con ese nombre");
        }

        // Crear entidad
        Marca marca = new Marca();
        marca.setNombre(req.getNombre());
        marca = marcaRepository.save(marca);

        // Manejo de imagen
        if (req.getImagen() != null && !req.getImagen().isEmpty()) {
            String nombreImagen = validarYGenerarNombreImagen(req.getImagen());

            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));

            marca.setImagen(nombreImagen);
            marca = marcaRepository.save(marca);
        }

        return marca;
    }

    /**
     * Obtiene una marca por su ID.
     * Cachea bajo clave igual a ID y no almacena resultados nulos.
     */
    @Cacheable(value = "marcas", key = "#id", unless = "#result == null")
    public Marca obtenerMarcaPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));
    }

    /**
     * Actualiza una marca existente y limpia la caché "marcas"
     * para que las próximas lecturas reflejen los cambios.
     */
    @Transactional
    @CacheEvict(value = "marcas", allEntries = true)
    public Marca actualizarMarca(Long id, MarcaDTO req) throws IOException {
        Marca marca = obtenerMarcaPorId(id);
        String nuevoNombre = req.getNombre();

        // Validación de nombre
        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca no puede estar vacío");
        }
        if (!marca.getNombre().equalsIgnoreCase(nuevoNombre.trim())
                && marcaRepository.existsByNombre(nuevoNombre.trim())) {
            throw new IllegalArgumentException("Ya existe otra marca con ese nombre");
        }
        marca.setNombre(nuevoNombre.trim());

        // Manejo de imagen
        if (req.getImagen() != null && !req.getImagen().isEmpty()) {
            String nombreImagen = validarYGenerarNombreImagen(req.getImagen());

            if (marca.getImagen() != null && !marca.getImagen().isEmpty()) {
                File oldImage = new File(uploadDir + marca.getImagen());
                if (oldImage.exists()) {
                    oldImage.delete();
                }
            }
            File carpeta = new File(uploadDir);
            if (!carpeta.exists())
                carpeta.mkdirs();

            req.getImagen().transferTo(new File(uploadDir + nombreImagen));
            marca.setImagen(nombreImagen);
        }

        return marcaRepository.save(marca);
    }

    /**
     * Elimina una marca y limpia la caché "marcas"
     * para que el listado no incluya la entrada eliminada.
     */
    @CacheEvict(value = "marcas", allEntries = true)
    public void eliminarMarca(Long id) {
        if (!marcaRepository.existsById(id)) {
            throw new IllegalArgumentException("Marca no encontrada");
        }
        marcaRepository.deleteById(id);
    }
}
