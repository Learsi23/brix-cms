'use client';

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
  twoFactorEnabled: boolean;
}

type Status = { type: 'success' | 'error'; msg: string } | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium mt-4 ${
        isError
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
      }`}
    >
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

const inputCls =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const [user, setUser]             = useState<UserInfo | null>(null);
  const [loading, setLoading]       = useState(true);

  // Email
  const [newEmail, setNewEmail]     = useState('');
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [pwdStatus, setPwdStatus]     = useState<Status>(null);
  const [pwdSaving, setPwdSaving]     = useState(false);

  // 2FA
  const [tfaStep, setTfaStep]         = useState<'idle' | 'setup' | 'verify'>('idle');
  const [tfaQrUrl, setTfaQrUrl]       = useState('');
  const [tfaSecret, setTfaSecret]     = useState('');
  const [tfaCode, setTfaCode]         = useState('');
  const [tfaDisablePwd, setTfaDisablePwd] = useState('');
  const [tfaStatus, setTfaStatus]     = useState<Status>(null);
  const [tfaLoading, setTfaLoading]   = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  // ── Load user ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setNewEmail(data.email ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Email ──────────────────────────────────────────────────────────────────

  async function handleEmailSave() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-email', newEmail: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setUser(prev => prev ? { ...prev, email: newEmail.trim() } : prev);
      setEmailStatus({ type: 'success', msg: 'Email updated successfully.' });
    } catch (e: unknown) {
      setEmailStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setEmailSaving(false);
    }
  }

  // ── Password ───────────────────────────────────────────────────────────────

  async function handlePasswordSave() {
    setPwdSaving(true);
    setPwdStatus(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setPwdStatus({ type: 'success', msg: 'Password changed successfully.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: unknown) {
      setPwdStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setPwdSaving(false);
    }
  }

  // ── 2FA: Setup (generate QR) ───────────────────────────────────────────────

  async function handle2faSetup() {
    setTfaLoading(true);
    setTfaStatus(null);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate QR');
      setTfaQrUrl(data.qrUrl);
      setTfaSecret(data.secret);
      setTfaStep('setup');
    } catch (e: unknown) {
      setTfaStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Failed to set up 2FA.' });
    } finally {
      setTfaLoading(false);
    }
  }

  // ── 2FA: Enable (verify TOTP) ──────────────────────────────────────────────

  async function handle2faEnable() {
    if (tfaCode.length !== 6) { setTfaStatus({ type: 'error', msg: 'Enter the 6-digit code from your app.' }); return; }
    setTfaLoading(true);
    setTfaStatus(null);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', totpCode: tfaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Verification failed');
      setUser(prev => prev ? { ...prev, twoFactorEnabled: true } : prev);
      setTfaStep('idle');
      setTfaCode('');
      setTfaStatus({ type: 'success', msg: '2FA enabled — your account is now extra secure. ✅' });
    } catch (e: unknown) {
      setTfaStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Verification failed.' });
    } finally {
      setTfaLoading(false);
    }
  }

  // ── 2FA: Disable ──────────────────────────────────────────────────────────

  async function handle2faDisable() {
    if (!tfaDisablePwd) { setTfaStatus({ type: 'error', msg: 'Enter your password to disable 2FA.' }); return; }
    setTfaLoading(true);
    setTfaStatus(null);
    try {
      const res = await fetch('/api/account/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', password: tfaDisablePwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setUser(prev => prev ? { ...prev, twoFactorEnabled: false } : prev);
      setShowDisable(false);
      setTfaDisablePwd('');
      setTfaStatus({ type: 'success', msg: '2FA has been disabled.' });
    } catch (e: unknown) {
      setTfaStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Failed to disable 2FA.' });
    } finally {
      setTfaLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading account...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <header className="mb-2">
        <h1 className="text-3xl font-black text-slate-800">Account</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your email, password and security settings.</p>
        {user && (
          <p className="text-xs text-slate-400 mt-2">
            Signed in as <span className="font-semibold text-slate-600">{user.email}</span>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wide">
              {user.role}
            </span>
          </p>
        )}
      </header>

      {/* ── EMAIL ─────────────────────────────────────────────────────── */}
      <Card title="Email Address" subtitle="Change the email you use to log in.">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <button
            onClick={handleEmailSave}
            disabled={emailSaving || newEmail === user?.email}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
          >
            {emailSaving ? 'Saving...' : 'Update Email'}
          </button>
          <StatusBanner status={emailStatus} />
        </div>
      </Card>

      {/* ── PASSWORD ──────────────────────────────────────────────────── */}
      <Card title="Password" subtitle="Use a strong password of at least 8 characters.">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Current Password</label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handlePasswordSave()}
            />
          </div>
          <button
            onClick={handlePasswordSave}
            disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
          >
            {pwdSaving ? 'Saving...' : 'Change Password'}
          </button>
          <StatusBanner status={pwdStatus} />
        </div>
      </Card>

      {/* ── 2FA ───────────────────────────────────────────────────────── */}
      <Card
        title="Two-Step Verification"
        subtitle={
          user?.twoFactorEnabled
            ? 'Two-factor authentication is active on your account.'
            : 'Add an extra layer of security with an authenticator app.'
        }
      >
        {/* Current status badge */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              user?.twoFactorEnabled
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span>{user?.twoFactorEnabled ? '🔒' : '🔓'}</span>
            {user?.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
          </div>
        </div>

        {/* ── 2FA is DISABLED — show setup flow ── */}
        {!user?.twoFactorEnabled && (
          <div className="space-y-4">
            {tfaStep === 'idle' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed">
                  You will need an authenticator app like{' '}
                  <span className="font-semibold text-slate-700">Google Authenticator</span> or{' '}
                  <span className="font-semibold text-slate-700">Authy</span> to scan the QR code.
                </p>
                <button
                  onClick={handle2faSetup}
                  disabled={tfaLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors shadow-sm shadow-emerald-200"
                >
                  {tfaLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>🔐 Set Up 2FA</>
                  )}
                </button>
              </div>
            )}

            {tfaStep === 'setup' && (
              <div className="space-y-5">
                {/* Step 1 — Scan */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">
                    Step 1 — Scan this QR code with your authenticator app
                  </p>
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tfaQrUrl}
                      alt="2FA QR Code"
                      className="w-44 h-44 rounded-xl border-4 border-white shadow-md"
                    />
                  </div>
                  <details className="group">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                      Can&apos;t scan? Enter the code manually
                    </summary>
                    <code className="block mt-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 break-all select-all">
                      {tfaSecret}
                    </code>
                  </details>
                </div>

                {/* Step 2 — Verify */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">
                    Step 2 — Enter the 6-digit code from your app to confirm
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={tfaCode}
                    onChange={e => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handle2faEnable()}
                    className={`${inputCls} text-center tracking-[0.5em] text-lg font-mono`}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handle2faEnable}
                      disabled={tfaLoading || tfaCode.length !== 6}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
                    >
                      {tfaLoading ? 'Verifying...' : '✓ Enable 2FA'}
                    </button>
                    <button
                      onClick={() => { setTfaStep('idle'); setTfaCode(''); setTfaStatus(null); }}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 2FA is ENABLED — show disable option ── */}
        {user?.twoFactorEnabled && (
          <div className="space-y-4">
            {!showDisable ? (
              <button
                onClick={() => setShowDisable(true)}
                className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">
                  Confirm your password to disable two-factor authentication
                </p>
                <input
                  type="password"
                  value={tfaDisablePwd}
                  onChange={e => setTfaDisablePwd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle2faDisable()}
                  className={inputCls}
                  placeholder="Enter your current password"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handle2faDisable}
                    disabled={tfaLoading || !tfaDisablePwd}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
                  >
                    {tfaLoading ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                  <button
                    onClick={() => { setShowDisable(false); setTfaDisablePwd(''); setTfaStatus(null); }}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <StatusBanner status={tfaStatus} />
      </Card>

    </div>
  );
}
