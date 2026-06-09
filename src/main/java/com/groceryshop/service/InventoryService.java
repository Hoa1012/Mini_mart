package com.groceryshop.service;

import com.groceryshop.entity.Inventory;
import com.groceryshop.exception.BadRequestException;
import com.groceryshop.exception.ResourceNotFoundException;
import com.groceryshop.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getLowStockWarnings() {
        return inventoryRepository.findLowStockWarnings();
    }

    // Ghi đè tuyệt đối (dùng nội bộ / admin nâng cao)
    @Transactional
    public Inventory updateStock(Long id, Integer currentStock, String location) {
        if (currentStock != null && currentStock < 0) {
            throw new BadRequestException("Số lượng tồn kho không được âm");
        }
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin kho hàng với id: " + id));
        if (currentStock != null) {
            inventory.setCurrentStock(currentStock);
        }
        if (location != null) {
            inventory.setLocation(location);
        }
        return inventoryRepository.save(inventory);
    }

    // Cộng thêm số lượng vào tồn kho hiện tại (nhập hàng)
    @Transactional
    public Inventory addStock(Long id, Integer quantity, String location) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng nhập thêm phải lớn hơn 0");
        }
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin kho hàng với id: " + id));
        inventory.setCurrentStock(inventory.getCurrentStock() + quantity);
        if (location != null && !location.isBlank()) {
            inventory.setLocation(location);
        }
        return inventoryRepository.save(inventory);
    }
}

