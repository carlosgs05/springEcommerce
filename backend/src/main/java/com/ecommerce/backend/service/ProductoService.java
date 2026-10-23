package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.EspecificacionDTO;
import com.ecommerce.backend.dto.ProductoDTO;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductoService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ProductoRepository productoRepository;
    private final ProductoImgRepository productoImgRepository;
    private final EspecificacionRepository especificacionRepository;
    private final ComentarioRepository comentarioRepository;
    private final CategoriaRepository categoriaRepository;
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
     * Valida tipo, extension, tamaño y los primeros bytes del archivo subido como imagen
     * de producto y devuelve un nombre de archivo seguro (UUID + extension), sin usar nada
     * del nombre original para evitar path traversal o nombres manipulados.
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

        byte[] cabecera = new byte[12];
        int leidos;
        try (var in = imagen.getInputStream()) {
            leidos = in.read(cabecera);
        }
        if (!cabeceraValida(contentType.toLowerCase(), cabecera, leidos)) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a una imagen válida");
        }

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
     * Calcula promedio (redondeado a 1 decimal) y total de calificaciones de una lista
     * de comentarios ya cargada (aprobados), sin disparar consultas nuevas.
     */
    private double[] calcularCalificacion(List<Comentario> comentariosAprobados) {
        if (comentariosAprobados == null || comentariosAprobados.isEmpty()) {
            return new double[] { 0.0, 0 };
        }
        double suma = 0;
        int total = 0;
        for (Comentario c : comentariosAprobados) {
            if (c.getCalificacion() != null) {
                suma += c.getCalificacion();
                total++;
            }
        }
        if (total == 0) {
            return new double[] { 0.0, 0 };
        }
        double promedio = Math.round((suma / total) * 10.0) / 10.0;
        return new double[] { promedio, total };
    }

    public ProductoDTO parsearJson(String json, List<MultipartFile> imgs) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ProductoDTO req = mapper.readValue(json, ProductoDTO.class);
        req.setImagenes(imgs);
        return req;
    }

    // Agrega este método en la clase ProductoService
    @Transactional(readOnly = true)
    @Cacheable(value = "productosStock")
    public Map<String, Long> obtenerEstadisticasStock() {
        long total = productoRepository.count();
        long suficiente = productoRepository.countByStockSuficiente();
        long bajo = productoRepository.countByStockBajo();

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("suficiente", suficiente);
        stats.put("bajo", bajo);

        return stats;
    }

    /**
     * Crea un nuevo producto, imágenes y especificaciones, y limpia las cachés
     * para que las siguientes lecturas reflejen los datos actualizados.
     */
    @Transactional
    @CacheEvict(value = { "productos", "producto", "productosFiltro", "productosStock" }, allEntries = true)
    public ProductoDTO crearProducto(ProductoDTO req) throws IOException {
        Categoria cat = categoriaRepository.findById(req.getIdcategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        Marca mar = marcaRepository.findById(req.getIdmarca())
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));

        Producto prod = new Producto();
        prod.setNombre(req.getNombre());
        prod.setDescripcion(req.getDescripcion());
        prod.setPrecio(req.getPrecio());
        prod.setStock(req.getStock());
        prod.setCategoria(cat);
        prod.setMarca(mar);
        prod.setFechacreacion(LocalDateTime.now());
        prod = productoRepository.save(prod);

        File carpeta = new File(uploadDir);
        if (!carpeta.exists())
            carpeta.mkdirs();

        if (req.getImagenes() != null) {
            for (MultipartFile mf : req.getImagenes()) {
                if (!mf.isEmpty()) {
                    ProductoImg img = new ProductoImg();
                    img.setProducto(prod);
                    img.setNombre(validarYGenerarNombreImagen(mf));
                    productoImgRepository.save(img);
                    mf.transferTo(new File(uploadDir + img.getNombre()));
                }
            }
        }

        if (req.getEspecificaciones() != null) {
            for (EspecificacionDTO er : req.getEspecificaciones()) {
                Especificacion e = new Especificacion();
                e.setProducto(prod);
                e.setUnidadMedida(er.getUnidadmedida());
                e.setValor(er.getValor());
                e.setDescripcion(er.getDescripcion());
                especificacionRepository.save(e);
            }
        }

        return obtenerProductoConRelaciones(prod.getIdproducto());
    }

    /**
     * Obtiene un producto con sus relaciones (imágenes, especificaciones,
     * comentarios).
     * Cachea bajo clave igual al ID del producto y no almacena resultados nulos.
     */
    @Transactional
    @Cacheable(value = "producto", key = "#idProd", unless = "#result == null")
    public ProductoDTO obtenerProductoConRelaciones(Long idProd) {
        Producto prod = productoRepository.findByIdWithRelations(idProd)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(idProd);
        List<Comentario> comentarios = comentarioRepository
                .findByProductoIdAndEstado(idProd, 1);

        ProductoDTO dto = new ProductoDTO();
        dto.setIdproducto(prod.getIdproducto());
        dto.setNombre(prod.getNombre());
        dto.setDescripcion(prod.getDescripcion());
        dto.setPrecio(prod.getPrecio());
        dto.setStock(prod.getStock());
        dto.setIdcategoria(prod.getCategoria().getIdcategoria());
        dto.setNombreCategoria(prod.getCategoria().getNombre());
        dto.setIdmarca(prod.getMarca().getIdmarca());
        dto.setNombreMarca(prod.getMarca().getNombre());
        dto.setFechacreacion(prod.getFechacreacion());

        dto.setImagenesNombres(
                imagenes.stream()
                        .map(ProductoImg::getNombre)
                        .collect(Collectors.toList()));

        dto.setEspecificaciones(
                prod.getEspecificaciones()
                        .stream()
                        .map(e -> {
                            EspecificacionDTO er = new EspecificacionDTO();
                            er.setUnidadmedida(e.getUnidadMedida());
                            er.setValor(e.getValor());
                            er.setDescripcion(e.getDescripcion());
                            return er;
                        })
                        .collect(Collectors.toList()));

        dto.setComentariosAprobados(comentarios);
        double[] calificacion = calcularCalificacion(comentarios);
        dto.setCalificacionPromedio(calificacion[0]);
        dto.setTotalResenas((int) calificacion[1]);
        return dto;
    }

    /**
     * Lista todos los productos con relaciones.
     * La primera llamada consulta la BD; las siguientes, la caché "productos".
     */
    @Transactional
    @Cacheable(value = "productos", sync = true)
    public List<ProductoDTO> listarTodosLosProductos() {
        List<Producto> productos = productoRepository.findAllWithEspecificaciones();

        return productos.stream().map(prod -> {
            List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(prod.getIdproducto());
            List<Comentario> comentariosAprobados = comentarioRepository
                    .findByProductoIdAndEstadoWithUsuario(prod.getIdproducto(), 1);

            ProductoDTO dto = new ProductoDTO();
            dto.setIdproducto(prod.getIdproducto());
            dto.setNombre(prod.getNombre());
            dto.setDescripcion(prod.getDescripcion());
            dto.setPrecio(prod.getPrecio());
            dto.setStock(prod.getStock());
            dto.setFechacreacion(prod.getFechacreacion());
            dto.setIdcategoria(prod.getCategoria().getIdcategoria());
            dto.setNombreCategoria(prod.getCategoria().getNombre());
            dto.setIdmarca(prod.getMarca().getIdmarca());
            dto.setNombreMarca(prod.getMarca().getNombre());

            dto.setImagenesNombres(
                    imagenes.stream().map(ProductoImg::getNombre).collect(Collectors.toList()));

            dto.setEspecificaciones(
                    prod.getEspecificaciones().stream().map(e -> {
                        EspecificacionDTO er = new EspecificacionDTO();
                        er.setUnidadmedida(e.getUnidadMedida());
                        er.setValor(e.getValor());
                        er.setDescripcion(e.getDescripcion());
                        return er;
                    }).collect(Collectors.toList()));

            dto.setComentariosAprobados(comentariosAprobados);
            double[] calificacion = calcularCalificacion(comentariosAprobados);
            dto.setCalificacionPromedio(calificacion[0]);
            dto.setTotalResenas((int) calificacion[1]);

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Filtra productos por categoría y marca.
     * Cachea los resultados bajo clave "categoria-marca" y no almacena listas
     * vacías.
     */
    @Transactional
    @Cacheable(value = "productosFiltro", key = "#categoria + '-' + #marca", unless = "#result.isEmpty()")
    public List<ProductoDTO> filtrarProductos(Long categoria, Long marca) {
        List<Producto> productos = productoRepository.findByCategoriaAndMarca(categoria, marca);

        return productos.stream().map(prod -> {
            List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(prod.getIdproducto());
            List<Comentario> comentariosAprobados = comentarioRepository
                    .findByProductoIdAndEstadoWithUsuario(prod.getIdproducto(), 1);

            ProductoDTO dto = new ProductoDTO();
            dto.setIdproducto(prod.getIdproducto());
            dto.setNombre(prod.getNombre());
            dto.setDescripcion(prod.getDescripcion());
            dto.setPrecio(prod.getPrecio());
            dto.setStock(prod.getStock());
            dto.setFechacreacion(prod.getFechacreacion());
            dto.setIdcategoria(prod.getCategoria().getIdcategoria());
            dto.setNombreCategoria(prod.getCategoria().getNombre());
            dto.setIdmarca(prod.getMarca().getIdmarca());
            dto.setNombreMarca(prod.getMarca().getNombre());

            dto.setImagenesNombres(imagenes.stream().map(ProductoImg::getNombre).toList());

            dto.setEspecificaciones(prod.getEspecificaciones().stream().map(e -> {
                EspecificacionDTO er = new EspecificacionDTO();
                er.setUnidadmedida(e.getUnidadMedida());
                er.setValor(e.getValor());
                er.setDescripcion(e.getDescripcion());
                return er;
            }).toList());

            dto.setComentariosAprobados(comentariosAprobados);
            double[] calificacion = calcularCalificacion(comentariosAprobados);
            dto.setCalificacionPromedio(calificacion[0]);
            dto.setTotalResenas((int) calificacion[1]);
            return dto;
        }).toList();
    }

    /**
     * Elimina un producto junto con sus imágenes y limpia las cachés necesarias.
     */
    @Transactional
    @CacheEvict(value = { "productos", "producto", "productosFiltro", "productosStock" }, allEntries = true)
    public void eliminarProducto(Long idProducto) {
        List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(idProducto);
        for (ProductoImg img : imagenes) {
            File f = new File(uploadDir + img.getNombre());
            if (f.exists()) {
                f.delete();
            }
        }
        productoRepository.deleteById(idProducto);
    }

    /**
     * Elimina una sola imagen de producto y limpia la caché del producto afectado.
     */
    @Transactional
    @CacheEvict(value = { "producto" }, key = "#nombreImagen")
    public void eliminarImagen(String nombreImagen) {
        ProductoImg img = productoImgRepository.findByNombre(nombreImagen)
                .orElseThrow(() -> new IllegalArgumentException("Imagen no encontrada: " + nombreImagen));
        File f = new File(uploadDir + nombreImagen);
        if (f.exists()) {
            f.delete();
        }
        productoImgRepository.delete(img);
    }

    /**
     * Actualiza un producto completo y limpia las cachés para forzar recarga.
     */
    @Transactional
    @CacheEvict(value = { "productos", "producto", "productosFiltro", "productosStock" }, allEntries = true)
    public ProductoDTO actualizarProducto(Long id, ProductoDTO req) throws IOException {
        Producto prod = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        Categoria cat = categoriaRepository.findById(req.getIdcategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        Marca mar = marcaRepository.findById(req.getIdmarca())
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));

        prod.setNombre(req.getNombre());
        prod.setDescripcion(req.getDescripcion());
        prod.setPrecio(req.getPrecio());
        prod.setStock(req.getStock());
        prod.setCategoria(cat);
        prod.setMarca(mar);
        prod = productoRepository.save(prod);

        File carpeta = new File(uploadDir);
        if (!carpeta.exists())
            carpeta.mkdirs();

        productoImgRepository.deleteByProducto_Idproducto(prod.getIdproducto());
        if (req.getImagenes() != null) {
            for (MultipartFile mf : req.getImagenes()) {
                if (!mf.isEmpty()) {
                    ProductoImg img = new ProductoImg();
                    img.setProducto(prod);
                    img.setNombre(validarYGenerarNombreImagen(mf));
                    productoImgRepository.save(img);
                    mf.transferTo(new File(uploadDir + img.getNombre()));
                }
            }
        }

        especificacionRepository.deleteByProducto_Idproducto(prod.getIdproducto());
        if (req.getEspecificaciones() != null) {
            for (EspecificacionDTO er : req.getEspecificaciones()) {
                Especificacion e = new Especificacion();
                e.setProducto(prod);
                e.setUnidadMedida(er.getUnidadmedida());
                e.setValor(er.getValor());
                e.setDescripcion(er.getDescripcion());
                especificacionRepository.save(e);
            }
        }

        return obtenerProductoConRelaciones(prod.getIdproducto());
    }

}
