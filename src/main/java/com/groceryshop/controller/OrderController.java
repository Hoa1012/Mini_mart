package com.groceryshop.controller;

import com.groceryshop.dto.OrderDTO;
import com.groceryshop.security.UserPrincipal;
import com.groceryshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderDTO> createOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody OrderDTO orderDTO) {
        return ResponseEntity.ok(orderService.createOrder(userPrincipal.getId(), orderDTO));
    }

    @GetMapping("/api/orders/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(orderService.getMyOrders(userPrincipal.getId()));
    }

    @PutMapping("/api/orders/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(userPrincipal.getId(), id));
    }

    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/api/admin/orders/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
