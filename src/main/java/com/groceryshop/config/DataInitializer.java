package com.groceryshop.config;

import com.groceryshop.entity.*;
import com.groceryshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name("ROLE_ADMIN").build());
            roleRepository.save(Role.builder().name("ROLE_USER").build());
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
        Role userRole = roleRepository.findByName("ROLE_USER").orElse(null);

        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@supermarket.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Quản Trị Viên")
                    .phone("0912345678")
                    .role(adminRole)
                    .isActive(true)
                    .build());

            userRepository.save(User.builder()
                    .username("user1")
                    .email("user1@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Nguyễn Văn A")
                    .phone("0987654321")
                    .role(userRole)
                    .isActive(true)
                    .build());

            userRepository.save(User.builder()
                    .username("user2")
                    .email("user2@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Trần Thị B")
                    .phone("0977888999")
                    .role(userRole)
                    .isActive(true)
                    .build());
        }

        if (categoryRepository.count() == 0) {
            categoryRepository.save(Category.builder().name("Rau Củ Quả").description("Rau củ tươi ngon VietGAP").image("/uploads/cat_rau_cu.png").isActive(true).build());
            categoryRepository.save(Category.builder().name("Thực Phẩm Khô").description("Mì ăn liền, gạo, gia vị").image("/uploads/cat_kho.png").isActive(true).build());
            categoryRepository.save(Category.builder().name("Sữa & Bơ sữa").description("Sữa tươi tiệt trùng, bơ, sữa chua").image("/uploads/cat_sua.png").isActive(true).build());
            categoryRepository.save(Category.builder().name("Đồ Uống").description("Nước ngọt, bia, nước trái cây").image("/uploads/cat_nuoc.png").isActive(true).build());
            categoryRepository.save(Category.builder().name("Hóa Mỹ Phẩm").description("Dầu gội, bột giặt, nước rửa chén").image("/uploads/cat_hoa_my_pham.png").isActive(true).build());
        }

        if (brandRepository.count() == 0) {
            brandRepository.save(Brand.builder().name("VietGAP Farm").description("Rau sạch tiêu chuẩn VietGAP").isActive(true).build());
            brandRepository.save(Brand.builder().name("Acecook").description("Mì gói ăn liền Hảo Hảo").isActive(true).build());
            brandRepository.save(Brand.builder().name("Vinamilk").description("Sữa tươi, sữa chua quốc dân").isActive(true).build());
            brandRepository.save(Brand.builder().name("Coca Cola").description("Thương hiệu giải khát").isActive(true).build());
            brandRepository.save(Brand.builder().name("Unilever").description("Clear, Sunlight, Omo").isActive(true).build());
        }

        Category rauCu = categoryRepository.findByName("Rau Củ Quả").orElse(null);
        Category sua = categoryRepository.findByName("Sữa & Bơ sữa").orElse(null);
        Brand farm = brandRepository.findByName("VietGAP Farm").orElse(null);
        Brand vinamilk = brandRepository.findByName("Vinamilk").orElse(null);

        if (productRepository.count() == 0) {
            Product xalach = productRepository.save(Product.builder().name("Xà lách thủy canh sạch").description("Xà lách tươi ngon được trồng theo phương pháp thủy canh, sạch sẽ an toàn.").price(BigDecimal.valueOf(25000)).salePrice(BigDecimal.valueOf(20000)).category(rauCu).brand(farm).mainImage("/uploads/product_xalach.png").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(xalach).currentStock(4).minimumStock(5).location("Kệ A1 - Rau củ").build());

            Product suaVinamilk = productRepository.save(Product.builder().name("Sữa tươi Vinamilk ít đường 1L").description("Sữa tươi tiệt trùng Vinamilk bổ sung vitamin AD3 giúp xương chắc khỏe.").price(BigDecimal.valueOf(38000)).salePrice(BigDecimal.valueOf(36000)).category(sua).brand(vinamilk).mainImage("/uploads/product_suavinamilk.png").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(suaVinamilk).currentStock(25).minimumStock(5).location("Tủ lạnh 1 - Sữa").build());
        }

        if (couponRepository.count() == 0) {
            couponRepository.save(Coupon.builder()
                    .code("WELCOME10")
                    .description("Giảm 10% cho đơn hàng đầu tiên")
                    .discountType("PERCENTAGE")
                    .discountValue(BigDecimal.valueOf(10))
                    .startDate(LocalDateTime.now().minusDays(1))
                    .endDate(LocalDateTime.now().plusYears(1))
                    .minOrderAmount(BigDecimal.valueOf(50000))
                    .isActive(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("SIEUCAOCAP")
                    .description("Giảm 50.000đ cho đơn từ 200.000đ")
                    .discountType("FIXED_AMOUNT")
                    .discountValue(BigDecimal.valueOf(50000))
                    .startDate(LocalDateTime.now().minusDays(1))
                    .endDate(LocalDateTime.now().plusYears(1))
                    .minOrderAmount(BigDecimal.valueOf(200000))
                    .isActive(true)
                    .build());
        }
    }
}
