package com.ecommerce.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.ecommerce.backend.dto.ProductoDTO;
import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.ProductoImg;
import com.ecommerce.backend.repository.CategoriaRepository;
import com.ecommerce.backend.repository.ComentarioRepository;
import com.ecommerce.backend.repository.EspecificacionRepository;
import com.ecommerce.backend.repository.MarcaRepository;
import com.ecommerce.backend.repository.ProductoImgRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.service.ProductoService;

/** Prueba de unidad: validacion real de imagenes subidas en ProductoService (Dia 5). */
class ProductoImagenValidacionTest {

    @Test
    void rechazaArchivoNoImagenAunqueDigaSerJpg() throws Exception {
        ProductoRepository productoRepository = mock(ProductoRepository.class);
        ProductoImgRepository productoImgRepository = mock(ProductoImgRepository.class);
        EspecificacionRepository especificacionRepository = mock(EspecificacionRepository.class);
        ComentarioRepository comentarioRepository = mock(ComentarioRepository.class);
        CategoriaRepository categoriaRepository = mock(CategoriaRepository.class);
        MarcaRepository marcaRepository = mock(MarcaRepository.class);
        org.springframework.cache.CacheManager cacheManager = mock(org.springframework.cache.CacheManager.class);

        ProductoService service = new ProductoService(
                productoRepository, productoImgRepository, especificacionRepository,
                comentarioRepository, categoriaRepository, marcaRepository, cacheManager);

        Categoria cat = new Categoria();
        cat.setIdcategoria(1L);
        Marca marca = new Marca();
        marca.setIdmarca(1L);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        Producto guardado = new Producto();
        guardado.setIdproducto(99L);
        when(productoRepository.save(any())).thenReturn(guardado);

        // Texto plano disfrazado de .jpg con content-type image/jpeg: debe rechazarse por magic bytes.
        MockMultipartFile falso = new MockMultipartFile(
                "imagenes", "foto.jpg", "image/jpeg", "esto no es una imagen".getBytes());

        ProductoDTO req = new ProductoDTO();
        req.setNombre("Producto X");
        req.setDescripcion("desc");
        req.setPrecio(new java.math.BigDecimal("10.00"));
        req.setStock(5);
        req.setIdcategoria(1L);
        req.setIdmarca(1L);
        req.setImagenes(List.of(falso));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.crearProducto(req));
        assertTrue(ex.getMessage().toLowerCase().contains("imagen"));
        verify(productoImgRepository, never()).save(any());
    }

    @Test
    void aceptaImagenJpegRealYGeneraNombreUUID() throws Exception {
        ProductoRepository productoRepository = mock(ProductoRepository.class);
        ProductoImgRepository productoImgRepository = mock(ProductoImgRepository.class);
        EspecificacionRepository especificacionRepository = mock(EspecificacionRepository.class);
        ComentarioRepository comentarioRepository = mock(ComentarioRepository.class);
        CategoriaRepository categoriaRepository = mock(CategoriaRepository.class);
        MarcaRepository marcaRepository = mock(MarcaRepository.class);
        org.springframework.cache.CacheManager cacheManager = mock(org.springframework.cache.CacheManager.class);

        ProductoService service = new ProductoService(
                productoRepository, productoImgRepository, especificacionRepository,
                comentarioRepository, categoriaRepository, marcaRepository, cacheManager);

        Categoria cat = new Categoria();
        cat.setIdcategoria(1L);
        Marca marca = new Marca();
        marca.setIdmarca(1L);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        Producto guardado = new Producto();
        guardado.setIdproducto(100L);
        when(productoRepository.save(any())).thenReturn(guardado);
        Producto conRelaciones = new Producto();
        conRelaciones.setIdproducto(100L);
        conRelaciones.setCategoria(cat);
        conRelaciones.setMarca(marca);
        conRelaciones.setEspecificaciones(List.of());
        when(productoRepository.findByIdWithRelations(100L)).thenReturn(Optional.of(conRelaciones));
        when(productoImgRepository.findByProducto_Idproducto(100L)).thenReturn(List.of());
        when(comentarioRepository.findByProductoIdAndEstado(100L, 1)).thenReturn(List.of());

        // Cabecera JPEG real minima (FF D8) seguida de bytes de relleno.
        byte[] bytesJpeg = new byte[20];
        bytesJpeg[0] = (byte) 0xFF;
        bytesJpeg[1] = (byte) 0xD8;
        MockMultipartFile real = new MockMultipartFile(
                "imagenes", "foto.jpg", "image/jpeg", bytesJpeg);

        ProductoDTO req = new ProductoDTO();
        req.setNombre("Producto Y");
        req.setDescripcion("desc");
        req.setPrecio(new java.math.BigDecimal("10.00"));
        req.setStock(5);
        req.setIdcategoria(1L);
        req.setIdmarca(1L);
        req.setImagenes(List.of(real));

        assertDoesNotThrow(() -> service.crearProducto(req));

        org.mockito.ArgumentCaptor<ProductoImg> captor = org.mockito.ArgumentCaptor.forClass(ProductoImg.class);
        verify(productoImgRepository).save(captor.capture());
        String nombreGuardado = captor.getValue().getNombre();
        assertFalse(nombreGuardado.contains("foto"), "no debe arrastrar el nombre original");
        assertTrue(nombreGuardado.endsWith(".jpg"));
    }
}
