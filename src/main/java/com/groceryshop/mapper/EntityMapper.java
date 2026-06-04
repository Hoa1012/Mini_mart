package com.groceryshop.mapper;

import com.groceryshop.dto.*;
import com.groceryshop.entity.*;
import java.util.stream.Collectors;

public class EntityMapper {

    public static CategoryDTO toCategoryDTO(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .isActive(category.getIsActive())
                .build();
    }

    public static Category toCategoryEntity(CategoryDTO dto) {
        if (dto == null) return null;
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .image(dto.getImage())
                .isActive(dto.getIsActive())
                .build();
    }

    public static BrandDTO toBrandDTO(Brand brand) {
        if (brand == null) return null;
        return BrandDTO.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .isActive(brand.getIsActive())
                .build();
    }

    public static Brand toBrandEntity(BrandDTO dto) {
        if (dto == null) return null;
        return Brand.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .isActive(dto.getIsActive())
                .build();
    }

    public static ProductDTO toProductDTO(Product product) {
        if (product == null) return null;
        ProductDTO.ProductDTOBuilder builder = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .mainImage(product.getMainImage())
                .isActive(product.getIsActive())
                .images(product.getImages() != null ? 
                        product.getImages().stream().map(ProductImage::getImagePath).collect(Collectors.toList()) : null);

        if (product.getInventory() != null) {
            builder.currentStock(product.getInventory().getCurrentStock())
                   .minimumStock(product.getInventory().getMinimumStock())
                   .location(product.getInventory().getLocation());
        } else {
            builder.currentStock(0).minimumStock(5);
        }

        return builder.build();
    }

    public static CartItemDTO toCartItemDTO(CartItem item) {
        if (item == null) return null;
        Product product = item.getProduct();
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productMainImage(product.getMainImage())
                .productPrice(product.getPrice())
                .productSalePrice(product.getSalePrice())
                .quantity(item.getQuantity())
                .maxStock(product.getInventory() != null ? product.getInventory().getCurrentStock() : 0)
                .build();
    }

    public static CartDTO toCartDTO(Cart cart) {
        if (cart == null) return null;
        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(cart.getItems() != null ? 
                        cart.getItems().stream().map(EntityMapper::toCartItemDTO).collect(Collectors.toList()) : null)
                .build();
    }

    public static OrderItemDTO toOrderItemDTO(OrderItem item) {
        if (item == null) return null;
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build();
    }

    public static OrderDTO toOrderDTO(Order order) {
        if (order == null) return null;
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPayment() != null ? order.getPayment().getPaymentStatus() : "PENDING")
                .couponCode(order.getCouponCode())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems() != null ? 
                        order.getItems().stream().map(EntityMapper::toOrderItemDTO).collect(Collectors.toList()) : null)
                .build();
    }

    public static CouponDTO toCouponDTO(Coupon coupon) {
        if (coupon == null) return null;
        return CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .minOrderAmount(coupon.getMinOrderAmount())
                .usedCount(coupon.getUsedCount())
                .maxUses(coupon.getMaxUses())
                .isActive(coupon.getIsActive())
                .build();
    }

    public static Coupon toCouponEntity(CouponDTO dto) {
        if (dto == null) return null;
        return Coupon.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .description(dto.getDescription())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .minOrderAmount(dto.getMinOrderAmount())
                .usedCount(dto.getUsedCount())
                .maxUses(dto.getMaxUses())
                .isActive(dto.getIsActive())
                .build();
    }

    public static ReviewDTO toReviewDTO(Review review) {
        if (review == null) return null;
        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .username(review.getUser() != null ? review.getUser().getUsername() : null)
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .isApproved(review.getIsApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static AddressDTO toAddressDTO(Address address) {
        if (address == null) return null;
        return AddressDTO.builder()
                .id(address.getId())
                .userId(address.getUser() != null ? address.getUser().getId() : null)
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .detailAddress(address.getDetailAddress())
                .isDefault(address.getIsDefault())
                .build();
    }

    public static Address toAddressEntity(AddressDTO dto) {
        if (dto == null) return null;
        return Address.builder()
                .id(dto.getId())
                .receiverName(dto.getReceiverName())
                .receiverPhone(dto.getReceiverPhone())
                .province(dto.getProvince())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .detailAddress(dto.getDetailAddress())
                .isDefault(dto.getIsDefault())
                .build();
    }
}
