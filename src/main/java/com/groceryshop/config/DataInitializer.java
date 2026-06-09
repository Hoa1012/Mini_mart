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
            categoryRepository.save(Category.builder().name("Rau Củ Quả").description("Rau củ tươi ngon VietGAP").image("https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=300&auto=format&fit=crop").isActive(true).build());
            categoryRepository.save(Category.builder().name("Thực Phẩm Khô").description("Mì ăn liền, gạo, gia vị").image("https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300&auto=format&fit=crop").isActive(true).build());
            categoryRepository.save(Category.builder().name("Sữa & Bơ sữa").description("Sữa tươi tiệt trùng, bơ, sữa chua").image("https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=300&auto=format&fit=crop").isActive(true).build());
            categoryRepository.save(Category.builder().name("Đồ Uống").description("Nước ngọt, bia, nước trái cây").image("https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop").isActive(true).build());
            categoryRepository.save(Category.builder().name("Hóa Mỹ Phẩm").description("Dầu gội, bột giặt, nước rửa chén").image("https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=300&auto=format&fit=crop").isActive(true).build());
        } else {
            // Auto-update old placeholder images to real images for existing DB
            categoryRepository.findByName("Rau Củ Quả").ifPresent(c -> { c.setImage("https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=300&auto=format&fit=crop"); categoryRepository.save(c); });
            categoryRepository.findByName("Thực Phẩm Khô").ifPresent(c -> { c.setImage("https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300&auto=format&fit=crop"); categoryRepository.save(c); });
            categoryRepository.findByName("Sữa & Bơ sữa").ifPresent(c -> { c.setImage("https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=300&auto=format&fit=crop"); categoryRepository.save(c); });
            categoryRepository.findByName("Đồ Uống").ifPresent(c -> { c.setImage("https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop"); categoryRepository.save(c); });
            categoryRepository.findByName("Hóa Mỹ Phẩm").ifPresent(c -> { c.setImage("https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=300&auto=format&fit=crop"); categoryRepository.save(c); });
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

        Category kho = categoryRepository.findByName("Thực Phẩm Khô").orElse(null);
        Category nuoc = categoryRepository.findByName("Đồ Uống").orElse(null);
        Category hoaMyPham = categoryRepository.findByName("Hóa Mỹ Phẩm").orElse(null);
        Brand acecook = brandRepository.findByName("Acecook").orElse(null);
        Brand cocaCola = brandRepository.findByName("Coca Cola").orElse(null);
        Brand unilever = brandRepository.findByName("Unilever").orElse(null);

        if (productRepository.count() == 0) {
            Product p1 = productRepository.save(Product.builder().name("Xà lách thủy canh sạch").description("Xà lách tươi ngon được trồng theo phương pháp thủy canh, sạch sẽ an toàn.").price(BigDecimal.valueOf(25000)).salePrice(BigDecimal.valueOf(20000)).category(rauCu).brand(farm).mainImage("/uploads/1.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p1).currentStock(4).minimumStock(5).location("Kệ A1 - Rau củ").build());

            Product p2 = productRepository.save(Product.builder().name("Cà chua VietGAP 1kg").description("Cà chua đỏ chín tự nhiên, nhiều dinh dưỡng, không hóa chất bảo quản.").price(BigDecimal.valueOf(35000)).salePrice(BigDecimal.valueOf(30000)).category(rauCu).brand(farm).mainImage("/uploads/3.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p2).currentStock(25).minimumStock(5).location("Kệ A2 - Rau củ").build());

            Product p3 = productRepository.save(Product.builder().name("Mì Hảo Hảo Tôm Chua Cay").description("Mì ăn liền Hảo Hảo hương vị tôm chua cay truyền thống, thùng 30 gói.").price(BigDecimal.valueOf(135000)).salePrice(BigDecimal.valueOf(128000)).category(kho).brand(acecook).mainImage("/uploads/4.webp").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p3).currentStock(3).minimumStock(5).location("Kệ B1 - Hàng khô").build());

            Product p4 = productRepository.save(Product.builder().name("Dầu ăn Simply Đậu Nành 1L").description("Dầu ănSimply 100% nguyên chất từ hạt đậu nành chọn lọc, tốt cho tim mạch.").price(BigDecimal.valueOf(62000)).salePrice(null).category(kho).brand(unilever).mainImage("/uploads/5.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p4).currentStock(50).minimumStock(5).location("Kệ B2 - Hàng khô").build());

            Product p5 = productRepository.save(Product.builder().name("Sữa tươi Vinamilk ít đường 1L").description("Sữa tươi tiệt trùng Vinamilk bổ sung vitamin AD3 giúp xương chắc khỏe.").price(BigDecimal.valueOf(38000)).salePrice(BigDecimal.valueOf(36000)).category(sua).brand(vinamilk).mainImage("/uploads/6.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p5).currentStock(12).minimumStock(5).location("Tủ lạnh 1 - Sữa").build());

            Product p6 = productRepository.save(Product.builder().name("Sữa chua Vinamilk có đường hộp 100g").description("Sữa chua ăn Vinamilk thơm ngon tự nhiên, hỗ trợ tiêu hóa tốt.").price(BigDecimal.valueOf(8000)).salePrice(null).category(sua).brand(vinamilk).mainImage("/uploads/7.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p6).currentStock(100).minimumStock(5).location("Tủ lạnh 1 - Sữa").build());

            Product p7 = productRepository.save(Product.builder().name("Nước ngọt Coca Cola lon 320ml").description("Nước giải khát có ga Coca Cola sảng khoái cực độ.").price(BigDecimal.valueOf(11000)).salePrice(BigDecimal.valueOf(10000)).category(nuoc).brand(cocaCola).mainImage("/uploads/8.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p7).currentStock(120).minimumStock(5).location("Kệ C1 - Đồ uống").build());

            Product p8 = productRepository.save(Product.builder().name("Bia Heineken lon 330ml").description("Bia Heineken Premium chất lượng thượng hạng từ Hà Lan.").price(BigDecimal.valueOf(22000)).salePrice(BigDecimal.valueOf(21000)).category(nuoc).brand(cocaCola).mainImage("/uploads/9.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p8).currentStock(60).minimumStock(5).location("Kệ C2 - Đồ uống").build());

            Product p9 = productRepository.save(Product.builder().name("Dầu gội Clear Bạc Hà Mát Lạnh 630ml").description("Dầu gội sạch gàu số 1 Việt Nam với tinh chất bạc hà.").price(BigDecimal.valueOf(175000)).salePrice(BigDecimal.valueOf(160000)).category(hoaMyPham).brand(unilever).mainImage("/uploads/10.webp").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p9).currentStock(2).minimumStock(5).location("Kệ D1 - Hóa phẩm").build());

            Product p10 = productRepository.save(Product.builder().name("Nước lau sàn Sunlight Hoa Lilia 1kg").description("Nước lau sàn Sunlight hương hoa Lilia thơm ngát, sạch bóng.").price(BigDecimal.valueOf(32000)).salePrice(null).category(hoaMyPham).brand(unilever).mainImage("/uploads/11.jpg").isActive(true).build());
            inventoryRepository.save(Inventory.builder().product(p10).currentStock(30).minimumStock(5).location("Kệ D2 - Hóa phẩm").build());
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
