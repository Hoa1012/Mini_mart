import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../contexts/CartContext'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import './Cart.css'

const Cart = () => {
  const { cart, cartSubtotal, updateCartItem, removeCartItem, loading } = useContext(CartContext)
  const [errorMap, setErrorMap] = useState({})
  const navigate = useNavigate()

  const handleQtyChange = async (productId, newQty, maxStock) => {
    if (newQty < 1) return
    if (newQty > maxStock) {
      setErrorMap(prev => ({ ...prev, [productId]: `Chỉ còn ${maxStock} sản phẩm trong kho` }))
      setTimeout(() => {
        setErrorMap(prev => ({ ...prev, [productId]: '' }))
      }, 2000)
      return
    }

    setErrorMap(prev => ({ ...prev, [productId]: '' }))
    try {
      await updateCartItem(productId, newQty)
    } catch (err) {
      setErrorMap(prev => ({ ...prev, [productId]: err }))
    }
  }

  const handleRemove = async (productId) => {
    try {
      await removeCartItem(productId)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && cart.items.length === 0) {
    return <div className="loading-state">Đang tải giỏ hàng...</div>
  }

  return (
    <div className="cart-page">
      <h1 className="page-title"><ShoppingBag size={28} /> Giỏ hàng của bạn</h1>

      {cart.items && cart.items.length > 0 ? (
        <div className="cart-grid">
          {/* List Items */}
          <div className="cart-items-list glass">
            {cart.items.map(item => {
              const price = item.productSalePrice != null ? item.productSalePrice : item.productPrice
              const itemTotal = price * item.quantity

              return (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-img">
                    <img src={item.productMainImage} alt={item.productName} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' }} />
                  </div>
                  
                  <div className="cart-item-details">
                    <Link to={`/products/${item.productId}`} className="item-name">{item.productName}</Link>
                    <span className="item-stock-warning">Kho còn: {item.maxStock} sản phẩm</span>
                  </div>

                  <div className="cart-item-price">
                    {item.productSalePrice != null ? (
                      <>
                        <span className="current-price">{item.productSalePrice.toLocaleString()}đ</span>
                        <span className="old-price">{item.productPrice.toLocaleString()}đ</span>
                      </>
                    ) : (
                      <span className="current-price">{item.productPrice.toLocaleString()}đ</span>
                    )}
                  </div>

                  <div className="cart-item-qty">
                    <div className="quantity-selector qty-cart">
                      <button onClick={() => handleQtyChange(item.productId, item.quantity - 1, item.maxStock)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.productId, item.quantity + 1, item.maxStock)}>+</button>
                    </div>
                    {errorMap[item.productId] && <span className="item-qty-error">{errorMap[item.productId]}</span>}
                  </div>

                  <div className="cart-item-total">
                    <strong>{itemTotal.toLocaleString()}đ</strong>
                  </div>

                  <button className="delete-item-btn" onClick={() => handleRemove(item.productId)} title="Xóa khỏi giỏ hàng">
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Checkout Summary Card */}
          <div className="cart-summary-card glass">
            <h3>Tóm tắt đơn hàng</h3>
            
            <div className="summary-row">
              <span>Tạm tính ({cart.items.length} mặt hàng)</span>
              <span>{cartSubtotal.toLocaleString()}đ</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="shipping-free">Miễn phí</span>
            </div>

            <div className="summary-total-row">
              <span>Tổng thanh toán</span>
              <strong>{cartSubtotal.toLocaleString()}đ</strong>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn btn-primary checkout-btn">
              Tiến hành thanh toán <ArrowRight size={18} />
            </button>

            <Link to="/products" className="continue-shopping">Tiếp tục mua sắm</Link>
          </div>
        </div>
      ) : (
        <div className="empty-cart-state glass">
          <ShoppingBag size={64} className="empty-cart-icon" />
          <h3>Giỏ hàng của bạn đang trống!</h3>
          <p>Hãy thêm các sản phẩm tươi sạch và tiêu dùng thiết yếu từ siêu thị MiniMart vào giỏ hàng.</p>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      )}
    </div>
  )
}

export default Cart
