import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PackagePlus, PackageCheck, AlertTriangle } from 'lucide-react'
import './AdminPages.css'

const InventoryManager = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  const [editItem, setEditItem] = useState(null)
  const [addQuantity, setAddQuantity] = useState(1)
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchInventory = async () => {
    try {
      const response = await api.get('/api/admin/inventory')
      setInventory(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleEdit = (item) => {
    setEditItem(item)
    setAddQuantity(1)
    setLocation(item.location || '')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!addQuantity || addQuantity <= 0) {
      setError('Số lượng nhập thêm phải lớn hơn 0')
      return
    }

    try {
      await api.post(`/api/admin/inventory/${editItem.id}/add-stock`, {
        quantity: Number(addQuantity),
        location
      })
      setSuccess(`✅ Đã nhập thêm ${addQuantity} sản phẩm. Tồn kho mới: ${editItem.currentStock + Number(addQuantity)}`)
      fetchInventory()
      setTimeout(() => setEditItem(null), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật tồn kho')
    }
  }

  if (loading) {
    return <div className="loading-state">Đang tải thông tin kho...</div>
  }

  return (
    <div className="admin-crud-page">
      <div className="crud-header">
        <h2>Quản lý Tồn kho</h2>
      </div>

      {editItem && (
        <div className="admin-form-overlay">
          <form onSubmit={handleSubmit} className="admin-popup-form glass">
            <h3>📦 Nhập thêm hàng vào kho</h3>
            <p className="margin-bottom-sm">
              Sản phẩm: <strong>{editItem.product?.name || `ID: ${editItem.productId}`}</strong>
            </p>

            {/* Tồn kho hiện tại — chỉ đọc */}
            <div className="form-group">
              <label>Tồn kho hiện tại</label>
              <input
                type="number"
                value={editItem.currentStock}
                disabled
                style={{ background: '#f0f0f0', cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            {/* Số lượng muốn nhập thêm */}
            <div className="form-group">
              <label>Số lượng nhập thêm</label>
              <input
                type="number"
                min="1"
                required
                value={addQuantity}
                onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                placeholder="Nhập số lượng muốn nhập thêm..."
                autoFocus
              />
              {addQuantity > 0 && (
                <small style={{ color: '#16a34a', marginTop: '4px', display: 'block' }}>
                  → Sau khi nhập: <strong>{editItem.currentStock + Number(addQuantity)}</strong> sản phẩm
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Vị trí kệ kho</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Kệ A1..."
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div style={{ color: '#16a34a', marginBottom: '8px' }}>{success}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <PackagePlus size={16} /> Nhập hàng
              </button>
              <button type="button" onClick={() => setEditItem(null)} className="btn btn-outline">
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng tồn kho */}
      <div className="admin-table-container glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Vị trí kệ</th>
              <th>Tồn kho hiện tại</th>
              <th>Ngưỡng tối thiểu</th>
              <th>Cảnh báo</th>
              <th>Lần cập nhật cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLowStock = item.currentStock < item.minimumStock
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><strong>{item.product?.name || `Product ID: ${item.productId}`}</strong></td>
                  <td>{item.location || '—'}</td>
                  <td>
                    <span className={isLowStock ? 'text-danger font-bold' : ''}>{item.currentStock}</span>
                  </td>
                  <td>{item.minimumStock}</td>
                  <td>
                    {isLowStock ? (
                      <span className="status-pill danger">
                        <AlertTriangle size={12} /> Cần nhập hàng
                      </span>
                    ) : (
                      <span className="status-pill active">
                        <PackageCheck size={12} /> An toàn
                      </span>
                    )}
                  </td>
                  <td>{new Date(item.lastUpdated).toLocaleString('vi-VN')}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="action-btn edit"
                        title="Nhập thêm hàng vào kho"
                      >
                        <PackagePlus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryManager
