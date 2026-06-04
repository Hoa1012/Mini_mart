import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { Edit2, PackageCheck, AlertTriangle } from 'lucide-react'
import './AdminPages.css'

const InventoryManager = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit State
  const [editItem, setEditItem] = useState(null)
  const [currentStock, setCurrentStock] = useState(0)
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

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
    setCurrentStock(item.currentStock)
    setLocation(item.location || '')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (currentStock < 0) {
      setError('Số lượng tồn kho không được âm')
      return
    }

    try {
      await api.put(`/api/admin/inventory/${editItem.id}`, { currentStock, location })
      fetchInventory()
      setEditItem(null)
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
            <h3>Cập nhật tồn kho sản phẩm</h3>
            <p className="margin-bottom-sm">Sản phẩm: <strong>{editItem.product?.name || `Product ID: ${editItem.productId}`}</strong></p>
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label>Số lượng tồn kho thực tế</label>
              <input type="number" required value={currentStock} onChange={(e) => setCurrentStock(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <label>Vị trí kệ kho</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Lưu lại</button>
              <button type="button" onClick={() => setEditItem(null)} className="btn btn-outline">Hủy bỏ</button>
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
                      <button onClick={() => handleEdit(item)} className="action-btn edit" title="Cập nhật nhanh kho"><Edit2 size={16} /></button>
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
