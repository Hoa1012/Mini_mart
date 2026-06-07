import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

  // Tạo danh sách 6 tháng gần nhất và điền dữ liệu thực
  const buildChartData = () => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push(key)
    }

    const realMap = {}
    if (stats?.monthlyRevenue) {
      Object.keys(stats.monthlyRevenue).forEach(key => {
        realMap[key] = stats.monthlyRevenue[key]
      })
    }

    return months.map(month => ({
      name: month,
      'Doanh thu': realMap[month] || 0,
      isReal: true
    }))
  }

  const chartData = buildChartData()

  // Custom tooltip hiển thị đẹp
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isReal = payload[0]?.payload?.isReal
      return (
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          fontSize: '13px'
        }}>
          <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#4CAF50', margin: 0 }}>
            💰 {payload[0].value.toLocaleString()}đ
          </p>
        </div>
      )
    }
    return null
  }

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Doanh thu theo tháng (đơn hoàn thành)</h3>
          </div>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.03)'}} />
                  <Bar
                    dataKey="Doanh thu"
                    fill="#4CAF50"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </BarChart>
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
