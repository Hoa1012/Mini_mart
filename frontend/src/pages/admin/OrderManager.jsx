import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { Eye, CheckCircle2, Truck, XCircle, FileText, ShoppingBag, MapPin, User, DollarSign, Calendar } from 'lucide-react'
import './AdminPages.css'

const OrderManager = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/admin/orders')
      setOrders(response.data)
      setFilteredOrders(response.data)
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err)
      setError('Không thể lấy danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(o => o.status === statusFilter))
    }
  }, [statusFilter, orders])

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${getStatusLabel(newStatus)}"?`)) return
    setUpdating(true)
    setError('')
    try {
      const response = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      // Cập nhật state cục bộ
      const updatedOrder = response.data
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder)
      }
      alert('Cập nhật trạng thái thành công!')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái đơn hàng')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return 'Chờ xác nhận'
      case 'DA_XAC_NHAN': return 'Đã xác nhận'
      case 'DANG_GIAO': return 'Đang giao hàng'
      case 'HOAN_THANH': return 'Hoàn thành'
      case 'HUY': return 'Đã hủy'
      default: return status
    }
  }

  const getStatusPillClass = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return 'warning'
      case 'DA_XAC_NHAN': return 'active' // Blueish in CSS
      case 'DANG_GIAO': return 'active' // Violet/Blueish
      case 'HOAN_THANH': return 'active' // Greenish
      case 'HUY': return 'inactive' // Redish
      default: return ''
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  const getStepStatus = (orderStatus, step) => {
    const statusOrder = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'HOAN_THANH']
    if (orderStatus === 'HUY') {
      return step === 0 ? 'completed' : step === 1 ? 'cancelled' : 'pending'
    }
    const currentIndex = statusOrder.indexOf(orderStatus)
    if (currentIndex >= step) return 'completed'
    return 'pending'
  }

  if (loading) {
    return <div className="loading-state">Đang tải danh sách đơn hàng...</div>
  }

  return (
    <div className="admin-crud-page">
      <div className="crud-header">
        <h2>Quản lý Đơn hàng</h2>
        
        {/* Lọc đơn hàng */}
        <div className="filter-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Lọc trạng thái:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--admin-card-bg)',
              color: 'var(--admin-text-primary)',
              border: '1px solid var(--admin-border)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tất cả đơn hàng</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_XAC_NHAN">Đã xác nhận</option>
            <option value="DANG_GIAO">Đang giao hàng</option>
            <option value="HOAN_THANH">Hoàn thành</option>
            <option value="HUY">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Danh sách đơn hàng */}
      <div className="admin-table-container glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày tạo</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{order.shippingName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>ID: {order.userId}</span>
                    </div>
                  </td>
                  <td>{order.shippingPhone}</td>
                  <td><strong>{order.finalAmount?.toLocaleString()}đ</strong></td>
                  <td>{order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}</td>
                  <td>
                    <span className={`status-pill ${getStatusPillClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => setSelectedOrder(order)} 
                        className="action-btn view" 
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-secondary)' }}>
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="admin-form-overlay">
          <div className="admin-popup-form glass" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Đóng lại
              </button>
            </div>

            {/* Quy trình đơn hàng (Stepper) */}
            <div className="order-stepper-container" style={{ margin: '1.5rem 0 2rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Line background */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '5%',
                  right: '5%',
                  height: '2px',
                  background: 'var(--admin-border)',
                  zIndex: 1
                }}></div>

                {/* Step 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '22%' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: getStepStatus(selectedOrder.status, 0) === 'completed' ? 'var(--admin-success)' : 'var(--admin-bg)',
                    border: '2px solid ' + (getStepStatus(selectedOrder.status, 0) === 'completed' ? 'var(--admin-success)' : 'var(--admin-border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    1
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--admin-text-primary)', textAlign: 'center' }}>Chờ xác nhận</span>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '22%' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: getStepStatus(selectedOrder.status, 1) === 'completed' ? 'var(--admin-success)' : selectedOrder.status === 'HUY' ? 'var(--admin-danger)' : 'var(--admin-bg)',
                    border: '2px solid ' + (getStepStatus(selectedOrder.status, 1) === 'completed' ? 'var(--admin-success)' : selectedOrder.status === 'HUY' ? 'var(--admin-danger)' : 'var(--admin-border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {selectedOrder.status === 'HUY' ? '✕' : '2'}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: selectedOrder.status === 'HUY' ? 'var(--admin-danger)' : 'var(--admin-text-primary)', textAlign: 'center' }}>
                    {selectedOrder.status === 'HUY' ? 'Đã hủy' : 'Đã xác nhận'}
                  </span>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '22%' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: getStepStatus(selectedOrder.status, 2) === 'completed' ? 'var(--admin-success)' : 'var(--admin-bg)',
                    border: '2px solid ' + (getStepStatus(selectedOrder.status, 2) === 'completed' ? 'var(--admin-success)' : 'var(--admin-border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    3
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--admin-text-primary)', textAlign: 'center' }}>Đang giao hàng</span>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '22%' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: getStepStatus(selectedOrder.status, 3) === 'completed' ? 'var(--admin-success)' : 'var(--admin-bg)',
                    border: '2px solid ' + (getStepStatus(selectedOrder.status, 3) === 'completed' ? 'var(--admin-success)' : 'var(--admin-border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    4
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--admin-text-primary)', textAlign: 'center' }}>Hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Chi tiết người nhận & thanh toán */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="glass" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-primary)' }}>
                  <User size={16} /> Thông tin khách hàng
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <div><strong>Họ tên:</strong> {selectedOrder.shippingName}</div>
                  <div><strong>Điện thoại:</strong> {selectedOrder.shippingPhone}</div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-warning)' }}>
                  <DollarSign size={16} /> Thông tin thanh toán
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <div><strong>Phương thức:</strong> {selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</div>
                  <div><strong>Tạm tính:</strong> {selectedOrder.totalAmount?.toLocaleString()}đ</div>
                  {selectedOrder.discountAmount > 0 && (
                    <div style={{ color: 'var(--admin-danger)' }}><strong>Giảm giá (Coupon):</strong> -{selectedOrder.discountAmount?.toLocaleString()}đ ({selectedOrder.couponCode})</div>
                  )}
                  <div style={{ fontSize: '1.1rem', color: 'var(--admin-success)' }}><strong>Tổng thanh toán:</strong> {selectedOrder.finalAmount?.toLocaleString()}đ</div>
                  {selectedOrder.payment && (
                    <div>
                      <strong>Trạng thái thanh toán: </strong>
                      <span className={`status-pill ${selectedOrder.payment.paymentStatus === 'COMPLETED' ? 'active' : selectedOrder.payment.paymentStatus === 'FAILED' ? 'inactive' : 'warning'}`}>
                        {selectedOrder.payment.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : selectedOrder.payment.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {selectedOrder.note && (
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid var(--admin-warning)', fontSize: '0.9rem' }}>
                <strong>Ghi chú từ khách hàng:</strong> {selectedOrder.note}
              </div>
            )}

            {/* Bảng sản phẩm trong đơn */}
            <h4 style={{ margin: '0 0 0.75rem 0' }}>Sản phẩm trong đơn ({selectedOrder.items?.length || 0})</h4>
            <div className="admin-table-container glass" style={{ marginBottom: '2rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="table-img" 
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' }} 
                        />
                      </td>
                      <td><strong>{item.productName}</strong></td>
                      <td>{item.price?.toLocaleString()}đ</td>
                      <td>{item.quantity}</td>
                      <td><strong>{(item.price * item.quantity)?.toLocaleString()}đ</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Các nút xử lý trạng thái theo luồng tuần tự */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: '1.5rem' }}>
              <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                <span>Đặt lúc: {formatDate(selectedOrder.createdAt)}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {selectedOrder.status === 'CHO_XAC_NHAN' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DA_XAC_NHAN')} 
                      disabled={updating}
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                      <CheckCircle2 size={16} /> Xác nhận đơn
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'HUY')} 
                      disabled={updating}
                      className="btn btn-outline"
                      style={{ borderColor: 'var(--admin-danger)', color: 'var(--admin-danger)' }}
                    >
                      <XCircle size={16} /> Hủy đơn
                    </button>
                  </>
                )}

                {selectedOrder.status === 'DA_XAC_NHAN' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DANG_GIAO')} 
                    disabled={updating}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                  >
                    <Truck size={16} /> Bắt đầu giao
                  </button>
                )}

                {selectedOrder.status === 'DANG_GIAO' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'HOAN_THANH')} 
                    disabled={updating}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}
                  >
                    <CheckCircle2 size={16} /> Hoàn thành đơn
                  </button>
                )}

                {(selectedOrder.status === 'HOAN_THANH' || selectedOrder.status === 'HUY') && (
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    background: selectedOrder.status === 'HOAN_THANH' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: selectedOrder.status === 'HOAN_THANH' ? 'var(--admin-success)' : 'var(--admin-danger)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    border: '1px solid ' + (selectedOrder.status === 'HOAN_THANH' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                  }}>
                    {selectedOrder.status === 'HOAN_THANH' ? 'Đơn hàng đã hoàn thành' : 'Đơn hàng đã bị hủy'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManager
