import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'
import { MapPin, Plus, CheckCircle, Wallet, Tag, QrCode, X, Copy, Check } from 'lucide-react'
import './Checkout.css'

// ============================================================
// ⚙️ CẤU HÌNH THANH TOÁN VIETQR - Sửa 3 dòng này
// ============================================================
const BANK_CONFIG = {
  bankId: 'VCB',                          // Mã ngân hàng (VCB, TCB, MB, ICB...)
  accountNo: '1234567890',                // Số tài khoản của shop
  accountName: 'MINIMART SHOP',           // Tên chủ tài khoản (IN HOA)
}
// ============================================================

const buildVietQRUrl = (amount, orderInfo) => {
  const { bankId, accountNo, accountName } = BANK_CONFIG
  const description = encodeURIComponent(orderInfo)
  const name = encodeURIComponent(accountName)
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${name}`
}

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Addresses
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  
  // New address form
  const [showAddForm, setShowAddForm] = useState(false)
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [ward, setWard] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  
  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Payment & general
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // QR Modal
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrOrderInfo, setQrOrderInfo] = useState('')
  const [copiedSTK, setCopiedSTK] = useState(false)
  const [qrConfirming, setQrConfirming] = useState(false)

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses')
      setAddresses(response.data)
      const defaultAddr = response.data.find(addr => addr.isDefault)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id)
      }
    } catch (err) {
      console.error('Không thể lấy địa chỉ nhận hàng', err)
    }
  }

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart')
      return
    }
    fetchAddresses()
  }, [])

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/api/addresses', {
        receiverName, receiverPhone, province, district, ward, detailAddress, isDefault
      })
      setAddresses(prev => [...prev, response.data])
      setSelectedAddressId(response.data.id)
      setShowAddForm(false)
      setReceiverName(''); setReceiverPhone(''); setProvince('')
      setDistrict(''); setWard(''); setDetailAddress(''); setIsDefault(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể thêm địa chỉ mới.')
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    setCouponError(''); setCouponSuccess(''); setDiscountAmount(0); setAppliedCoupon('')
    if (!couponCode.trim()) return
    try {
      const response = await api.post('/api/public/coupons/apply', { code: couponCode, amount: cartSubtotal })
      setDiscountAmount(response.data.discountAmount)
      setAppliedCoupon(response.data.code)
      setCouponSuccess(`Áp dụng thành công! Giảm ${response.data.discountAmount.toLocaleString()}đ`)
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Mã giảm giá không hợp lệ')
    }
  }

  const submitOrder = async () => {
    const addr = addresses.find(a => a.id === selectedAddressId)
    const fullAddrString = `${addr.detailAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`
    setLoading(true)
    try {
      await api.post('/api/orders', {
        shippingName: addr.receiverName,
        shippingPhone: addr.receiverPhone,
        shippingAddress: fullAddrString,
        paymentMethod,
        couponCode: appliedCoupon || null,
        note
      })
      clearCart()
      navigate('/orders?success=true')
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi tạo đơn hàng.')
      setShowQRModal(false)
    } finally {
      setLoading(false)
      setQrConfirming(false)
    }
  }

  const handlePlaceOrder = async () => {
    setError('')
    if (!selectedAddressId) {
      setError('Vui lòng chọn địa chỉ giao hàng')
      return
    }

    if (paymentMethod === 'BANK_TRANSFER') {
      // Hiện modal QR trước
      const orderRef = `MINIMART ${user?.username?.toUpperCase() || 'KH'} ${Date.now().toString().slice(-6)}`
      setQrOrderInfo(orderRef)
      setShowQRModal(true)
    } else {
      await submitOrder()
    }
  }

  const handleQRConfirm = async () => {
    setQrConfirming(true)
    await submitOrder()
  }

  const handleCopySTK = () => {
    navigator.clipboard.writeText(BANK_CONFIG.accountNo)
    setCopiedSTK(true)
    setTimeout(() => setCopiedSTK(false), 2000)
  }

  const finalTotal = cartSubtotal - discountAmount

  return (
    <div className="checkout-page">
      <h1 className="page-title">Thanh toán đơn hàng</h1>

      {error && <div className="checkout-general-error">{error}</div>}

      <div className="checkout-grid">
        {/* Left Column */}
        <div className="checkout-steps">
          {/* Bước 1: Địa chỉ giao hàng */}
          <div className="checkout-step-card glass">
            <div className="step-card-header">
              <h3><MapPin size={22} className="step-icon" /> 1. Địa chỉ giao hàng</h3>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="btn btn-outline add-addr-btn">
                  <Plus size={16} /> Thêm địa chỉ mới
                </button>
              )}
            </div>

            {showAddForm ? (
              <form onSubmit={handleAddAddress} className="add-address-form">
                <h4>Nhập thông tin địa chỉ mới</h4>
                <div className="form-grid-addr">
                  <div className="form-group">
                    <label>Họ tên người nhận</label>
                    <input type="text" required value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" required value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tỉnh / Thành phố</label>
                    <input type="text" required value={province} onChange={(e) => setProvince(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Quận / Huyện</label>
                    <input type="text" required value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phường / Xã</label>
                    <input type="text" required value={ward} onChange={(e) => setWard(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ chi tiết (Số nhà, ngõ...)</label>
                    <input type="text" required value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
                  </div>
                </div>
                <div className="form-checkbox-addr">
                  <label>
                    <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                    <span> Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>
                <div className="form-addr-actions">
                  <button type="submit" className="btn btn-primary">Lưu địa chỉ</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Hủy bỏ</button>
                </div>
              </form>
            ) : (
              <div className="addresses-list">
                {addresses.length > 0 ? (
                  addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`address-item-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="addr-check">
                        <CheckCircle size={20} className="check-icon" />
                      </div>
                      <div className="addr-info">
                        <div className="addr-meta">
                          <strong>{addr.receiverName}</strong>
                          <span className="addr-phone">{addr.receiverPhone}</span>
                          {addr.isDefault && <span className="default-tag">Mặc định</span>}
                        </div>
                        <p>{`${addr.detailAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-address-warn">Bạn chưa cấu hình địa chỉ nào. Hãy bấm "Thêm địa chỉ mới" để tiến hành đặt hàng!</p>
                )}
              </div>
            )}
          </div>

          {/* Bước 2: Phương thức thanh toán */}
          <div className="checkout-step-card glass">
            <h3><Wallet size={22} className="step-icon" /> 2. Phương thức thanh toán</h3>
            <div className="payment-options">
              <label className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <div className="payment-desc">
                  <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                  <p>Thanh toán bằng tiền mặt ngay khi nhân viên MiniMart giao hàng đến nhà.</p>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} />
                <div className="payment-desc">
                  <strong>🏦 Chuyển khoản ngân hàng (QR Code)</strong>
                  <p>Quét mã QR VietQR để chuyển khoản trực tiếp. Đơn hàng xác nhận khi tiền về tài khoản.</p>
                </div>
              </label>
            </div>

            {/* Preview QR khi chọn chuyển khoản */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="qr-preview-hint">
                <QrCode size={16} />
                <span>Mã QR VietQR sẽ hiển thị sau khi bạn xác nhận đặt hàng</span>
              </div>
            )}
          </div>

          {/* Ghi chú đơn hàng */}
          <div className="checkout-step-card glass">
            <h3>Ghi chú cho shipper</h3>
            <textarea
              rows="3"
              placeholder="Nhập ghi chú giao hàng (ví dụ: giao giờ hành chính, gọi trước khi đến...)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="note-textarea"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="checkout-summary-col">
          {/* Coupon Card */}
          <div className="checkout-summary-card glass margin-bottom-summary">
            <h3><Tag size={20} /> Mã giảm giá (Coupon)</h3>
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <input
                type="text"
                placeholder="Nhập mã coupon..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button type="button" onClick={() => { setAppliedCoupon(''); setDiscountAmount(0); setCouponSuccess(''); setCouponCode('') }} className="btn btn-outline remove-coupon-btn">
                  Xóa
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">Áp dụng</button>
              )}
            </form>
            {couponSuccess && <span className="coupon-alert success-text">{couponSuccess}</span>}
            {couponError && <span className="coupon-alert error-text">{couponError}</span>}
          </div>

          {/* Summary Card */}
          <div className="checkout-summary-card glass">
            <h3>Chi tiết đơn hàng</h3>
            <div className="order-items-preview">
              {cart.items.map(item => {
                const price = item.productSalePrice != null ? item.productSalePrice : item.productPrice
                return (
                  <div key={item.id} className="preview-item-row">
                    <span className="preview-name">{item.productName} <strong>x{item.quantity}</strong></span>
                    <span className="preview-price">{(price * item.quantity).toLocaleString()}đ</span>
                  </div>
                )
              })}
            </div>

            <div className="summary-details-box">
              <div className="summary-row">
                <span>Tổng tiền hàng</span>
                <span>{cartSubtotal.toLocaleString()}đ</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá</span>
                <span className="discount-value-summary">-{discountAmount.toLocaleString()}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="shipping-free">Miễn phí</span>
              </div>
              <div className="summary-total-row">
                <span>Tổng thanh toán</span>
                <strong>{finalTotal.toLocaleString()}đ</strong>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || addresses.length === 0}
              className="btn btn-primary place-order-btn"
            >
              {loading ? 'Đang xử lý đặt hàng...' : 'Xác nhận đặt hàng'}
            </button>
          </div>
        </div>
      </div>

      {/* ====== QR PAYMENT MODAL ====== */}
      {showQRModal && (
        <div className="qr-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowQRModal(false)}>
          <div className="qr-modal">
            {/* Header */}
            <div className="qr-modal-header">
              <div className="qr-modal-title">
                <QrCode size={22} />
                <span>Thanh toán chuyển khoản</span>
              </div>
              <button className="qr-close-btn" onClick={() => setShowQRModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* QR Body */}
            <div className="qr-modal-body">
              {/* Amount badge */}
              <div className="qr-amount-badge">
                <span className="qr-amount-label">Số tiền cần chuyển</span>
                <span className="qr-amount-value">{finalTotal.toLocaleString()}<small>đ</small></span>
              </div>

              {/* QR Image */}
              <div className="qr-image-wrapper">
                <img
                  src={buildVietQRUrl(finalTotal, qrOrderInfo)}
                  alt="QR thanh toán VietQR"
                  className="qr-image"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
                <div className="qr-fallback" style={{ display: 'none' }}>
                  <QrCode size={60} />
                  <p>Không tải được QR. Vui lòng chuyển khoản thủ công.</p>
                </div>
              </div>

              {/* Bank Info */}
              <div className="qr-bank-info">
                <div className="qr-bank-row">
                  <span className="qr-bank-label">Ngân hàng</span>
                  <span className="qr-bank-value">Vietcombank ({BANK_CONFIG.bankId})</span>
                </div>
                <div className="qr-bank-row">
                  <span className="qr-bank-label">Số tài khoản</span>
                  <div className="qr-stk-row">
                    <span className="qr-bank-value qr-stk">{BANK_CONFIG.accountNo}</span>
                    <button className="qr-copy-btn" onClick={handleCopySTK}>
                      {copiedSTK ? <Check size={14} /> : <Copy size={14} />}
                      {copiedSTK ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="qr-bank-row">
                  <span className="qr-bank-label">Chủ tài khoản</span>
                  <span className="qr-bank-value">{BANK_CONFIG.accountName}</span>
                </div>
                <div className="qr-bank-row">
                  <span className="qr-bank-label">Nội dung CK</span>
                  <span className="qr-bank-value qr-note">{qrOrderInfo}</span>
                </div>
              </div>

              <p className="qr-instruction">
                📱 Mở ứng dụng ngân hàng → Quét mã QR hoặc chuyển khoản thủ công với thông tin trên
              </p>
            </div>

            {/* Footer actions */}
            <div className="qr-modal-footer">
              <button className="btn btn-outline" onClick={() => setShowQRModal(false)}>
                Quay lại
              </button>
              <button
                className="btn btn-primary qr-confirm-btn"
                onClick={handleQRConfirm}
                disabled={qrConfirming}
              >
                {qrConfirming ? 'Đang xử lý...' : '✅ Tôi đã chuyển khoản xong'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
