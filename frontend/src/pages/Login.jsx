import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(usernameOrEmail, password, rememberMe)
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <h2 className="auth-title">Chào mừng trở lại</h2>
        <p className="auth-subtitle">Đăng nhập vào tài khoản MiniMart của bạn</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username hoặc Email</label>
            <input
              type="text"
              required
              placeholder="Nhập username hoặc email..."
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Quên mật khẩu?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary auth-btn">
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
