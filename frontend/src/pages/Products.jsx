import { useState, useEffect } from 'react';
import { fetchProducts, createProduct } from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';
import { HiPlus, HiSearch } from 'react-icons/hi';

const categoryEmoji = { HOT: '☕', COLD: '🧊' };

export default function Products() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'HOT', price: '', available: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    let result = products;
    if (categoryFilter !== 'ALL') result = result.filter(p => p.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [search, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createProduct({ ...form, price: parseFloat(form.price) });
      setShowModal(false);
      setForm({ name: '', category: 'HOT', price: '', available: true });
      loadProducts();
      toast({ type: 'success', title: 'Product Added!', message: `${form.name} is now on the menu.` });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add product';
      setError(msg);
      toast({ type: 'error', title: 'Error', message: msg });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-900">Products</h1>
          <p className="text-dark-400 text-sm mt-0.5">{products.length} items on the menu</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <HiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 bg-white shadow-sm"
          />
        </div>
        {/* Category pill filter */}
        <div className="flex gap-2">
          {['ALL', 'HOT', 'COLD'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                categoryFilter === cat
                  ? 'border-coffee-500 bg-coffee-50 text-coffee-700'
                  : 'border-dark-200 bg-white text-dark-600 hover:border-dark-300'
              }`}
            >
              {cat === 'HOT' ? '☕ Hot' : cat === 'COLD' ? '🧊 Cold' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-coffee-200 border-t-coffee-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-dark-500 font-medium">No products found</p>
          {(search || categoryFilter !== 'ALL') && (
            <p className="text-dark-400 text-sm mt-1">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((prod, i) => (
            <div
              key={prod.id}
              className="glass-card-hover p-4 sm:p-5 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
                  {categoryEmoji[prod.category] || '☕'}
                </div>
                <Badge value={prod.category} />
              </div>
              <h3 className="font-semibold text-dark-900 text-sm sm:text-base leading-snug">{prod.name}</h3>
              <div className="flex items-end justify-between mt-3 gap-2">
                <div>
                  <p className="text-lg sm:text-xl font-bold gradient-text">₹{prod.price}</p>
                  <p className="text-[11px] text-dark-400 mt-0.5">{prod.totalOrders}× ordered</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 ${
                  prod.available ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${prod.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {prod.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Caramel Latte"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Category</label>
              <div className="flex gap-2">
                {['HOT', 'COLD'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.category === cat
                        ? 'border-coffee-500 bg-coffee-50 text-coffee-700'
                        : 'border-dark-200 text-dark-600'
                    }`}
                  >
                    {cat === 'HOT' ? '☕ Hot' : '🧊 Cold'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="input-field"
                placeholder="199"
                required
              />
            </div>
          </div>
          {/* Availability toggle */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, available: !f.available }))}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
              form.available
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-dark-200 bg-dark-50'
            }`}
          >
            <span className={`text-sm font-semibold ${form.available ? 'text-emerald-700' : 'text-dark-500'}`}>
              {form.available ? '✅ Available for ordering' : '❌ Not available'}
            </span>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${form.available ? 'bg-emerald-500' : 'bg-dark-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </button>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Adding...' : '✓ Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
