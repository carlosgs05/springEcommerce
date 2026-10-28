package com.ecommerce.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.ecommerce.backend.dto.EspecificacionDTO;
import com.ecommerce.backend.dto.ProductoDTO;
import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.entity.Especificacion;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.repository.CategoriaRepository;
import com.ecommerce.backend.repository.ComentarioRepository;
import com.ecommerce.backend.repository.EspecificacionRepository;
import com.ecommerce.backend.repository.MarcaRepository;
import com.ecommerce.backend.repository.ProductoImgRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.service.ProductoService;

/**
 * Prueba de unidad (Dia 11-prep, fix de perdida de datos en actualizarProducto):
 * un PUT que no manda imagenes/keepImages/especificaciones no debe borrar lo existente.
 */
class ProductoActualizarSinBorrarTest {

    private ProductoService construirServicio(
            ProductoRepository productoRepository,
            ProductoImgRepository productoImgRepository,
            EspecificacionRepository especificacionRepository,
            CategoriaRepository categoriaRepository,
            MarcaRepository marcaRepository) {
        ComentarioRepository comentarioRepository = mock(ComentarioRepository.class);
        org.springframework.cache.CacheManager cacheManager = mock(org.springframework.cache.CacheManager.class);
        return new ProductoService(
                productoRepository, productoImgRepository, especificacionRepository,
                comentarioRepository, categoriaRepository, marcaRepository, cacheManager);
    }

    private ProductoDTO reqBase() {
        ProductoDTO req = new ProductoDTO();
        req.setNombre("Producto X");
        req.setDescripcion("desc");
        req.setPrecio(new java.math.BigDecimal("15.00"));
        req.setStock(5);
        req.setIdcategoria(1L);
        req.setIdmarca(1L);
        return req;
    }

    @Test
    void sinImagenesNiKeepImagesNiEspecificaciones_noBorraNada() throws Exception {
        ProductoRepository productoRepository = mock(ProductoRepository.class);
        ProductoImgRepository productoImgRepository = mock(ProductoImgRepository.class);
        EspecificacionRepository especificacionRepository = mock(EspecificacionRepository.class);
        CategoriaRepository categoriaRepository = mock(CategoriaRepository.class);
        MarcaRepository marcaRepository = mock(MarcaRepository.class);

        ProductoService service = construirServicio(
                productoRepository, productoImgRepository, especificacionRepository,
                categoriaRepository, marcaRepository);

        Categoria cat = new Categoria();
        cat.setIdcategoria(1L);
        Marca marca = new Marca();
        marca.setIdmarca(1L);
        Producto existente = new Producto();
        existente.setIdproducto(50L);

        when(productoRepository.findById(50L)).thenReturn(Optional.of(existente));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(productoRepository.save(any())).thenReturn(existente);

        Producto conRelaciones = new Producto();
        conRelaciones.setIdproducto(50L);
        conRelaciones.setCategoria(cat);
        conRelaciones.setMarca(marca);
        conRelaciones.setEspecificaciones(List.of());
        when(productoRepository.findByIdWithRelations(50L)).thenReturn(Optional.of(conRelaciones));
        when(productoImgRepository.findByProducto_Idproducto(50L)).thenReturn(List.of());

        ProductoDTO req = reqBase();
        // ni imagenes, ni especificaciones en el request (null)

        assertDoesNotThrow(() -> service.actualizarProducto(50L, req, null));

        verify(productoImgRepository, never()).deleteByProducto_Idproducto(anyLong());
        verify(productoImgRepository, never()).delete(any());
        verify(especificacionRepository, never()).deleteByProducto_Idproducto(anyLong());
    }

