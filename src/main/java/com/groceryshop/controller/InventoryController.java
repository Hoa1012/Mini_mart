package com.groceryshop.controller;

import com.groceryshop.entity.Inventory;
import com.groceryshop.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockWarnings() {
        return ResponseEntity.ok(inventoryService.getLowStockWarnings());
    }

    // Ghi đè tuyệt đối
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Integer currentStock = payload.get("currentStock") != null ? Integer.parseInt(payload.get("currentStock").toString()) : null;
        String location = payload.get("location") != null ? payload.get("location").toString() : null;
        return ResponseEntity.ok(inventoryService.updateStock(id, currentStock, location));
    }

    // Nhập thêm hàng (cộng dồn vào tồn kho hiện tại)
    @PostMapping("/{id}/add-stock")
    public ResponseEntity<Inventory> addStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Integer quantity = payload.get("quantity") != null ? Integer.parseInt(payload.get("quantity").toString()) : null;
        String location = payload.get("location") != null ? payload.get("location").toString() : null;
        return ResponseEntity.ok(inventoryService.addStock(id, quantity, location));
    }
}

