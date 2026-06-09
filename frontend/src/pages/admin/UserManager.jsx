import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { User, Shield, ShieldAlert, Lock, Unlock, Mail, Phone, Calendar, Search } from 'lucide-react'
import './AdminPages.css'

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users')
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err)
      setError('Không thể lấy danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(
        users.filter(u => 
          u.username?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.fullName?.toLowerCase().includes(term) ||
          u.phone?.includes(term)
        )
      )
    }
  }, [searchTerm, users])

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'KHOÁ' : 'MỞ KHOÁ'
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản của "${user.fullName || user.username}"?`)) return
    
    setUpdatingId(user.id)
    setError('')
    try {
      await api.put(`/api/admin/users/${user.id}/toggle-status`)
      // Cập nhật state cục bộ
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      alert(`Đã ${action.toLowerCase()} tài khoản thành công!`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Lỗi khi thay đổi trạng thái tài khoản')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return <div className="loading-state">Đang tải danh sách người dùng...</div>
  }

  return (
    <div className="admin-crud-page">
      <div className="crud-header">
        <h2>Quản lý Người dùng</h2>
        
        {/* Tìm kiếm người dùng */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--admin-card-bg)',
              color: 'var(--admin-text-primary)',
              border: '1px solid var(--admin-border)',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          />
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-secondary)'
            }} 
          />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Bảng danh sách người dùng */}
      <div className="admin-table-container glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--admin-primary)'
                      }}>
                        <User size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{user.fullName || '—'}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} className="text-muted" /> {user.email}
                      </span>
                      {user.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} className="text-muted" /> {user.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: user.role === 'ROLE_ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: user.role === 'ROLE_ADMIN' ? 'var(--admin-danger)' : 'var(--admin-primary)'
                    }}>
                      {user.role === 'ROLE_ADMIN' ? <Shield size={12} /> : <User size={12} />}
                      {user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-text-secondary)' }}>
                      <Calendar size={14} /> {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Hoạt động' : 'Đang khóa'}
                    </span>
                  </td>
                  <td>
                    {user.role === 'ROLE_ADMIN' ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>Không cho phép khóa</span>
                    ) : (
                      <button 
                        onClick={() => handleToggleStatus(user)} 
                        disabled={updatingId === user.id}
                        className={`btn ${user.isActive ? 'btn-outline' : 'btn-primary'}`}
                        style={{ 
                          padding: '0.4rem 0.75rem', 
                          fontSize: '0.8rem',
                          background: user.isActive ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)',
                          borderColor: user.isActive ? 'var(--admin-danger)' : 'none',
                          color: user.isActive ? 'var(--admin-danger)' : '#fff'
                        }}
                      >
                        {user.isActive ? (
                          <>
                            <Lock size={12} style={{ marginRight: '4px' }} /> Khóa tài khoản
                          </>
                        ) : (
                          <>
                            <Unlock size={12} style={{ marginRight: '4px' }} /> Mở khóa
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-secondary)' }}>
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManager
