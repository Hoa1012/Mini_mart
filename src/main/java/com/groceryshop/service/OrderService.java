package com.groceryshop.service;

import com.groceryshop.dto.OrderDTO;
import com.groceryshop.entity.*;
import com.groceryshop.exception.BadRequestException;
import com.groceryshop.exception.ResourceNotFoundException;
import com.groceryshop.mapper.EntityMapper;
import com.groceryshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CouponService couponService;

    @Transactional
    public OrderDTO createOrder(Long userId, OrderDTO orderDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng của người dùng"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (!product.getIsActive()) {
                throw new BadRequestException("Sản phẩm '" + product.getName() + "' hiện tại không hoạt động");
            }
            Inventory inventory = product.getInventory();
            int currentStock = inventory != null ? inventory.getCurrentStock() : 0;
            if (item.getQuantity() > currentStock) {
                throw new BadRequestException("Sản phẩm '" + product.getName() + "' không đủ hàng trong kho (Còn lại: " + currentStock + ")");
            }

            BigDecimal itemPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            totalAmount = totalAmount.add(itemPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (orderDTO.getCouponCode() != null && !orderDTO.getCouponCode().trim().isEmpty()) {
            discountAmount = couponService.calculateDiscount(orderDTO.getCouponCode(), totalAmount);
            appliedCoupon = couponRepository.findByCode(orderDTO.getCouponCode()).orElse(null);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status("CHO_XAC_NHAN")
                .shippingName(orderDTO.getShippingName())
                .shippingPhone(orderDTO.getShippingPhone())
                .shippingAddress(orderDTO.getShippingAddress())
                .paymentMethod(orderDTO.getPaymentMethod())
                .couponCode(orderDTO.getCouponCode())
                .note(orderDTO.getNote())
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal itemPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(itemPrice)
                    .productName(product.getName())
                    .productImage(product.getMainImage())
                    .build();
            orderItemRepository.save(orderItem);
            savedOrder.getItems().add(orderItem);

            Inventory inventory = product.getInventory();
            if (inventory != null) {
                inventory.setCurrentStock(inventory.getCurrentStock() - item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }

        if (appliedCoupon != null) {
            appliedCoupon.setUsedCount(appliedCoupon.getUsedCount() + 1);
            couponRepository.save(appliedCoupon);
        }

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(orderDTO.getPaymentMethod())
                .paymentStatus("PENDING")
                .amount(finalAmount)
                .build();
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        cart.getItems().clear();
        cartRepository.save(cart);

        return EntityMapper.toOrderDTO(savedOrder);
    }

    public List<OrderDTO> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(EntityMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(EntityMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));
        return EntityMapper.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền hủy đơn hàng này");
        }

        if (!order.getStatus().equals("CHO_XAC_NHAN")) {
            throw new BadRequestException("Chỉ được phép hủy đơn hàng ở trạng thái 'Chờ xác nhận'");
        }

        order.setStatus("HUY");
        Order updatedOrder = orderRepository.save(order);

        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Inventory inventory = item.getProduct().getInventory();
                if (inventory != null) {
                    inventory.setCurrentStock(inventory.getCurrentStock() + item.getQuantity());
                    inventoryRepository.save(inventory);
                }
            }
        }

        if (order.getCouponCode() != null) {
            couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
                if (coupon.getUsedCount() > 0) {
                    coupon.setUsedCount(coupon.getUsedCount() - 1);
                    couponRepository.save(coupon);
                }
            });
        }

        if (order.getPayment() != null) {
            Payment payment = order.getPayment();
            payment.setPaymentStatus("FAILED");
            paymentRepository.save(payment);
        }

        return EntityMapper.toOrderDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + orderId));

        String currentStatus = order.getStatus();

        if (currentStatus.equals("HUY") || currentStatus.equals("HOAN_THANH")) {
            throw new BadRequestException("Không thể chuyển đổi trạng thái cho đơn hàng đã Hủy hoặc Hoàn thành");
        }

        boolean isValidTransition = false;
        if (currentStatus.equals("CHO_XAC_NHAN") && (newStatus.equals("DA_XAC_NHAN") || newStatus.equals("HUY"))) {
            isValidTransition = true;
        } else if (currentStatus.equals("DA_XAC_NHAN") && newStatus.equals("DANG_GIAO")) {
            isValidTransition = true;
        } else if (currentStatus.equals("DANG_GIAO") && newStatus.equals("HOAN_THANH")) {
            isValidTransition = true;
        }

        if (!isValidTransition) {
            throw new BadRequestException("Luồng chuyển trạng thái không hợp lệ: Không được nhảy từ '" + currentStatus + "' sang '" + newStatus + "'");
        }

        order.setStatus(newStatus);

        if (newStatus.equals("HUY")) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Inventory inventory = item.getProduct().getInventory();
                    if (inventory != null) {
                        inventory.setCurrentStock(inventory.getCurrentStock() + item.getQuantity());
                        inventoryRepository.save(inventory);
                    }
                }
            }
            if (order.getCouponCode() != null) {
                couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
                    if (coupon.getUsedCount() > 0) {
                        coupon.setUsedCount(coupon.getUsedCount() - 1);
                        couponRepository.save(coupon);
                    }
                });
            }
            if (order.getPayment() != null) {
                Payment payment = order.getPayment();
                payment.setPaymentStatus("FAILED");
                paymentRepository.save(payment);
            }
        }

        if (newStatus.equals("HOAN_THANH")) {
            if (order.getPayment() != null) {
                Payment payment = order.getPayment();
                payment.setPaymentStatus("COMPLETED");
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return EntityMapper.toOrderDTO(updatedOrder);
    }
}
