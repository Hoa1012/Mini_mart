package com.groceryshop.service;

import com.groceryshop.dto.CouponDTO;
import com.groceryshop.entity.Coupon;
import com.groceryshop.exception.BadRequestException;
import com.groceryshop.exception.ResourceNotFoundException;
import com.groceryshop.mapper.EntityMapper;
import com.groceryshop.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(EntityMapper::toCouponDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy coupon với id: " + id));
        return EntityMapper.toCouponDTO(coupon);
    }

    public CouponDTO getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy coupon với mã: " + code));
        return EntityMapper.toCouponDTO(coupon);
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        if (couponRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BadRequestException("Mã coupon đã tồn tại");
        }
        Coupon coupon = EntityMapper.toCouponEntity(dto);
        Coupon saved = couponRepository.save(coupon);
        return EntityMapper.toCouponDTO(saved);
    }

    @Transactional
    public CouponDTO updateCoupon(Long id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy coupon với id: " + id));

        couponRepository.findByCode(dto.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BadRequestException("Mã coupon đã được sử dụng");
                    }
                });

        coupon.setCode(dto.getCode());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setStartDate(dto.getStartDate());
        coupon.setEndDate(dto.getEndDate());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxUses(dto.getMaxUses());
        if (dto.getIsActive() != null) {
            coupon.setIsActive(dto.getIsActive());
        }

        Coupon updated = couponRepository.save(coupon);
        return EntityMapper.toCouponDTO(updated);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy coupon với id: " + id));
        couponRepository.delete(coupon);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));

        LocalDateTime now = LocalDateTime.now();
        if (!coupon.getIsActive()) {
            throw new BadRequestException("Mã giảm giá này hiện không hoạt động");
        }
        if (now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian áp dụng");
        }
        if (now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn sử dụng");
        }
        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("Mã giảm giá đã đạt số lượt sử dụng tối đa");
        }
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Giá trị đơn hàng chưa đạt tối thiểu (" + coupon.getMinOrderAmount() + "đ) để áp dụng mã này");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType().equals("PERCENTAGE")) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        } else if (coupon.getDiscountType().equals("FIXED_AMOUNT")) {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }
}
