import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/ChatBot'

// Layouts
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// User Pages
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Forbidden from './pages/Forbidden'
import OAuthCallback from './pages/OAuthCallback'
import Profile from './pages/Profile'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import CategoryManager from './pages/admin/CategoryManager'
import ProductManager from './pages/admin/ProductManager'
import InventoryManager from './pages/admin/InventoryManager'
import CouponManager from './pages/admin/CouponManager'
import OrderManager from './pages/admin/OrderManager'
import UserManager from './pages/admin/UserManager'
import ReviewManager from './pages/admin/ReviewManager'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forbidden" element={<Forbidden />} />
            {/* OAuth2 Callback - nhận token sau đăng nhập Google/Facebook */}
            <Route path="/oauth2/callback" element={<OAuthCallback />} />

            {/* User Website Layout */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              
              {/* Protected User Routes */}
              <Route 
                path="cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders" 
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Protected Admin Console Layout */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="reviews" element={<ReviewManager />} />
            </Route>

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
