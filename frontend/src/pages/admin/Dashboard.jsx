import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './AdminPages.css'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/api/admin/dashboard/stats')
        const lowStockRes = await api.get('/api/admin/inventory/low-stock')
        setStats(statsRes.data)
        setLowStock(lowStockRes.data)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="loading-state">Đang tải số liệu thống kê quản trị...</div>
  }

  // Chuẩn bị dữ liệu cho Recharts
  const chartData = stats && stats.monthlyRevenue
    ? Object.keys(stats.monthlyRevenue).map(key => ({
        name: key,
        'Doanh thu': stats.monthlyRevenue[key]
      }))
    : []

  return (
    <div className="admin-dashboard-page">
      {/* Thẻ Stats tổng quan */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-box orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span>Tổng doanh thu</span>
            <h3>{stats?.totalRevenue?.toLocaleString()}đ</h3>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-box blue">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <span>Tổng đơn hàng</span>
            <h3>{stats?.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-box green">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span>Tổng khách hàng</span>
            <h3>{stats?.totalCustomers}</h3>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-box purple">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span>Tổng sản phẩm</span>
            <h3>{stats?.totalProducts}</h3>
          </div>
        </div>
      </div>

      {/* Grid 2 cột: Biểu đồ & Cảnh báo tồn kho */}
      <div className="dashboard-grid">
        {/* Cột 1: Biểu đồ doanh thu */}
        <div className="chart-card glass">
          <h3>Doanh thu theo tháng (đơn hoàn thành)</h3>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']} />
                  <Area type="monotone" dataKey="Doanh thu" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">Chưa có dữ liệu doanh thu hàng tháng.</div>
            )}
          </div>
        </div>

        {/* Cột 2: Cảnh báo tồn kho thấp < 5 */}
        <div className="warning-card glass">
          <div className="warning-card-header">
            <h3><AlertTriangle size={20} className="warning-icon" /> Cảnh báo tồn kho thấp (&lt; 5)</h3>
            <Link to="/admin/inventory" className="btn-text-nav">Quản lý kho <ArrowRight size={16} /></Link>
          </div>
          
          <div className="warning-list">
            {lowStock.length > 0 ? (
              lowStock.map(item => (
                <div key={item.id} className="warning-item">
                  <div className="warning-item-info">
                    <strong>{item.product?.name || `Product ID: ${item.product_id}`}</strong>
                    <span>Vị trí: {item.location || 'Chưa định nghĩa'}</span>
                  </div>
                  <span className="warning-badge-danger">
                    Chỉ còn {item.currentStock}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-warnings">
                <p>Tất cả sản phẩm đều đủ số lượng tồn kho an toàn (&gt;= 5).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
