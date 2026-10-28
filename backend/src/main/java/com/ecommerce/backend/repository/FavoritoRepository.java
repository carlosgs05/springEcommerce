package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    List<Favorito> findByUsuario_Iduser(Integer idUsuario);

    Optional<Favorito> findByUsuario_IduserAndProducto_Idproducto(Integer idUsuario, Long idProducto);

    @Transactional
    void deleteByUsuario_IduserAndProducto_Idproducto(Integer idUsuario, Long idProducto);

    @Query("SELECT f.producto.idproducto FROM Favorito f WHERE f.usuario.iduser = :idUsuario")
    List<Long> findIdsProductoByUsuario(@Param("idUsuario") Integer idUsuario);
}
