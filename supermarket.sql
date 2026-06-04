-- =============================================
-- MINI SUPERMARKET & GROCERY STORE DATABASE - SQL SERVER SCRIPT
-- Chay file nay trong SQL Server Management Studio
-- =============================================

-- Tao database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'supermarket_db')
BEGIN
    CREATE DATABASE supermarket_db;
END
GO

USE supermarket_db;
GO

-- =============================================
-- XOA DU LIEU CU VA RESET IDENTITY DE TRANH LOI TRUNG LAP KHI CHAY LAI
-- =============================================
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM cart_items;
DELETE FROM cart;
DELETE FROM inventory;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM addresses;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM categories;
DELETE FROM brands;
DELETE FROM coupons;
GO

DBCC CHECKIDENT ('roles', RESEED, 0);
DBCC CHECKIDENT ('users', RESEED, 0);
DBCC CHECKIDENT ('categories', RESEED, 0);
DBCC CHECKIDENT ('brands', RESEED, 0);
DBCC CHECKIDENT ('products', RESEED, 0);
DBCC CHECKIDENT ('product_images', RESEED, 0);
DBCC CHECKIDENT ('inventory', RESEED, 0);
DBCC CHECKIDENT ('cart', RESEED, 0);
DBCC CHECKIDENT ('cart_items', RESEED, 0);
DBCC CHECKIDENT ('orders', RESEED, 0);
DBCC CHECKIDENT ('order_items', RESEED, 0);
DBCC CHECKIDENT ('payments', RESEED, 0);
DBCC CHECKIDENT ('reviews', RESEED, 0);
DBCC CHECKIDENT ('coupons', RESEED, 0);
DBCC CHECKIDENT ('addresses', RESEED, 0);
GO

-- =============================================
-- 1. BANG ROLES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='roles' AND xtype='U')
CREATE TABLE roles (
    id   BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- =============================================
-- 2. BANG USERS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    username    NVARCHAR(50)  NOT NULL UNIQUE,
    email       NVARCHAR(100) NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,
    full_name   NVARCHAR(100),
    phone       NVARCHAR(20),
    role_id     BIGINT REFERENCES roles(id),
    is_active   BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 3. BANG ADDRESSES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='addresses' AND xtype='U')
CREATE TABLE addresses (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    receiver_name   NVARCHAR(100) NOT NULL,
    receiver_phone  NVARCHAR(20) NOT NULL,
    province        NVARCHAR(100) NOT NULL,
    district        NVARCHAR(100) NOT NULL,
    ward            NVARCHAR(100) NOT NULL,
    detail_address  NVARCHAR(255) NOT NULL,
    is_default      BIT NOT NULL DEFAULT 0
);
GO

-- =============================================
-- 4. BANG CATEGORIES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
CREATE TABLE categories (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    image       NVARCHAR(255),
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 5. BANG BRANDS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brands' AND xtype='U')
CREATE TABLE brands (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 6. BANG PRODUCTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
CREATE TABLE products (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    name           NVARCHAR(255) NOT NULL UNIQUE,
    description    NVARCHAR(MAX),
    price          DECIMAL(18,2) NOT NULL CHECK (price >= 0),
    sale_price     DECIMAL(18,2) CHECK (sale_price >= 0),
    category_id    BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id       BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    main_image     NVARCHAR(255),
    is_active      BIT           NOT NULL DEFAULT 1,
    created_at     DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME2
);
GO

-- =============================================
-- 7. BANG PRODUCT_IMAGES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='product_images' AND xtype='U')
CREATE TABLE product_images (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_path NVARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);
GO

-- =============================================
-- 8. BANG INVENTORY
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='inventory' AND xtype='U')
CREATE TABLE inventory (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id    BIGINT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 5 CHECK (minimum_stock >= 0),
    location      NVARCHAR(100),
    last_updated  DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 9. BANG COUPONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='coupons' AND xtype='U')
