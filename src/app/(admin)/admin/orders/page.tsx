'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  sessionId: string;
  stripeSessionId: string | null;
  customerEmail: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  itemsJson: string | null;
  isRestaurant: boolean;
  restaurantName: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const VALID_STATUSES: FilterTab[] = ['pending', 'paid', 'processing', 'completed', 'cancelled'];

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [toast, setToast] = useState('');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (filter: FilterTab) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter, limit: '200' });
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data: { orders: Order[]; total: number } = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch {
      // network error — leave existing data in place
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders(activeFilter);
  }, [activeFilter, fetchOrders]);

  // ── Status update ──────────────────────────────────────────────────────────

  async function handleStatusUpdate() {
    if (!selectedOrder || !pendingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, status: pendingStatus }),
      });
      if (res.ok) {
        const updated: Order = await res.json();
        // Update list in place
        setOrders(prev =>
          prev.map(o => (o.id === updated.id ? { ...o, status: updated.status } : o)),
        );
        setSelectedOrder(prev => (prev ? { ...prev, status: updated.status } : null));
        showToast('Status updated.');
      } else {
        const err = await res.json();
        showToast('Error: ' + (err.error ?? 'Unknown error'));
      }
    } catch {
      showToast('Network error.');
    }
    setUpdatingStatus(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function openDetail(order: Order) {
    setSelectedOrder(order);
    setPendingStatus(order.status);
  }

  function closeDetail() {
    setSelectedOrder(null);
    setPendingStatus('');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-pulse">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage customer orders
            {!loading && (
              <span className="ml-2 text-slate-400 font-normal">— {total} total</span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(activeFilter)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-6 pt-4 pb-0 flex items-center gap-1 border-b border-gray-100">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeFilter === tab.key
                ? 'text-emerald-700 border-emerald-500 bg-emerald-50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg font-bold text-slate-500">No orders found</p>
              <p className="text-sm mt-1 text-slate-400">
                {activeFilter === 'all'
                  ? 'No orders have been placed yet.'
                  : `No ${activeFilter} orders at the moment.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="border-t border-gray-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono font-bold text-slate-700">
                          #{shortId(order.id)}
                        </span>
                        {order.isRestaurant && order.restaurantName && (
                          <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">
                            {order.restaurantName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.customerEmail ?? (
                          <span className="text-slate-400 italic">Guest</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.orderItems.length}{' '}
                        <span className="text-slate-400">
                          {order.orderItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {order.totalAmount.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-slate-500">{order.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => openDetail(order)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-white">
                  Order #{shortId(selectedOrder.id)}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={closeDetail}
                className="text-white/60 hover:text-white text-2xl leading-none transition"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Customer info */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Customer
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-800">
                      {selectedOrder.customerEmail ?? (
                        <span className="italic text-slate-400">Guest</span>
                      )}
                    </span>
                  </div>
                  {selectedOrder.isRestaurant && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Restaurant</span>
                      <span className="font-medium text-slate-800">
                        {selectedOrder.restaurantName ?? '—'}
                      </span>
                    </div>
                  )}
                  {selectedOrder.stripeSessionId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stripe session</span>
                      <span className="font-mono text-xs text-slate-500 truncate max-w-[180px]">
                        {selectedOrder.stripeSessionId}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Order items */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Items ({selectedOrder.orderItems.length})
                </h3>
                {selectedOrder.orderItems.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No items recorded.</p>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="text-center px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderItems.map(item => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-slate-700">{item.name}</td>
                            <td className="px-3 py-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">
                              {item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                              {(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Total breakdown */}
              <section>
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Total</span>
                  <span className="text-xl font-black text-slate-900">
                    {selectedOrder.totalAmount.toFixed(2)}{' '}
                    <span className="text-sm font-semibold text-slate-500">
                      {selectedOrder.currency}
                    </span>
                  </span>
                </div>
              </section>

              {/* Status update */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Update Status
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={pendingStatus}
                    onChange={e => setPendingStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {VALID_STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus || pendingStatus === selectedOrder.status}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Saving…' : 'Save'}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Current status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[selectedOrder.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </section>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={closeDetail}
                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
