import { useState, useEffect } from 'react';
import { fetchOrders, createOrder, fetchCustomers, fetchProducts } from '../services/api';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { HiSearch, HiPlus, HiChevronDown, HiChevronUp, HiFilter } from 'react-icons/hi';

export default function Orders() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({ customerId: '', items: [{ productId: '', quantity: 1 }], paymentMethod: 'CASH' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadOrders(); }, [pagination.page, sortBy, sortOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10, sortBy, sortOrder };
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await fetchOrders(params);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadOrders();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([fetchCustomers(), fetchProducts()]);
      setCustomers(custRes.data);
      setProducts(prodRes.data.filter(p => p.available));
      setOrderForm({ customerId: '', items: [{ productId: '', quantity: 1 }], paymentMethod: 'CASH' });
      setShowModal(true);
    } catch (err) { console.error(err); }
  };

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 1 }] }));
  const removeItem = (idx) => setOrderForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, val) => {
    setOrderForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: field === 'quantity' ? parseInt(val) || 1 : val };
      return { ...f, items };
    });
  };

  const calcTotal = () => {
    return orderForm.items.reduce((sum, item) => {
      const prod = products.find(p => p.id === parseInt(item.productId));
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.customerId || orderForm.items.some(i => !i.productId)) return;
    setSubmitting(true);
    try {
      await createOrder({
        customerId: parseInt(orderForm.customerId),
        items: orderForm.items.map(i => ({ productId: parseInt(i.productId), quantity: i.quantity })),
        paymentMethod: orderForm.paymentMethod,
      });
      setShowModal(false);
      loadOrders();
      toast({ type: 'success', title: 'Order Created!', message: 'New order has been placed successfully.' });
    } catch (err) {
      console.error(err);
      toast({ type: 'error', title: 'Failed', message: 'Could not create order. Please try again.' });
    }
    finally { setSubmitting(false); }
  };

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc'
      ? <HiChevronUp className="w-3.5 h-3.5 text-coffee-500" />
      : <HiChevronDown className="w-3.5 h-3.5 text-coffee-500" />;
  };

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-900">Orders</h1>
          <p className="text-dark-400 text-sm mt-0.5">{pagination.total} total orders</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 shrink-0">
          <HiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        {/* Mobile: search + filter toggle */}
        <form onSubmit={handleSearch}>
          <div className="flex gap-2 mb-3 sm:mb-0">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by TXN ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {/* Toggle advanced filters — mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(f => !f)}
              className={`sm:hidden p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-coffee-50 border-coffee-300 text-coffee-600' : 'border-dark-200 text-dark-500 bg-white'}`}
            >
              <HiFilter className="w-4 h-4" />
            </button>
            <button type="submit" className="btn-primary shrink-0">Search</button>
          </div>

          {/* Date filters — always visible on sm+, toggle on mobile */}
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2 mt-3 sm:mt-3`}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field sm:w-40" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field sm:w-40" />
            <button type="submit" className="btn-primary sm:hidden">Apply Filter</button>
          </div>
        </form>
      </div>

      {/* Orders list */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-coffee-200 border-t-coffee-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-dark-500 font-medium">No orders found</p>
            <p className="text-dark-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* ─── Mobile: card list ─── */}
            <div className="md:hidden divide-y divide-dark-50">
              {orders.map((order, i) => (
                <div
                  key={order.id}
                  className="px-4 py-4 space-y-2.5 hover:bg-coffee-50/20 transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Row 1: TXN + Amount */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-coffee-600 bg-coffee-50 px-2 py-1 rounded-lg">
                      {order.txnId}
                    </span>
                    <span className="text-base font-bold text-dark-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  {/* Row 2: Customer + Date */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-dark-800">{order.customerName}</p>
                    <p className="text-xs text-dark-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {/* Row 3: Products + Payment */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                      {order.products.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-xs bg-dark-50 px-2 py-0.5 rounded-md text-dark-600 truncate">
                          {p.name} ×{p.quantity}
                        </span>
                      ))}
                      {order.products.length > 2 && (
                        <span className="text-xs bg-dark-100 px-2 py-0.5 rounded-md text-dark-400">
                          +{order.products.length - 2} more
                        </span>
                      )}
                    </div>
                    <Badge value={order.paymentMethod} />
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
                    <th className="table-header">Category</th>
                    <th
                      className="table-header cursor-pointer select-none hover:text-dark-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">Date <SortIcon field="createdAt" /></div>
                    </th>
                    <th
                      className="table-header cursor-pointer select-none hover:text-dark-700"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="flex items-center gap-1">Amount <SortIcon field="totalAmount" /></div>
                    </th>
                    <th className="table-header">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-coffee-50/30 transition-colors">
                      <td className="table-cell font-mono text-xs font-semibold text-coffee-600">{order.txnId}</td>
                      <td className="table-cell font-medium text-dark-800">{order.customerName}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {order.products.map((p, i) => (
                            <span key={i} className="text-xs bg-dark-50 px-2 py-0.5 rounded-md">{p.name} ×{p.quantity}</span>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(order.products.map(p => p.category))].map(c => <Badge key={c} value={c} />)}
                        </div>
                      </td>
                      <td className="table-cell text-dark-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <br />
                        <span className="text-dark-300">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="table-cell font-semibold">{formatCurrency(order.totalAmount)}</td>
                      <td className="table-cell"><Badge value={order.paymentMethod} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={p => setPagination(prev => ({ ...prev, page: p }))}
            />
          </>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Order" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Customer</label>
            <select
              value={orderForm.customerId}
              onChange={e => setOrderForm(f => ({ ...f, customerId: e.target.value }))}
              className="select-field"
              required
            >
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Order Items</label>
            <div className="space-y-3">
              {orderForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={e => updateItem(idx, 'productId', e.target.value)}
                      className="select-field"
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category}) — ₹{p.price}</option>)}
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      className="input-field text-center"
                    />
                  </div>
                  {orderForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-coffee-600 font-semibold hover:text-coffee-700 transition-colors"
            >
              + Add another item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'CASH', label: '💵 Cash' },
                { value: 'CARD', label: '💳 Card' },
                { value: 'UPI', label: '📱 UPI' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrderForm(f => ({ ...f, paymentMethod: value }))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    orderForm.paymentMethod === value
                      ? 'border-coffee-500 bg-coffee-50 text-coffee-700'
                      : 'border-dark-200 text-dark-600 hover:border-dark-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-coffee-50 to-amber-50 rounded-xl px-4 py-3 flex items-center justify-between border border-coffee-100">
            <span className="text-sm font-medium text-dark-600">Order Total</span>
            <span className="text-xl font-bold gradient-text">{formatCurrency(calcTotal())}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating...' : '✓ Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
