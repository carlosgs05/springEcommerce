// src/main/java/com/ecommerce/backend/service/ProductoService.java
package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.EspecificacionRequest;
import com.ecommerce.backend.dto.ProductoRequest;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoImgRepository productoImgRepository;
    private final EspecificacionRepository especificacionRepository;
    private final ComentarioRepository comentarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;

    private final String uploadDir = Paths.get("backend", "src", "main", "resources", "static", "uploads")
            .toAbsolutePath()
            .toString() + File.separator;

    public ProductoRequest parsearJson(String json, List<MultipartFile> imgs) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ProductoRequest req = mapper.readValue(json, ProductoRequest.class);
        req.setImagenes(imgs);
        return req;
    }

    @Transactional
    public ProductoRequest crearProducto(ProductoRequest req) throws IOException {
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
                    img.setNombre(UUID.randomUUID() + "_" + mf.getOriginalFilename());
                    productoImgRepository.save(img);
                    mf.transferTo(new File(uploadDir + img.getNombre()));
                }
            }
        }

        if (req.getEspecificaciones() != null) {
            for (EspecificacionRequest er : req.getEspecificaciones()) {
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

    // obtener un producto con relaciones
    @Transactional
    public ProductoRequest obtenerProductoConRelaciones(Long idProd) {
        // fetch specifications only
        Producto prod = productoRepository.findByIdWithRelations(idProd)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // luego cargo imágenes en una consulta separada
        List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(idProd);

        List<Comentario> comentarios = comentarioRepository
                .findByProductoIdAndEstado(idProd, 1);

        ProductoRequest dto = new ProductoRequest();
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
                            EspecificacionRequest er = new EspecificacionRequest();
                            er.setUnidadmedida(e.getUnidadMedida());
                            er.setValor(e.getValor());
                            er.setDescripcion(e.getDescripcion());
                            return er;
                        })
                        .collect(Collectors.toList()));

        dto.setComentariosAprobados(comentarios);
        return dto;
    }

    // obtener todos los productos con relaciones
    @Transactional // <- AÑADE ESTA ANOTACIÓN
    public List<ProductoRequest> listarTodosLosProductos() {
        List<Producto> productos = productoRepository.findAllWithEspecificaciones();

        return productos.stream().map(prod -> {
            List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(prod.getIdproducto());
            List<Comentario> comentariosAprobados = comentarioRepository
            .findByProductoIdAndEstadoWithUsuario(prod.getIdproducto(), 1);

            ProductoRequest dto = new ProductoRequest();
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
                        EspecificacionRequest er = new EspecificacionRequest();
                        er.setUnidadmedida(e.getUnidadMedida());
                        er.setValor(e.getValor());
                        er.setDescripcion(e.getDescripcion());
                        return er;
                    }).collect(Collectors.toList()));

            dto.setComentariosAprobados(comentariosAprobados);

            return dto;
        }).collect(Collectors.toList());
    }



// — Eliminar un producto completo junto con sus imágenes —
@Transactional
public void eliminarProducto(Long idProducto) {
    // 1) Borrar archivos físicos
    List<ProductoImg> imagenes = productoImgRepository.findByProducto_Idproducto(idProducto);
    for (ProductoImg img : imagenes) {
        File f = new File(uploadDir + img.getNombre());
        if (f.exists()) {
            f.delete();
        }
    }
    // 2) Borrar el producto (orphanRemoval en la entidad eliminará los registros de producto_img)
    productoRepository.deleteById(idProducto);
}

// — Eliminar una sola imagen del producto —
@Transactional
public void eliminarImagen(String nombreImagen) {
    ProductoImg img = productoImgRepository.findByNombre(nombreImagen)
        .orElseThrow(() -> new IllegalArgumentException("Imagen no encontrada: " + nombreImagen));
    // Borrar archivo físico
    File f = new File(uploadDir + nombreImagen);
    if (f.exists()) {
        f.delete();
    }
    // Borrar registro en BD
    productoImgRepository.delete(img);
}

}