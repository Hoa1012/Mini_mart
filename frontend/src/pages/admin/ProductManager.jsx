import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import './AdminPages.css'

const ProductManager = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [salePrice, setSalePrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [images, setImages] = useState([]) // Mảng các ảnh phụ
  const [currentStock, setCurrentStock] = useState(0)
  const [minimumStock, setMinimumStock] = useState(5)
  const [location, setLocation] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [error, setError] = useState('')
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingSub, setUploadingSub] = useState(false)

  const fetchData = async () => {
    try {
      const prodRes = await api.get('/api/admin/products')
      const catRes = await api.get('/api/admin/categories')
      const brandRes = await api.get('/api/admin/brands')
      setProducts(prodRes.data)
      setCategories(catRes.data)
      setBrands(brandRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingMain(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await api.post('/api/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMainImage(response.data.url)
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể upload ảnh chính')
    } finally {
      setUploadingMain(false)
    }
  }

  const handleSubImagesUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingSub(true)
    setError('')
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    try {
      const response = await api.post('/api/admin/products/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImages(prev => [...prev, ...response.data.urls])
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể upload ảnh phụ')
    } finally {
      setUploadingSub(false)
    }
  }

  const validateForm = () => {
    if (!name.trim()) return 'Tên sản phẩm không được để trống'
    if (price < 0) return 'Giá sản phẩm không được âm'
    if (salePrice !== '' && Number(salePrice) < 0) return 'Giá khuyến mãi không được âm'
    if (currentStock < 0) return 'Số lượng tồn kho không được âm'
    if (!categoryId) return 'Vui lòng chọn danh mục'
    if (!brandId) return 'Vui lòng chọn thương hiệu'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const clientErr = validateForm()
    if (clientErr) {
      setError(clientErr)
      return
    }

    const payload = {
      name,
      description,
      price: Number(price),
      salePrice: salePrice !== '' ? Number(salePrice) : null,
      categoryId: Number(categoryId),
      brandId: Number(brandId),
      mainImage,
      images,
      currentStock: Number(currentStock),
      minimumStock: Number(minimumStock),
      location,
      isActive
    }

    try {
      if (editId) {
        await api.put(`/api/admin/products/${editId}`, payload)
      } else {
        await api.post('/api/admin/products', payload)
      }
      fetchData()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi lưu sản phẩm')
    }
  }

  const handleEdit = (prod) => {
    setEditId(prod.id)
    setName(prod.name)
    setDescription(prod.description || '')
    setPrice(prod.price)
    setSalePrice(prod.salePrice !== null ? prod.salePrice : '')
    setCategoryId(prod.categoryId ? prod.categoryId.toString() : '')
    setBrandId(prod.brandId ? prod.brandId.toString() : '')
    setMainImage(prod.mainImage || '')
    setImages(prod.images || [])
    setCurrentStock(prod.currentStock || 0)
    setMinimumStock(prod.minimumStock || 5)
    setLocation(prod.location || '')
    setIsActive(prod.isActive)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await api.delete(`/api/admin/products/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể xóa sản phẩm')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    setName('')
    setDescription('')
    setPrice(0)
    setSalePrice('')
    setCategoryId('')
    setBrandId('')
    setMainImage('')
    setImages([])
    setCurrentStock(0)
    setMinimumStock(5)
    setLocation('')
    setIsActive(true)
    setError('')
  }

  if (loading) {
    return <div className="loading-state">Đang tải sản phẩm...</div>
  }

  return (
    <div className="admin-crud-page">
      <div className="crud-header">
        <h2>Quản lý Sản phẩm</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="admin-form-overlay">
          <form onSubmit={handleSubmit} className="admin-popup-form form-large glass">
            <h3>{editId ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            {error && <div className="form-error">{error}</div>}

            <div className="form-grid-2">
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Giá bán (đ)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Giá khuyến mãi (đ) (Để trống nếu không giảm)</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Thương hiệu</label>
                <select required value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Vị trí kệ kho</label>
                <input type="text" placeholder="Ví dụ: Kệ A1..." value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Số lượng tồn kho khởi tạo</label>
                <input type="number" required value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Ngưỡng tồn kho tối thiểu</label>
                <input type="number" required value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} />
              </div>
            </div>

            <div className="form-group margin-top-sm">
              <label>Mô tả chi tiết sản phẩm</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>

            <div className="form-grid-2 margin-top-sm">
              <div className="form-group">
                <label>Ảnh chính sản phẩm</label>
                <input type="file" onChange={handleMainImageUpload} />
                {uploadingMain && <span>Đang tải...</span>}
                {mainImage && <img src={mainImage} alt="Preview" className="form-preview-img-product" />}
              </div>

              <div className="form-group">
                <label>Ảnh phụ sản phẩm (Chọn nhiều ảnh)</label>
                <input type="file" multiple onChange={handleSubImagesUpload} />
                {uploadingSub && <span>Đang tải...</span>}
                <div className="sub-images-preview">
                  {images.map((img, idx) => (
                    <div key={idx} className="sub-img-wrap">
                      <img src={img} alt="" />
                      <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="remove-sub-img">x</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-checkbox margin-top-sm">
              <label>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span> Cho phép hiển thị bán hàng (Kích hoạt)</span>
              </label>
            </div>

            <div className="form-actions margin-top-md">
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
              <th>Ảnh chính</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Giá gốc</th>
              <th>Giá KM</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {[...products].sort((a, b) => a.id - b.id).map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>
                  <img src={prod.mainImage} alt={prod.name} className="table-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' }} />
                </td>
                <td><strong>{prod.name}</strong></td>
                <td>{prod.categoryName}</td>
                <td>{prod.brandName}</td>
                <td>{prod.price.toLocaleString()}đ</td>
                <td>{prod.salePrice ? `${prod.salePrice.toLocaleString()}đ` : '—'}</td>
                <td>
                  <span className={prod.currentStock < prod.minimumStock ? 'text-danger font-bold' : ''}>
                    {prod.currentStock}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${prod.isActive ? 'active' : 'inactive'}`}>
                    {prod.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {prod.isActive ? 'Bán trực tuyến' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(prod)} className="action-btn edit" title="Sửa"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(prod.id)} className="action-btn delete" title="Xóa"><Trash2 size={16} /></button>
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

export default ProductManager