CREATE TABLE coupons (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    code              NVARCHAR(50)   NOT NULL UNIQUE,
    description       NVARCHAR(255),
    discount_type     NVARCHAR(20)   NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE | FIXED_AMOUNT
    discount_value    DECIMAL(18,2)  NOT NULL CHECK (discount_value > 0),
    start_date        DATETIME2      NOT NULL DEFAULT GETDATE(),
    end_date          DATETIME2      NOT NULL,
    min_order_amount  DECIMAL(18,2)  DEFAULT 0 CHECK (min_order_amount >= 0),
    used_count        INT            NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    max_uses          INT            DEFAULT 100 CHECK (max_uses >= 0),
    is_active         BIT            NOT NULL DEFAULT 1,
    created_at        DATETIME2      NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 10. BANG CART
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cart' AND xtype='U')
CREATE TABLE cart (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id    BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 11. BANG CART_ITEMS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cart_items' AND xtype='U')
CREATE TABLE cart_items (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    cart_id    BIGINT REFERENCES cart(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    CONSTRAINT UQ_cart_product UNIQUE (cart_id, product_id)
);
GO

-- =============================================
-- 12. BANG ORDERS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
CREATE TABLE orders (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id          BIGINT REFERENCES users(id) ON DELETE SET NULL,
    total_amount     DECIMAL(18,2) NOT NULL CHECK (total_amount >= 0),
    discount_amount  DECIMAL(18,2) DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount     DECIMAL(18,2) NOT NULL CHECK (final_amount >= 0),
    status           NVARCHAR(30)  NOT NULL DEFAULT 'CHO_XAC_NHAN',
    -- CHO_XAC_NHAN | DA_XAC_NHAN | DANG_GIAO | HOAN_THANH | HUY
    shipping_name    NVARCHAR(100) NOT NULL,
    shipping_phone   NVARCHAR(20)  NOT NULL,
    shipping_address NVARCHAR(500) NOT NULL,
    payment_method   NVARCHAR(50)  NOT NULL DEFAULT 'COD', -- COD | BANK_TRANSFER
    coupon_code      NVARCHAR(50),
    note             NVARCHAR(500),
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2
);
GO

-- =============================================
-- 13. BANG ORDER_ITEMS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
CREATE TABLE order_items (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id     BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id   BIGINT REFERENCES products(id) ON DELETE SET NULL,
    quantity     INT           NOT NULL CHECK (quantity > 0),
    price        DECIMAL(18,2) NOT NULL CHECK (price >= 0),
    product_name NVARCHAR(255) NOT NULL,
    product_image NVARCHAR(255)
);
GO

-- =============================================
-- 14. BANG PAYMENTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
CREATE TABLE payments (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id       BIGINT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    payment_method NVARCHAR(50) NOT NULL,
    payment_status NVARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | FAILED
    transaction_id NVARCHAR(100),
    amount         DECIMAL(18,2) NOT NULL CHECK (amount >= 0),
    paid_at        DATETIME2
);
GO

-- =============================================
-- 15. BANG REVIEWS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reviews' AND xtype='U')
CREATE TABLE reviews (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     NVARCHAR(1000),
    is_approved BIT NOT NULL DEFAULT 0,
    created_at  DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- SEED DATA MAU (SAMPLE DATA)
-- =============================================

-- 1. Insert Roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');

-- 2. Insert Users (Mat khau mac dinh la 'password123')
INSERT INTO users (username, email, password, full_name, phone, role_id, is_active) VALUES
('admin', 'admin@supermarket.com', 'password123', N'Quản Trị Viên', '0912345678', 1, 1),
('user1', 'user1@gmail.com', 'password123', N'Nguyễn Văn A', '0987654321', 2, 1),
('user2', 'user2@gmail.com', 'password123', N'Trần Thị B', '0977888999', 2, 1);

-- 3. Insert Addresses
INSERT INTO addresses (user_id, receiver_name, receiver_phone, province, district, ward, detail_address, is_default) VALUES
(2, N'Nguyễn Văn A', '0987654321', N'Hà Nội', N'Cầu Giấy', N'Dịch Vọng Hậu', N'Số 12 Ngõ 86 Duy Tân', 1),
(3, N'Trần Thị B', '0977888999', N'TP Hồ Chí Minh', N'Quận 1', N'Bến Nghé', N'100 Lê Lợi', 1);

-- 4. Insert Categories
INSERT INTO categories (name, description, image, is_active) VALUES
(N'Rau Củ Quả', N'Rau củ tươi ngon mỗi ngày, chuẩn VietGAP', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=300&auto=format&fit=crop', 1),
(N'Thực Phẩm Khô', N'Mì tôm, gia vị, gạo, đồ đóng hộp tiện lợi', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=300&auto=format&fit=crop', 1),
(N'Sữa & Sản Phẩm Từ Sữa', N'Sữa tươi, sữa chua, bơ sữa chất lượng cao', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=300&auto=format&fit=crop', 1),
(N'Đồ Uống', N'Nước ngọt, bia, nước trái cây giải khát', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop', 1),
(N'Hóa Mỹ Phẩm', N'Dầu gội, bột giặt, nước rửa chén, chất tẩy rửa', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop', 1);

-- 5. Insert Brands
INSERT INTO brands (name, description, is_active) VALUES
(N'VietGAP Farm', N'Nông trại liên kết sản xuất rau quả sạch', 1),
(N'Acecook', N'Thương hiệu mì và thực phẩm ăn liền nổi tiếng', 1),
(N'Vinamilk', N'Công ty sữa hàng đầu Việt Nam', 1),
(N'Coca Cola', N'Thương hiệu đồ uống giải khát toàn cầu', 1),
(N'Unilever', N'Tập đoàn hóa mỹ phẩm và tiêu dùng nhanh toàn cầu', 1);

-- 6. Insert Products
INSERT INTO products (name, description, price, sale_price, category_id, brand_id, main_image, is_active) VALUES
-- Rau cu
(N'Xà lách thủy canh sạch', N'Xà lách tươi ngon được trồng theo phương pháp thủy canh, sạch sẽ an toàn.', 25000, 20000, 1, 1, '/uploads/1.jpg', 1),
(N'Cà chua VietGAP 1kg', N'Cà chua đỏ chín tự nhiên, nhiều dinh dưỡng, không hóa chất bảo quản.', 35000, 30000, 1, 1, '/uploads/3.jpg', 1),
-- Kho
(N'Mì Hảo Hảo Tôm Chua Cay', N'Mì ăn liền Hảo Hảo hương vị tôm chua cay truyền thống, thùng 30 gói.', 135000, 128000, 2, 2, '/uploads/4.webp', 1),
(N'Dầu ăn Simply Đậu Nành 1L', N'Dầu ănSimply 100% nguyên chất từ hạt đậu nành chọn lọc, tốt cho tim mạch.', 62000, NULL, 2, 5, '/uploads/5.jpg', 1),
-- Sua
(N'Sữa tươi Vinamilk ít đường 1L', N'Sữa tươi tiệt trùng Vinamilk bổ sung vitamin AD3 giúp xương chắc khỏe.', 38000, 36000, 3, 3, '/uploads/6.jpg', 1),
(N'Sữa chua Vinamilk có đường hộp 100g', N'Sữa chua ăn Vinamilk thơm ngon tự nhiên, hỗ trợ tiêu hóa tốt.', 8000, NULL, 3, 3, '/uploads/7.jpg', 1),
-- Do uong
(N'Nước ngọt Coca Cola lon 320ml', N'Nước giải khát có ga Coca Cola sảng khoái cực độ.', 11000, 10000, 4, 4, '/uploads/8.jpg', 1),
(N'Bia Heineken lon 330ml', N'Bia Heineken Premium chất lượng thượng hạng từ Hà Lan.', 22000, 21000, 4, 4, '/uploads/9.jpg', 1),
-- Hoa my pham
(N'Dầu gội Clear Bạc Hà Mát Lạnh 630ml', N'Dầu gội sạch gàu số 1 Việt Nam với tinh chất bạc hà.', 175000, 160000, 5, 5, '/uploads/10.webp', 1),
(N'Nước lau sàn Sunlight Hoa Lilia 1kg', N'Nước lau sàn Sunlight hương hoa Lilia thơm ngát, sạch bóng.', 32000, NULL, 5, 5, '/uploads/11.jpg', 1);

-- 7. Insert Product Images
INSERT INTO product_images (product_id, image_path, sort_order) VALUES
(1, '/uploads/1.jpg', 0),
(1, '/uploads/1.jpg', 1),
(2, '/uploads/3.jpg', 0),
(3, '/uploads/4.webp', 0),
(4, '/uploads/5.jpg', 0),
(5, '/uploads/6.jpg', 0),
(6, '/uploads/7.jpg', 0),
(7, '/uploads/8.jpg', 0),
(8, '/uploads/9.jpg', 0),
(9, '/uploads/10.webp', 0),
(10, '/uploads/11.jpg', 0);

-- 8. Insert Inventory
-- CHÚ Ý: Cần có đủ tồn kho cho các sản phẩm, có một vài sản phẩm tồn kho < 5 để test cảnh báo
INSERT INTO inventory (product_id, current_stock, minimum_stock, location, last_updated) VALUES
(1, 4, 5, N'Kệ A1 - Rau củ', GETDATE()),     -- Cảnh báo (< 5)
(2, 25, 5, N'Kệ A2 - Rau củ', GETDATE()),
(3, 3, 5, N'Kệ B1 - Hàng khô', GETDATE()),    -- Cảnh báo (< 5)
(4, 50, 5, N'Kệ B2 - Hàng khô', GETDATE()),
(5, 12, 5, N'Tủ lạnh 1 - Sữa', GETDATE()),
(6, 100, 5, N'Tủ lạnh 1 - Sữa', GETDATE()),
(7, 120, 5, N'Kệ C1 - Đồ uống', GETDATE()),
(8, 60, 5, N'Kệ C2 - Đồ uống', GETDATE()),
(9, 2, 5, N'Kệ D1 - Hóa phẩm', GETDATE()),     -- Cảnh báo (< 5)
(10, 30, 5, N'Kệ D2 - Hóa phẩm', GETDATE());

-- 9. Insert Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, start_date, end_date, min_order_amount, used_count, max_uses, is_active) VALUES
('WELCOME10', N'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10, '2026-01-01', '2027-12-31', 50000, 0, 1000, 1),
('SIEUCAOCAP', N'Giảm 50.000đ cho đơn từ 200.000đ', 'FIXED_AMOUNT', 50000, '2026-01-01', '2027-12-31', 200000, 0, 200, 1),
('FREESHIP', N'Giảm 15.000đ cho mọi đơn hàng', 'FIXED_AMOUNT', 15000, '2026-01-01', '2027-12-31', 0, 0, 500, 1);

-- 10. Insert Reviews
INSERT INTO reviews (product_id, user_id, rating, comment, is_approved) VALUES
(1, 2, 5, N'Rau rất tươi xanh, đóng gói sạch sẽ.', 1),
(1, 3, 4, N'Giao hàng nhanh, rau tươi ngon.', 1),
(3, 2, 5, N'Mì hảo hảo ăn ngon, date xa.', 1);

PRINT N'✅ Database supermarket_db đã được khởi tạo thành công!';
PRINT N'📧 Tài khoản Admin: admin / password123';
PRINT N'📧 Tài khoản User 1: user1 / password123';
PRINT N'📧 Tài khoản User 2: user2 / password123';
GO
