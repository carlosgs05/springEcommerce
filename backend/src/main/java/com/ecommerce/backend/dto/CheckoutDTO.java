package com.ecommerce.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CheckoutDTO {
    private Integer iduser;
    private List<ItemCompraDTO> items;
}
