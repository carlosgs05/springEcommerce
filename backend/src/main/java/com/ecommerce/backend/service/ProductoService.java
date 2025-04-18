package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ProductoRequest;
import com.ecommerce.backend.dto.EspecificacionRequest;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoImgRepository productoImgRepository;
    private final EspecificacionRepository especificacionRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;

    // Ruta ABSOLUTA dentro de backend/uploads
    private final String uploadDir = Paths.get("backend", "uploads").toAbsolutePath().toString() + File.separator;

    @Transactional
    public Producto crearProducto(ProductoRequest request) throws IOException {
        // Validar y obtener categoría y marca
        Categoria categoria = categoriaRepository.findById(request.getIdcategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        Marca marca = marcaRepository.findById(request.getIdmarca())
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada"));

        // Crear producto
        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setCategoria(categoria);
        producto.setMarca(marca);
        producto.setFechacreacion(LocalDateTime.now());
        producto = productoRepository.save(producto);

        // Crear directorio si no existe
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs(); // Crea todos los directorios necesarios
        }

        // Guardar imágenes
        if (request.getImagenes() != null && !request.getImagenes().isEmpty()) {
            List<ProductoImg> imagenesGuardadas = new ArrayList<>();
            for (MultipartFile imagen : request.getImagenes()) {
                if (!imagen.isEmpty()) {
                    ProductoImg img = new ProductoImg();
                    img.setProducto(producto);
                    img.setNombre(UUID.randomUUID() + "_" + imagen.getOriginalFilename());
                    imagenesGuardadas.add(productoImgRepository.save(img));

                    // Guardar archivo físico
                    File destino = new File(uploadDir + img.getNombre());
                    imagen.transferTo(destino);
                }
            }
            producto.setImagenes(imagenesGuardadas); // Asignar la lista al producto
        }

        // Guardar especificaciones
        if (request.getEspecificaciones() != null && !request.getEspecificaciones().isEmpty()) {
            List<Especificacion> especificacionesGuardadas = new ArrayList<>();
            for (EspecificacionRequest e : request.getEspecificaciones()) {
                Especificacion esp = new Especificacion();
                esp.setProducto(producto);
                esp.setUnidadMedida(e.getUnidadmedida());
                esp.setValor(e.getValor());
                esp.setDescripcion(e.getDescripcion());
                especificacionesGuardadas.add(especificacionRepository.save(esp));
            }
            producto.setEspecificaciones(especificacionesGuardadas); // Asignar la lista al producto
        }

        return productoRepository.save(producto); // Guardar cambios finales
    }
}