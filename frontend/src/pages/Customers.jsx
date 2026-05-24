import { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer } from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { HiPlus, HiMail, HiPhone, HiSearch } from 'react-icons/hi';

export default function Customers() {
  const toast = useToast();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? customers.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email?.toLowerCase().includes(q)
          )
        : customers
    );
  }, [search, customers]);

  const loadCustomers = async () => {
    try {
      const res = await fetchCustomers();
      setCustomers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createCustomer(form);
      setShowModal(false);
      setForm({ name: '', phone: '', email: '' });
      loadCustomers();
      toast({ type: 'success', title: 'Customer Added!', message: `${form.name} has been registered.` });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create customer';
      setError(msg);
      toast({ type: 'error', title: 'Error', message: msg });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-900">Customers</h1>
          <p className="text-dark-400 text-sm mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <HiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-coffee-200 border-t-coffee-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-dark-500 font-medium">No customers found</p>
          {search && <p className="text-dark-400 text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((cust, i) => (
            <div
              key={cust.id}
              className="glass-card-hover p-4 sm:p-5 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-900 truncate text-sm sm:text-base">{cust.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-dark-400">
                    <HiMail className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-dark-400">
                    <HiPhone className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{cust.phone}</span>
                  </div>
                </div>

                {/* Order count */}
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-dark-900">{cust.totalOrders}</p>
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider font-semibold">Orders</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field"
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field"
              placeholder="john@email.com"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Adding...' : '✓ Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
