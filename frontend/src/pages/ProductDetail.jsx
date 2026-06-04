import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import { ShoppingCart, Star, MessageSquare } from 'lucide-react'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)

  const { addToCart } = useContext(CartContext)
  const { isAuthenticated, user } = useContext(AuthContext)

  // Review states
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [cartSuccess, setCartSuccess] = useState('')
  const [cartError, setCartError] = useState('')

  const fetchProductData = async () => {
    try {
      const prodRes = await api.get(`/api/public/products/${id}`)
      const revRes = await api.get(`/api/public/products/${id}/reviews`)
      setProduct(prodRes.data)
      setReviews(revRes.data)
      setActiveImage(prodRes.data.mainImage)
    } catch (err) {
      console.error('Không tìm thấy thông tin sản phẩm', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [id])

  const handleAddToCart = async () => {
    setCartError('')
    setCartSuccess('')
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await addToCart(product.id, quantity)
      setCartSuccess('Đã thêm sản phẩm vào giỏ hàng thành công!')
      setTimeout(() => {
        setCartSuccess('')
      }, 2000)
    } catch (err) {
      setCartError(err)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await api.post('/api/reviews', { productId: product.id, rating, comment })
      setReviewSuccess('Đánh giá của bạn đã được gửi thành công và đang chờ Admin duyệt!')
      setComment('')
      setRating(5)
      // Nạp lại data sau khi gửi (mặc định review mới gửi ở dạng isApproved = false nên chưa xuất hiện trong danh sách approved)
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Không thể gửi đánh giá')
    }
  }

  if (loading) {
    return <div className="loading-state">Đang tải chi tiết sản phẩm...</div>
  }

  if (!product) {
    return (
      <div className="empty-products glass">
        <h3>Không tìm thấy sản phẩm!</h3>
        <p>Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">Xem sản phẩm khác</button>
      </div>
    )
  }

  const isSale = product.salePrice != null
  const isOutOfStock = product.currentStock <= 0
  const images = [product.mainImage]
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img !== product.mainImage) images.push(img)
    })
  }

  return (
    <div className="product-detail-page">
      {/* Thông tin sản phẩm chính */}
      <section className="detail-container glass">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="detail-main-img-box">
            <img src={activeImage} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  className={`detail-thumb ${img === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="detail-info">
          <span className="detail-cat-name">{product.categoryName}</span>
          <h1 className="detail-title-name">{product.name}</h1>
          <div className="detail-brand-name">Thương hiệu: <strong>{product.brandName}</strong></div>

          <div className="detail-price-row">
            {isSale ? (
              <>
                <span className="detail-sale-price">{product.salePrice.toLocaleString()}đ</span>
                <span className="detail-original-price">{product.price.toLocaleString()}đ</span>
                <span className="detail-discount">
                  -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="detail-normal-price">{product.price.toLocaleString()}đ</span>
            )}
          </div>

          <div className="detail-stock-status">
            Trạng thái: 
            {isOutOfStock ? (
              <span className="out-of-stock"> Hết hàng</span>
            ) : (
              <span className="in-stock"> Còn hàng ({product.currentStock} sản phẩm sẵn có)</span>
            )}
          </div>

          <p className="detail-desc-text">{product.description || 'Sản phẩm siêu thị mini đảm bảo an toàn chất lượng cho mọi nhà.'}</p>

          {!isOutOfStock && (
            <div className="detail-actions-box">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.currentStock, q + 1))}>+</button>
              </div>

              <button className="btn btn-primary detail-cart-btn" onClick={handleAddToCart}>
                <ShoppingCart size={20} /> Thêm vào giỏ hàng
              </button>
            </div>
          )}

          {cartSuccess && <div className="detail-alert success-alert">{cartSuccess}</div>}
          {cartError && <div className="detail-alert error-alert">{cartError}</div>}
        </div>
      </section>

      {/* Đánh giá sản phẩm */}
      <section className="reviews-section glass">
        <h2 className="reviews-title"><MessageSquare size={24} /> Đánh giá & Phản hồi ({reviews.length})</h2>
        
        <div className="reviews-grid">
          {/* List reviews */}
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(rev => (
                <div key={rev.id} className="review-item">
                  <div className="review-header">
                    <strong>{rev.userFullName || rev.username}</strong>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < rev.rating ? 'var(--primary)' : 'none'} stroke={i < rev.rating ? 'var(--primary)' : 'var(--gray-300)'} />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              ))
            ) : (
              <p className="empty-reviews">Sản phẩm này chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
            )}
          </div>

          {/* Form đánh giá mới */}
          <div className="review-form-container">
            <h3>Viết đánh giá của bạn</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Số sao đánh giá</label>
                  <div className="rating-stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="star-btn"
                      >
                        <Star size={28} fill={star <= rating ? 'var(--primary)' : 'none'} stroke={star <= rating ? 'var(--primary)' : 'var(--gray-400)'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Nhận xét chi tiết</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (chất lượng, hương vị, đóng gói...)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-review-btn">Gửi đánh giá</button>
              </form>
            ) : (
              <div className="login-to-review glass">
                <p>Vui lòng đăng nhập để đánh giá sản phẩm này.</p>
                <Link to="/login" className="btn btn-outline">Đăng nhập ngay</Link>
              </div>
            )}

            {reviewSuccess && <div className="review-alert success-alert">{reviewSuccess}</div>}
            {reviewError && <div className="review-alert error-alert">{reviewError}</div>}
          </div>
        </div>
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
export default ProductDetail
