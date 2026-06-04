import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import './AdminPages.css'

const CategoryManager = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories')
      setCategories(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await api.post('/api/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImage(response.data.url)
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể upload hình ảnh')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Tên danh mục không được để trống')
      return
    }

    const payload = { name, description, image, isActive }

    try {
      if (editId) {
        await api.put(`/api/admin/categories/${editId}`, payload)
      } else {
        await api.post('/api/admin/categories', payload)
      }
      fetchCategories()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi lưu danh mục')
    }
  }

  const handleEdit = (cat) => {
    setEditId(cat.id)
    setName(cat.name)
    setDescription(cat.description || '')
    setImage(cat.image || '')
    setIsActive(cat.isActive)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
    try {
      await api.delete(`/api/admin/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể xóa danh mục này')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    setName('')
    setDescription('')
    setImage('')
    setIsActive(true)
    setError('')
  }

  if (loading) {
    return <div className="loading-state">Đang tải danh mục...</div>
  }

  return (
    <div className="admin-crud-page">
      <div className="crud-header">
        <h2>Quản lý Danh mục</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="admin-form-overlay">
          <form onSubmit={handleSubmit} className="admin-popup-form glass">
            <h3>{editId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label>Tên danh mục</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>

            <div className="form-group">
              <label>Hình ảnh danh mục</label>
              <input type="file" onChange={handleImageUpload} />
              {uploading && <span>Đang upload...</span>}
              {image && <img src={image} alt="Xem trước" className="form-preview-img" />}
            </div>

            <div className="form-checkbox">
              <label>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span> Kích hoạt hoạt động</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Lưu lại</button>
              <button type="button" onClick={handleCloseForm} className="btn btn-outline">Hủy bỏ</button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="admin-table-container glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>
                  <img src={cat.image} alt={cat.name} className="table-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' }} />
                </td>
                <td><strong>{cat.name}</strong></td>
                <td>{cat.description || '—'}</td>
                <td>
                  <span className={`status-pill ${cat.isActive ? 'active' : 'inactive'}`}>
                    {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    {cat.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(cat)} className="action-btn edit" title="Sửa"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="action-btn delete" title="Xóa"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CategoryManager
