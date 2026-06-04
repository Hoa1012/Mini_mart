package com.groceryshop.service;

import com.groceryshop.dto.CartDTO;
import com.groceryshop.entity.Cart;
import com.groceryshop.entity.CartItem;
import com.groceryshop.entity.Inventory;
import com.groceryshop.entity.Product;
import com.groceryshop.entity.User;
import com.groceryshop.exception.BadRequestException;
import com.groceryshop.exception.ResourceNotFoundException;
import com.groceryshop.mapper.EntityMapper;
import com.groceryshop.repository.CartItemRepository;
import com.groceryshop.repository.CartRepository;
import com.groceryshop.repository.ProductRepository;
import com.groceryshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public CartDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return EntityMapper.toCartDTO(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    @Transactional
    public CartDTO addToCart(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));

        if (!product.getIsActive()) {
            throw new BadRequestException("Sản phẩm hiện không hoạt động");
        }

        Inventory inventory = product.getInventory();
        int availableStock = inventory != null ? inventory.getCurrentStock() : 0;
        if (availableStock <= 0) {
            throw new BadRequestException("Sản phẩm đã hết hàng");
        }

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        int newQuantity = quantity;
        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            newQuantity += cartItem.getQuantity();
        } else {
            cartItem = CartItem.builder().cart(cart).product(product).build();
        }

        if (newQuantity > availableStock) {
            throw new BadRequestException("Không thể mua vượt quá số lượng tồn kho có sẵn (" + availableStock + ")");
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        return getCartByUserId(userId);
    }

    @Transactional
    public CartDTO updateCartItem(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));

        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        Inventory inventory = product.getInventory();
        int availableStock = inventory != null ? inventory.getCurrentStock() : 0;
        if (quantity > availableStock) {
            throw new BadRequestException("Không thể mua vượt quá số lượng tồn kho có sẵn (" + availableStock + ")");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return getCartByUserId(userId);
    }

    @Transactional
    public CartDTO removeCartItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cartRepository.save(cart);
        return EntityMapper.toCartDTO(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
