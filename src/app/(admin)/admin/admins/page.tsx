'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

type Status = { type: 'success' | 'error'; msg: string } | null;

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium mb-4 ${isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
      <span>{isError ? '❌' : '✅'}</span>
      {status.msg}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('member');
  const [status, setStatus] = useState<Status>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data: AdminUser[] = await res.json();
        setAdmins(data);
        const meRes = await fetch('/api/account');
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUserRole(me.role ?? 'member');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAddLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setStatus({ type: 'success', msg: json.message });
      setName(''); setEmail(''); setPassword('');
      await loadAdmins();
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this team member?')) return;
    setDeleteId(id);
    setStatus(null);
    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setStatus({ type: 'success', msg: json.message });
      await loadAdmins();
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setDeleteId(null);
    }
  }

  const isOwner = currentUserRole === 'owner';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Team Members</h1>
        <p className="text-sm text-slate-400 mt-1">Manage who has access to the admin panel.</p>
      </div>

      <StatusBanner status={status} />

      <Card title="Current Team" subtitle="All users with admin access">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-slate-400">No team members found.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">2FA</th>
                  {isOwner && <th className="px-6 py-3 font-semibold uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{admin.name || '—'}</td>
                    <td className="px-6 py-3 text-slate-500">{admin.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${admin.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold ${admin.twoFactorEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {admin.twoFactorEnabled ? 'Enabled' : 'Off'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="px-6 py-3">
                        {admin.role !== 'owner' && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            disabled={deleteId === admin.id}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                          >
                            {deleteId === admin.id ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isOwner && (
        <Card title="Add Team Member" subtitle="Create a new admin account">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls} type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input className={inputCls} type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Password *</label>
              <input className={inputCls} type="password" placeholder="Temporary password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              {addLoading ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </Card>
      )}

      {!isOwner && (
        <p className="text-xs text-slate-400 text-center">Only the owner can add or remove team members.</p>
      )}
    </div>
  );
}
