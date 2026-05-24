import { useState, useEffect } from 'react';
import { fetchDashboard } from '../services/api';
import KPICard from '../components/KPICard';
import SalesChart from '../components/SalesChart';
import Badge from '../components/Badge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-coffee-200 border-t-coffee-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-400">Failed to load dashboard data.</p>
        <button onClick={loadDashboard} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  const formatCurrency = (val) =>
    `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Welcome back! Here's your coffee shop overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <KPICard title="Total Sales"    value={formatCurrency(data.totalSales)}                                       icon="💰" color="coffee" delay={0}   />
        <KPICard title="Total Orders"   value={data.totalOrders}                                                       icon="📋" color="blue"   delay={80}  />
        <KPICard title="Today's Sales"  value={formatCurrency(data.todaySales?.amount || 0)} subtitle={`${data.todaySales?.count || 0} orders today`}      icon="📈" color="green"  delay={160} />
        <KPICard title="Top Product"    value={data.topProduct?.name || 'N/A'}              subtitle={`${data.topProduct?.totalQuantitySold || 0} sold`}   icon="⭐" color="amber"  delay={240} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <div className="xl:col-span-2">
          <SalesChart data={data.salesChart} />
        </div>

        {/* Payment Distribution */}
        <div className="glass-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <h3 className="text-sm sm:text-base font-bold text-dark-900 mb-1">Payment Methods</h3>
          <p className="text-xs sm:text-sm text-dark-400 mb-4 sm:mb-6">Distribution by type</p>
          <div className="space-y-4">
            {data.paymentDistribution?.map((item) => {
              const total = data.paymentDistribution.reduce((s, i) => s + i.count, 0);
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
              const colors = { CARD: 'bg-violet-500', UPI: 'bg-emerald-500', CASH: 'bg-amber-500' };
              return (
                <div key={item.method}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge value={item.method} />
                    <span className="text-sm font-semibold text-dark-700">{pct}%</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[item.method] || 'bg-gray-400'} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card animate-slide-up overflow-hidden" style={{ animationDelay: '400ms' }}>
        <div className="px-4 sm:px-6 py-4 border-b border-dark-100">
          <h3 className="text-sm sm:text-base font-bold text-dark-900">Recent Orders</h3>
          <p className="text-xs sm:text-sm text-dark-400 mt-0.5">Latest 5 transactions</p>
        </div>

        {/* ─── Mobile: card list ─── */}
        <div className="md:hidden divide-y divide-dark-50">
          {data.recentOrders?.map((order) => (
            <div key={order.id} className="px-4 py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-coffee-600">{order.txnId}</span>
                <Badge value={order.paymentMethod} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark-900">{order.customerName}</p>
                <p className="text-sm font-bold text-dark-900">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {order.products?.slice(0, 2).map((p, i) => (
                    <span key={i} className="text-xs bg-dark-50 px-2 py-0.5 rounded-md text-dark-600">
                      {p.name} ×{p.quantity}
                    </span>
                  ))}
                  {order.products?.length > 2 && (
                    <span className="text-xs bg-dark-50 px-2 py-0.5 rounded-md text-dark-400">
                      +{order.products.length - 2}
                    </span>
                  )}
                </div>
                <span className="text-xs text-dark-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Desktop: full table ─── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100">
                <th className="table-header">TXN ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Products</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Payment</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {data.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-coffee-50/30 transition-colors">
                  <td className="table-cell font-mono text-xs font-semibold text-coffee-600">{order.txnId}</td>
                  <td className="table-cell font-medium text-dark-800">{order.customerName}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {order.products?.map((p, i) => (
                        <span key={i} className="text-xs bg-dark-50 px-2 py-0.5 rounded-md">
                          {p.name} ×{p.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="table-cell"><Badge value={order.paymentMethod} /></td>
                  <td className="table-cell text-dark-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
