'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [admins, setAdmins] = useState<{ id: string; email: string; name: string; role: string; twoFactorEnabled: boolean }[]>([]);
  const [currentEmail, setCurrentEmail] = useState('admin@brix.com');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [emailNew, setEmailNew] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [pdfFiles, setPdfFiles] = useState<{ name: string; date: string }[]>([]);

  const allPerms = [
    { key: 'media', label: 'Media', icon: 'fa-image' },
    { key: 'configuration', label: 'Navbar & Footer', icon: 'fa-paint-brush' },
    { key: 'chatbot', label: 'Chatbot', icon: 'fa-robot' },
    { key: 'backup', label: 'Backup', icon: 'fa-database' },
  ];

  useEffect(() => {
    fetchAdmins();
    fetchOllamaConfig();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (e) { console.error(e); }
  }

  async function fetchOllamaConfig() {
    try {
      const res = await fetch('/api/chat/config');
      if (res.ok) {
        const data = await res.json();
        if (data.ollama_url) setOllamaUrl(data.ollama_url);
        if (data.ollama_model) setOllamaModel(data.ollama_model);
      }
    } catch (e) { console.error(e); }
  }

  async function addMember() {
    if (!newEmail || !newPassword) {
      setMsg({ type: 'error', text: 'Email and password are required' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName, password: newPassword, permissions: selectedPerms }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: data.message || 'Team member added' });
        setNewName(''); setNewEmail(''); setNewPassword(''); setSelectedPerms([]);
        fetchAdmins();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to add member' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Error adding member' });
    }
    setLoading(false);
  }

  async function deleteMember(id: string) {
    if (!confirm('Remove this team member?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Team member removed' });
        fetchAdmins();
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error });
      }
    } catch {
      setMsg({ type: 'error', text: 'Error removing member' });
    }
    setLoading(false);
  }

  async function updatePassword() {
    if (!currentPassword || !passwordNew || !passwordConfirm) {
      setMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword: passwordNew, confirmPassword: passwordConfirm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Password changed successfully' });
        setCurrentPassword(''); setPasswordNew(''); setPasswordConfirm('');
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch { setMsg({ type: 'error', text: 'Error changing password' }); }
    setLoading(false);
  }

  async function saveOllama() {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ollamaUrl, model: ollamaModel }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Ollama configuration saved!' });
      } else {
        setMsg({ type: 'error', text: 'Failed to save' });
      }
    } catch { setMsg({ type: 'error', text: 'Error saving config' }); }
    setLoading(false);
  }

  function togglePerm(key: string) {
    setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Team & Security</h1>
        <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">← Back to Admin</button>
      </div>

      <div className="p-8 max-w-5xl space-y-8">
        {msg && (
          <div className={`p-4 rounded-xl flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {msg.type === 'success' ? '✓' : '✕'} {msg.text}
          </div>
        )}

        {isOwner && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Team members ({admins.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Role & Permissions</th>
                    <th className="px-6 py-3 text-left font-semibold">2FA</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-t border-gray-100">
                      <td className="px-6 py-3">{admin.name || '—'}</td>
                      <td className="px-6 py-3">{admin.email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${admin.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">{admin.twoFactorEnabled ? <span className="text-emerald-600">On</span> : <span className="text-gray-400">Off</span>}</td>
                      <td className="px-6 py-3 text-right">
                        {admin.role !== 'owner' && (
                          <button onClick={() => deleteMember(admin.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Add team member</h2>
                <p className="text-xs text-gray-400 mt-0.5">Members always have access to <strong>Pages</strong>. Select additional sections below.</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Smith" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email <span className="text-red-400">*</span></label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jane@company.com" required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="text-red-400">*</span></label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Additional access</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allPerms.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition">
                        <input type="checkbox" checked={selectedPerms.includes(perm.key)} onChange={() => togglePerm(perm.key)} className="w-4 h-4 rounded text-blue-500" />
                        <i className={`fas ${perm.icon} text-xs text-gray-400 w-3`}></i>
                        <span className="text-xs text-gray-700 font-medium">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={addMember} disabled={loading} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add member'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🔐 My Account Security
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Signed in as <strong>{currentEmail}</strong></p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Change Email</h3>
              <div className="space-y-3">
                <input type="email" value={emailNew} onChange={(e) => setEmailNew(e.target.value)} placeholder="New email" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700">Update Email</button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Change Password</h3>
              <div className="space-y-3">
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                <input type="password" value={passwordNew} onChange={(e) => setPasswordNew(e.target.value)} placeholder="New password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirm password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                <button onClick={updatePassword} disabled={loading} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 disabled:opacity-50">Update Password</button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-700">Protect your account with any TOTP authenticator app</p>
                <p className="text-xs text-gray-400 mt-0.5">{twoFactorEnabled ? 'Enabled' : 'DISABLED'}</p>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700">
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <i className="fas fa-robot"></i> Ollama Configuration
            </h2>
            <p className="text-violet-100 text-sm mt-1">Local AI — runs entirely on your machine, no API key needed</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">Ollama URL</label>
              <input type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} placeholder="http://localhost:11434" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">Model</label>
              <input type="text" value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} placeholder="llama3.2" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" />
            </div>
            <div className="flex gap-3">
              <button onClick={saveOllama} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                <i className="fas fa-save mr-1"></i> Save Configuration
              </button>
              <a href="https://ollama.com" target="_blank" className="text-sm text-violet-600 hover:text-violet-800 font-semibold flex items-center">
                Download Ollama →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <i className="fas fa-file-pdf"></i> PDF Knowledge Base
              </h2>
              <p className="text-amber-100 text-sm mt-1">{pdfFiles.length} PDF(s) indexed — used by the chatbot to answer questions</p>
            </div>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-3"></i>
              <p className="text-gray-400">Drag and drop PDF files here, or click to upload</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}