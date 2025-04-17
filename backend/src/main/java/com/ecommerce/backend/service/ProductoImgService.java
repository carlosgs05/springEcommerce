package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.ProductoImg;
import java.util.List;

public interface ProductoImgService {
    List<ProductoImg> findAll();
    ProductoImg findById(Integer id);
    ProductoImg save(ProductoImg productoImg);
    void deleteById(Integer id);
    List<ProductoImg> findByProducto(Integer productoId);
}