    @Test
    void especificacionesListaVaciaExplicita_siBorraTodas() throws Exception {
        ProductoRepository productoRepository = mock(ProductoRepository.class);
        ProductoImgRepository productoImgRepository = mock(ProductoImgRepository.class);
        EspecificacionRepository especificacionRepository = mock(EspecificacionRepository.class);
        CategoriaRepository categoriaRepository = mock(CategoriaRepository.class);
        MarcaRepository marcaRepository = mock(MarcaRepository.class);

        ProductoService service = construirServicio(
                productoRepository, productoImgRepository, especificacionRepository,
                categoriaRepository, marcaRepository);

        Categoria cat = new Categoria();
        cat.setIdcategoria(1L);
        Marca marca = new Marca();
        marca.setIdmarca(1L);
        Producto existente = new Producto();
        existente.setIdproducto(51L);
        // Especificación "vieja" ya cargada (simula el fetch EAGER real de
        // Producto.especificaciones hecho por findById antes de llamar al servicio).
        Especificacion vieja = new Especificacion();
        vieja.setUnidadMedida("GB");
        vieja.setValor(16.0);
        vieja.setDescripcion("vieja");
        vieja.setProducto(existente);
        existente.getEspecificaciones().add(vieja);

        when(productoRepository.findById(51L)).thenReturn(Optional.of(existente));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(productoRepository.save(any())).thenReturn(existente);

        Producto conRelaciones = new Producto();
        conRelaciones.setIdproducto(51L);
        conRelaciones.setCategoria(cat);
        conRelaciones.setMarca(marca);
        conRelaciones.setEspecificaciones(List.of());
        when(productoRepository.findByIdWithRelations(51L)).thenReturn(Optional.of(conRelaciones));
        when(productoImgRepository.findByProducto_Idproducto(51L)).thenReturn(List.of());

        ProductoDTO req = reqBase();
        req.setEspecificaciones(List.<EspecificacionDTO>of()); // vacio explicito

        assertDoesNotThrow(() -> service.actualizarProducto(51L, req, null));

        // El borrado real ya NO pasa por especificacionRepository.deleteByProducto_Idproducto
        // (ese bulk delete directo, con Producto.especificaciones EAGER+cascade=ALL+
        // orphanRemoval ya cargada en la misma transacción, resucitaba la fila al hacer
        // flush — confirmado con curl contra la base real). El borrado real es mutar la
        // colección gestionada: clear() + orphanRemoval hace el DELETE de verdad al flush.
        verify(especificacionRepository, never()).deleteByProducto_Idproducto(anyLong());
        assertTrue(existente.getEspecificaciones().isEmpty());
    }

    @Test
    void especificacionesConDatos_reemplazaLaColeccionGestionada() throws Exception {
        ProductoRepository productoRepository = mock(ProductoRepository.class);
        ProductoImgRepository productoImgRepository = mock(ProductoImgRepository.class);
        EspecificacionRepository especificacionRepository = mock(EspecificacionRepository.class);
        CategoriaRepository categoriaRepository = mock(CategoriaRepository.class);
        MarcaRepository marcaRepository = mock(MarcaRepository.class);

        ProductoService service = construirServicio(
                productoRepository, productoImgRepository, especificacionRepository,
                categoriaRepository, marcaRepository);

        Categoria cat = new Categoria();
        cat.setIdcategoria(1L);
        Marca marca = new Marca();
        marca.setIdmarca(1L);
        Producto existente = new Producto();
        existente.setIdproducto(52L);
        Especificacion vieja = new Especificacion();
        vieja.setUnidadMedida("GB");
        vieja.setValor(16.0);
        vieja.setDescripcion("vieja");
        vieja.setProducto(existente);
        existente.getEspecificaciones().add(vieja);

        when(productoRepository.findById(52L)).thenReturn(Optional.of(existente));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(productoRepository.save(any())).thenReturn(existente);

        Producto conRelaciones = new Producto();
        conRelaciones.setIdproducto(52L);
        conRelaciones.setCategoria(cat);
        conRelaciones.setMarca(marca);
        conRelaciones.setEspecificaciones(List.of());
        when(productoRepository.findByIdWithRelations(52L)).thenReturn(Optional.of(conRelaciones));
        when(productoImgRepository.findByProducto_Idproducto(52L)).thenReturn(List.of());

        ProductoDTO req = reqBase();
        EspecificacionDTO nueva = new EspecificacionDTO();
        nueva.setUnidadmedida("TB");
        nueva.setValor(2.0);
        nueva.setDescripcion("nueva");
        req.setEspecificaciones(List.of(nueva));

        assertDoesNotThrow(() -> service.actualizarProducto(52L, req, null));

        verify(especificacionRepository, never()).deleteByProducto_Idproducto(anyLong());
        assertEquals(1, existente.getEspecificaciones().size());
        assertEquals("nueva", existente.getEspecificaciones().get(0).getDescripcion());
    }
}
