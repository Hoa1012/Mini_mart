package com.groceryshop.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productMainImage;
    private BigDecimal productPrice;
    private BigDecimal productSalePrice;
    private Integer quantity;
    private Integer maxStock;
}
