# 🛒 DỰ ÁN WEBSITE QUẢN LÝ SIÊU THỊ MINI & CỬA HÀNG TẠP HÓA

Chào mừng bạn đến với dự án **Website Quản Lý Siêu Thị Mini & Cửa Hàng Tạp Hóa Online** - Một hệ thống thương mại điện tử được xây dựng trên nền tảng **Java Spring Boot MVC** kết hợp với cơ sở dữ liệu **Microsoft SQL Server** và tích hợp trợ lý AI **Google Gemini**.

Dự án được thiết kế nhằm hỗ trợ hoạt động kinh doanh của các siêu thị mini, cửa hàng tiện lợi và cửa hàng tạp hóa với đầy đủ chức năng bán hàng trực tuyến, quản lý sản phẩm, quản lý kho hàng, quản lý đơn hàng và quản lý khách hàng.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

* Java 21 (LTS)
* Spring Boot 3.x
* Spring MVC
* Spring Data JPA
* Spring Security
* Lombok

### Database

* Microsoft SQL Server

### Frontend

* Thymeleaf
* HTML5
* CSS3
* JavaScript
* Bootstrap

### AI Integration

* Google Gemini API

### Build Tool

* Apache Maven

---

## 🌟 Các Chức Năng Chính

### 1. Phân Hệ Khách Hàng (User)

#### Trang Chủ

* Hiển thị sản phẩm nổi bật
* Sản phẩm mới
* Chương trình khuyến mãi
* Danh mục sản phẩm

#### Tìm Kiếm Và Lọc Sản Phẩm

* Tìm kiếm theo tên sản phẩm
* Lọc theo danh mục
* Lọc theo thương hiệu
* Lọc theo khoảng giá
* Sắp xếp theo giá hoặc sản phẩm mới nhất

#### Chi Tiết Sản Phẩm

* Hình ảnh sản phẩm
* Mô tả sản phẩm
* Giá bán
* Tồn kho
* Đánh giá sản phẩm

#### Giỏ Hàng

* Thêm sản phẩm
* Cập nhật số lượng
* Xóa sản phẩm
* Kiểm tra tồn kho

#### Thanh Toán

* Nhập địa chỉ giao hàng
* Thanh toán khi nhận hàng (COD)
* Áp dụng mã giảm giá

#### Quản Lý Đơn Hàng

* Xem lịch sử mua hàng
* Theo dõi trạng thái đơn hàng
* Hủy đơn hàng khi đang chờ xác nhận

#### Trợ Lý AI

* Tư vấn sản phẩm
* Hỗ trợ khách hàng
* Giải đáp thông tin về sản phẩm và chương trình khuyến mãi

---

### 2. Phân Hệ Quản Trị (Admin)

#### Dashboard

* Thống kê doanh thu
* Tổng đơn hàng
* Tổng sản phẩm
* Tổng khách hàng
* Biểu đồ doanh thu

#### Quản Lý Danh Mục

* Thêm danh mục
* Cập nhật danh mục
* Xóa danh mục

#### Quản Lý Sản Phẩm

* Thêm sản phẩm
* Chỉnh sửa sản phẩm
* Xóa sản phẩm
* Upload nhiều hình ảnh

#### Quản Lý Kho Hàng

* Theo dõi tồn kho
* Cảnh báo sản phẩm sắp hết hàng
* Quản lý nhập hàng

#### Quản Lý Khuyến Mãi

* Tạo mã giảm giá
* Quản lý chương trình khuyến mãi

#### Quản Lý Đơn Hàng

* Xem đơn hàng
* Cập nhật trạng thái đơn hàng
* Quản lý giao hàng

#### Quản Lý Người Dùng

* Quản lý khách hàng
* Khóa hoặc mở khóa tài khoản

#### Quản Lý Đánh Giá

* Duyệt đánh giá
* Xóa đánh giá vi phạm

---

## 📂 Cấu Trúc Cơ Sở Dữ Liệu

Hệ thống bao gồm các bảng chính:

* Users
* Roles
* Categories
* Products
* ProductImages
* Inventory
* Suppliers
* ImportReceipts
* ImportReceiptDetails
* Orders
* OrderItems
* Cart
* CartItems
* Coupons
* Reviews
* Addresses

---

## 🚀 Chức Năng Nổi Bật

### Quản Lý Kho Thông Minh

* Tự động trừ tồn kho khi đơn hàng được xác nhận
* Cảnh báo sản phẩm sắp hết hàng
* Không cho phép đặt vượt số lượng tồn kho

### Hệ Thống Khuyến Mãi

* Mã giảm giá theo phần trăm
* Mã giảm giá theo số tiền cố định
* Điều kiện áp dụng theo giá trị đơn hàng

### Bảo Mật Hệ Thống

* Spring Security
* Phân quyền User/Admin
* Kiểm tra dữ liệu đầu vào
* Chống truy cập trái phép vào khu vực quản trị

---

## 🌐 Địa Chỉ Truy Cập

### Trang Người Dùng

http://localhost:8080

### Trang Đăng Nhập

http://localhost:8080/login

### Trang Quản Trị

http://localhost:8080/admin

---

## 🎯 Mục Tiêu Dự Án

Xây dựng một hệ thống quản lý bán hàng trực tuyến hoàn chỉnh dành cho các siêu thị mini và cửa hàng tạp hóa, hỗ trợ quản lý sản phẩm, tồn kho, đơn hàng, khách hàng và doanh thu một cách hiệu quả, đồng thời mang lại trải nghiệm mua sắm tiện lợi cho người dùng.
