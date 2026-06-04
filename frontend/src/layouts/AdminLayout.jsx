import React, { useContext } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { LayoutDashboard, FolderKanban, Apple, PackageCheck, Tag, ShoppingBag, Users, Star, LogOut, Home } from 'lucide-react'
import './Layouts.css'

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/categories', name: 'Danh mục', icon: <FolderKanban size={20} /> },
    { path: '/admin/products', name: 'Sản phẩm', icon: <Apple size={20} /> },
    { path: '/admin/inventory', name: 'Tồn kho', icon: <PackageCheck size={20} /> },
    { path: '/admin/coupons', name: 'Mã giảm giá', icon: <Tag size={20} /> },
    { path: '/admin/orders', name: 'Đơn hàng', icon: <ShoppingBag size={20} /> },
    { path: '/admin/users', name: 'Người dùng', icon: <Users size={20} /> },
    { path: '/admin/reviews', name: 'Đánh giá', icon: <Star size={20} /> },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-title">MART ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="admin-container">
        <header className="admin-header glass">
          <div className="header-title">
            <h2>Hệ thống quản lý Siêu thị</h2>
          </div>
          <div className="header-admin-info">
            <div className="admin-profile">
              <span className="admin-name">{user?.fullName}</span>
              <span className="admin-badge">Admin</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
