package com.groceryshop.service;

import com.groceryshop.entity.Inventory;
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

    @Transactional
    public Inventory updateStock(Long id, Integer currentStock, String location) {
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
}
