package com.groceryshop.controller;

import com.groceryshop.dto.CouponDTO;
import com.groceryshop.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping("/api/public/coupons/apply")
    public ResponseEntity<?> applyCoupon(@RequestBody Map<String, Object> payload) {
        String code = payload.get("code").toString();
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        BigDecimal discount = couponService.calculateDiscount(code, amount);
        Map<String, Object> response = new HashMap<>();
        response.put("discountAmount", discount);
        response.put("code", code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/coupons")
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/api/admin/coupons/{id}")
    public ResponseEntity<CouponDTO> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.createCoupon(dto));
    }

    @PutMapping("/api/admin/coupons/{id}")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable Long id, @RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.updateCoupon(id, dto));
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok().body("{\"message\": \"Xóa coupon thành công\"}");
    }
}
