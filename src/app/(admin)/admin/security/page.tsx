'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [admins, setAdmins] = useState<{ id: string; email: string; name: string; role: string; twoFactorEnabled: boolean }[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [emailNew, setEmailNew] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [tfaStep, setTfaStep] = useState<'idle' | 'setup' | 'disable'>('idle');
  const [tfaQrUrl, setTfaQrUrl] = useState('');
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [tfaPassword, setTfaPassword] = useState('');


  const allPerms = [
    { key: 'media', label: 'Media', icon: 'fa-image' },
    { key: 'configuration', label: 'Navbar & Footer', icon: 'fa-paint-brush' },
    { key: 'chatbot', label: 'Chatbot', icon: 'fa-robot' },
    { key: 'backup', label: 'Backup', icon: 'fa-database' },
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  async function fetchCurrentUser() {
    try {
      const res = await fetch('/api/account');
      if (res.ok) {
        const data = await res.json();
        if (data.email) setCurrentEmail(data.email);
        if (data.twoFactorEnabled !== undefined) setTwoFactorEnabled(data.twoFactorEnabled);
        if (data.role === 'owner') setIsOwner(true);
      }
    } catch (e) { console.error(e); }
  }

  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
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

  async function updateEmail() {
    if (!emailNew) {
      setMsg({ type: 'error', text: 'New email is required' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-email', newEmail: emailNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Email updated successfully' });
        setCurrentEmail(emailNew);
        setEmailNew('');
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to update email' });
      }
    } catch { setMsg({ type: 'error', text: 'Error updating email' }); }
    setLoading(false);
  }

  function togglePerm(key: string) {
    setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  async function start2FASetup() {
    setLoading(true);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      });
      const data = await res.json();
      if (res.ok) {
        setTfaQrUrl(data.qrUrl);
        setTfaSecret(data.secret);
        setTfaStep('setup');
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to start 2FA setup' });
      }
    } catch { setMsg({ type: 'error', text: 'Error starting 2FA setup' }); }
    setLoading(false);
  }

  async function verify2FA() {
    setLoading(true);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', totpCode: tfaCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTfaStep('idle');
        setTfaCode('');
        setMsg({ type: 'success', text: '2FA enabled successfully' });
      } else {
        setMsg({ type: 'error', text: data.error || 'Invalid code, try again' });
      }
    } catch { setMsg({ type: 'error', text: 'Error verifying code' }); }
    setLoading(false);
  }

  async function disable2FA() {
    setLoading(true);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', password: tfaPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(false);
        setTfaStep('idle');
        setTfaPassword('');
        setMsg({ type: 'success', text: '2FA disabled' });
      } else {
        setMsg({ type: 'error', text: data.error || 'Incorrect password' });
      }
    } catch { setMsg({ type: 'error', text: 'Error disabling 2FA' }); }
    setLoading(false);
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
                <button onClick={updateEmail} disabled={loading} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 disabled:opacity-50">Update Email</button>
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
                <p className={`text-xs mt-0.5 font-semibold ${twoFactorEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {twoFactorEnabled ? '✓ ENABLED' : 'DISABLED'}
                </p>
              </div>
              {tfaStep === 'idle' && (
                <button
                  onClick={() => twoFactorEnabled ? setTfaStep('disable') : start2FASetup()}
                  disabled={loading}
                  className={`px-4 py-2 text-white text-sm rounded-xl transition disabled:opacity-50 ${twoFactorEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-700'}`}
                >
                  {loading ? '...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              )}
            </div>

            {/* Setup flow: scan QR then verify */}
            {tfaStep === 'setup' && (
              <div className="mt-4 p-5 border border-indigo-200 bg-indigo-50 rounded-2xl space-y-4">
                <div className="flex items-start gap-5">
                  <img src={tfaQrUrl} alt="TOTP QR Code" className="w-36 h-36 rounded-xl border border-indigo-200 bg-white p-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">1. Scan this QR with your authenticator app</p>
                    <p className="text-xs text-gray-500 mb-3">Google Authenticator, Authy, 1Password, etc.</p>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Or enter the key manually:</p>
                    <code className="block text-xs font-mono bg-white border border-indigo-200 rounded-lg px-3 py-2 tracking-widest select-all break-all">{tfaSecret}</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">2. Enter the 6-digit code to confirm</p>
                  <div className="flex gap-3 flex-wrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={tfaCode}
                      onChange={e => setTfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-36 px-4 py-2.5 rounded-xl border border-indigo-200 text-center font-mono text-lg tracking-[0.4em] bg-white"
                    />
                    <button
                      onClick={verify2FA}
                      disabled={loading || tfaCode.length !== 6}
                      className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                    <button
                      onClick={() => { setTfaStep('idle'); setTfaCode(''); }}
                      className="px-4 py-2 text-gray-500 text-sm rounded-xl hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Disable flow: confirm with password */}
            {tfaStep === 'disable' && (
              <div className="mt-4 p-5 border border-red-200 bg-red-50 rounded-2xl space-y-3">
                <p className="text-sm font-semibold text-gray-700">Enter your password to disable 2FA</p>
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="password"
                    value={tfaPassword}
                    onChange={e => setTfaPassword(e.target.value)}
                    placeholder="Current password"
                    className="flex-1 min-w-[200px] px-3 py-2.5 rounded-xl border border-red-200 text-sm bg-white"
                  />
                  <button
                    onClick={disable2FA}
                    disabled={loading || !tfaPassword}
                    className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                  <button
                    onClick={() => { setTfaStep('idle'); setTfaPassword(''); }}
                    className="px-4 py-2 text-gray-500 text-sm rounded-xl hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}