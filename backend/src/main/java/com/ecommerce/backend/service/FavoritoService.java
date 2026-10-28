package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.FavoritoDTO;
import com.ecommerce.backend.dto.ProductoDTO;
import com.ecommerce.backend.entity.Favorito;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.FavoritoRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;

    /** Favoritos del usuario, con datos del producto para pintar la pantalla de Favoritos. */
    @Transactional(readOnly = true)
    public List<FavoritoDTO> listarFavoritos(Integer idUsuario) {
        List<Favorito> favoritos = favoritoRepository.findByUsuario_Iduser(idUsuario);
        List<Long> idsProducto = favoritos.stream().map(f -> f.getProducto().getIdproducto()).distinct().toList();
        Map<Long, ProductoDTO> productosPorId = productoService.obtenerProductosConRelacionesBatch(idsProducto);

        return favoritos.stream()
                .map(f -> {
                    ProductoDTO prod = productosPorId.get(f.getProducto().getIdproducto());
                    if (prod == null) {
                        return null;
                    }
                    FavoritoDTO dto = new FavoritoDTO();
                    dto.setIdproducto(prod.getIdproducto());
                    dto.setNombre(prod.getNombre());
                    dto.setPrecio(prod.getPrecio());
                    dto.setStock(prod.getStock());
                    dto.setPrimeraImagen(
                            prod.getImagenesNombres() != null && !prod.getImagenesNombres().isEmpty()
                                    ? prod.getImagenesNombres().get(0)
                                    : null);
                    dto.setCalificacionPromedio(prod.getCalificacionPromedio());
                    dto.setTotalResenas(prod.getTotalResenas());
                    dto.setFechaAgregado(f.getFechaAgregado());
                    return dto;
                })
                .filter(dto -> dto != null)
                .toList();
    }

    /** Ids de producto favoritos del usuario, liviano para pintar el corazón en catálogo/detalle. */
    @Transactional(readOnly = true)
    public List<Long> listarIdsFavoritos(Integer idUsuario) {
        return favoritoRepository.findIdsProductoByUsuario(idUsuario);
    }

    /** Idempotente: si ya existe el favorito, no falla ni duplica. */
    @Transactional
    public void agregarFavorito(Integer idUsuario, Long idProducto) {
        if (favoritoRepository.findByUsuario_IduserAndProducto_Idproducto(idUsuario, idProducto).isPresent()) {
            return;
        }
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setProducto(producto);
        favorito.setFechaAgregado(LocalDateTime.now());
        try {
            favoritoRepository.save(favorito);
        } catch (DataIntegrityViolationException e) {
            // Carrera: otra peticion lo creo entre el check y el save. El unico de la BD
            // (uq_favorito_usuario_producto) ya lo evito; lo tratamos como idempotente.
        }
    }

    /** Idempotente: no falla si el favorito no existia. */
    @Transactional
    public void quitarFavorito(Integer idUsuario, Long idProducto) {
        favoritoRepository.deleteByUsuario_IduserAndProducto_Idproducto(idUsuario, idProducto);
    }
}
