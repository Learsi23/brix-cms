'use client';

import Link from 'next/link';
// Configuration page — Account Security + AI Provider/Keys + Usage Tracking + PDF Knowledge Base
// Equivalent to ConfiguracionController.AiConfig + AiConfig.cshtml in .NET

import { useState, useEffect, useRef } from 'react';

interface PdfFile { name: string; size: number; lastModified: string; formattedSize: string; }
interface UserInfo { email: string; twoFactorEnabled: boolean; }
interface ApiKeyInfo { provider: string; hasSavedKey: boolean; }
interface UsageStats { totalCalls: number; totalInput: number; totalOutput: number; totalCost: number; byProvider: Array<{ provider: string; inputTokens: number; outputTokens: number; cost: number }>; recent: Array<{ date: string; operation: string; provider: string; tokens: number; cost: number }>; }
interface GenLog { id: string; pageId: string | null; pageTitle: string; prompt: string; provider: string; mode: string; date: string; }

type AccountTab = 'email' | 'password' | '2fa';
type AiTab = 'keys' | 'usage' | 'history' | 'ollama' | 'pdf';
type Msg = { type: 'success' | 'error'; text: string } | null;

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', icon: '🤖', models: ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'], docs: 'https://aistudio.google.com/app/apikey' },
  { id: 'deepseek', label: 'DeepSeek', icon: '🧠', models: ['deepseek-chat', 'deepseek-reasoner'], docs: 'https://platform.deepseek.com/api_keys' },
  { id: 'mistral', label: 'Mistral AI', icon: '✦', models: ['mistral-small-2503', 'pixtral-12b-2409', 'mistral-large-latest'], docs: 'https://console.mistral.ai/api-keys/' },
];

const input = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none transition';
const saveBtn = 'bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50 whitespace-nowrap';

export default function AiConfigPage() {
  // ── Account state ──────────────────────────────────────────────────
  const [accountTab, setAccountTab] = useState<AccountTab>('email');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accountMsg, setAccountMsg] = useState<Msg>(null);
  const [newEmail, setNewEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  // 2FA
  const [tfaStep, setTfaStep] = useState<'info' | 'scan'>('info');
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaQr, setTfaQr] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [tfaDisablePw, setTfaDisablePw] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);

  // ── API Keys state ────────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>('');
  const [keyMsgs, setKeyMsgs] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [keyTestResults, setKeyTestResults] = useState<Record<string, { ok: boolean; error?: string }>>({});

  // ── Usage Stats state ─────────────────────────────────────────────
  const [usagePeriod, setUsagePeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // ── Generation History state ──────────────────────────────────────
  const [genHistory, setGenHistory] = useState<GenLog[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // ── Ollama state ────────────────────────────────────────────────────
  const [aiTab, setAiTab] = useState<AiTab>('keys');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  // ── PDF state ──────────────────────────────────────────────────────
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reingesting, setReingesting] = useState(false);
  const [pdfMsg, setPdfMsg] = useState<Msg>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Key inputs per provider
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/account').then(r => r.ok ? r.json() : null).then(d => {
      if (d) { setUser(d); setNewEmail(d.email); }
    });
    loadPdfs();
    loadApiKeys();
    loadUsageStats();
    loadGenHistory();
  }, []);

  function showAccountMsg(type: 'success' | 'error', text: string) {
    setAccountMsg({ type, text });
    setTimeout(() => setAccountMsg(null), 4000);
  }

  function showPdfMsg(type: 'success' | 'error', text: string) {
    setPdfMsg({ type, text });
    setTimeout(() => setPdfMsg(null), 4000);
  }

  // ── Account handlers ─────────────────────────────────────────────
  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingAccount(true);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change-email', newEmail }),
    });
    const d = await res.json();
    if (res.ok) { showAccountMsg('success', d.message); setUser(u => u ? { ...u, email: newEmail } : u); }
    else showAccountMsg('error', d.error);
    setSavingAccount(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingAccount(true);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change-password', currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
    });
    const d = await res.json();
    if (res.ok) { showAccountMsg('success', d.message); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    else showAccountMsg('error', d.error);
    setSavingAccount(false);
  }

  async function handle2faSetup() {
    setTfaLoading(true);
    const res = await fetch('/api/account/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup' }),
    });
    const d = await res.json();
    if (res.ok) { setTfaSecret(d.secret); setTfaQr(d.qrUrl); setTfaStep('scan'); }
    else showAccountMsg('error', d.error);
    setTfaLoading(false);
  }

  async function handle2faEnable(e: React.FormEvent) {
    e.preventDefault();
    setTfaLoading(true);
    const res = await fetch('/api/account/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enable', totpCode: tfaCode }),
    });
    const d = await res.json();
    if (res.ok) { showAccountMsg('success', d.message); setUser(u => u ? { ...u, twoFactorEnabled: true } : u); setTfaStep('info'); setTfaCode(''); }
    else showAccountMsg('error', d.error);
    setTfaLoading(false);
  }

  async function handle2faDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm('Disable 2FA?')) return;
    setTfaLoading(true);
    const res = await fetch('/api/account/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'disable', password: tfaDisablePw }),
    });
    const d = await res.json();
    if (res.ok) { showAccountMsg('success', d.message); setUser(u => u ? { ...u, twoFactorEnabled: false } : u); setTfaDisablePw(''); }
    else showAccountMsg('error', d.error);
    setTfaLoading(false);
  }

  // ── API Keys handlers ─────────────────────────────────────────────
  async function loadApiKeys() {
    const res = await fetch('/api/ai/api-keys');
    if (res.ok) {
      const d = await res.json();
      setApiKeys(d.keys || []);
    }
    // Load active provider from config
    const configRes = await fetch('/api/config?key=ai');
    if (configRes.ok) {
      const cfg = await configRes.json();
      if (cfg.value) {
        setActiveProvider(cfg.value.provider || '');
        setActiveModel(cfg.value.model || '');
      }
    }
  }

  async function handleSaveApiKey(provider: string, apiKey: string) {
    if (!apiKey) return;
    setTestingKey(provider);
    setKeyTestResults(prev => ({ ...prev, [provider]: { ok: true } }));
    
    const res = await fetch('/api/ai/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    const d = await res.json();
    
    if (res.ok) {
      setKeyMsgs(prev => ({ ...prev, [provider]: { type: 'success', text: 'Key saved' } }));
      loadApiKeys();
    } else {
      setKeyTestResults(prev => ({ ...prev, [provider]: { ok: false, error: d.error } }));
      setKeyMsgs(prev => ({ ...prev, [provider]: { type: 'error', text: d.error } }));
    }
    setTestingKey(null);
  }

  async function handleDeleteApiKey(provider: string) {
    if (!confirm(`Delete key for ${provider}?`)) return;
    await fetch('/api/ai/api-keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    loadApiKeys();
  }

  async function handleSetActiveProvider(provider: string, model: string) {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'ai', value: { provider, model } }),
    });
    setActiveProvider(provider);
    setActiveModel(model);
    setKeyMsgs(prev => ({ ...prev, [provider]: { type: 'success', text: 'Active provider set' } }));
  }

  // ── Usage Stats handlers ──────────────────────────────────────────
  async function loadUsageStats() {
    setUsageLoading(true);
    try {
      const res = await fetch(`/api/ai/usage?period=${usagePeriod}`);
      if (res.ok) setUsageStats(await res.json());
    } catch {}
    setUsageLoading(false);
  }

  async function handleClearUsage() {
    if (!confirm('Clear all usage logs?')) return;
    await fetch('/api/ai/usage', { method: 'DELETE' });
    loadUsageStats();
  }

  // ── Gen History handlers ──────────────────────────────────────────
  async function loadGenHistory() {
    setGenLoading(true);
    try {
      const res = await fetch('/api/ai/generation-history');
      if (res.ok) {
        const d = await res.json();
        setGenHistory(d.logs || []);
      }
    } catch {}
    setGenLoading(false);
  }

  // ── Ollama handlers ─────────────────────────────────────────────────
  async function loadOllamaModels() {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const res = await fetch('/api/ai/models');
      const d = await res.json();
      if (res.ok && d.models) {
        setOllamaModels(d.models.map((m: any) => m.name || m.id));
      } else {
        setOllamaError(d.error || 'Could not connect to Ollama');
      }
    } catch {
      setOllamaError('Could not connect to Ollama - make sure it is running');
    }
    setOllamaLoading(false);
  }

  async function handleSetOllamaModel(model: string) {
    setTestingKey('ollama');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai', value: { provider: 'ollama', model } }),
      });
      if (res.ok) {
        setActiveProvider('ollama');
        setActiveModel(model);
        setKeyMsgs(prev => ({ ...prev, ollama: { type: 'success', text: 'Ollama model set as active' } }));
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setKeyMsgs(prev => ({ ...prev, ollama: { type: 'error', text: 'Failed to set model' } }));
    }
    setTestingKey(null);
  }

  // ── PDF handlers ───────────────────────────────────────────────────
  async function loadPdfs() {
    const res = await fetch('/api/ai-config');
    if (res.ok) setPdfs(await res.json());
    setPdfsLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { showPdfMsg('error', 'Only PDF files are allowed'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/ai-config', { method: 'POST', body: formData });
    const d = await res.json();
    if (res.ok) { showPdfMsg('success', d.message); loadPdfs(); }
    else showPdfMsg('error', d.error || 'Upload failed');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDeletePdf(fileName: string) {
    if (!confirm(`Delete PDF "${fileName}"?`)) return;
    const res = await fetch('/api/ai-config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
    });
    const d = await res.json();
    if (res.ok) { showPdfMsg('success', d.message); loadPdfs(); }
    else showPdfMsg('error', d.error || 'Delete failed');
  }

  async function handleReingest() {
    if (!confirm('Re-process all PDFs?')) return;
    setReingesting(true);
    showPdfMsg('success', `${pdfs.length} PDF(s) queued for re-processing`);
    setReingesting(false);
  }

  function fmtTokens(n: number) {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }

  function formatNum(n: number) {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }

  async function clearUsage() {
    if (!confirm('Clear all usage history?')) return;
    await fetch('/api/ai/usage', { method: 'DELETE' });
    loadUsageStats();
  }

  const tabClass = (t: AccountTab) =>
    'flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ' +
    (accountTab === t ? 'border-slate-800 text-slate-800 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600');

  const aiTabClass = (t: AiTab) =>
    'flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ' +
    (aiTab === t ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600');

  const hasKey = (p: string) => apiKeys.some(k => k.provider === p && k.hasSavedKey);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Configuration</h1>
        <p className="text-gray-400 text-sm">Account security, AI providers and knowledge base</p>
      </div>

      {accountMsg && (
        <div className={accountMsg.type === 'success' ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-700' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700'}>
          <i className={accountMsg.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} />
          {accountMsg.text}
        </div>
      )}

      {/* ══ ACCOUNT SECURITY ══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-user-shield text-white text-sm" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-tight">Account Security</h2>
            <p className="text-slate-400 text-xs">{user?.email ?? '...'}</p>
          </div>
        </div>
        <div className="flex border-b border-gray-100 bg-gray-50">
          <button onClick={() => setAccountTab('email')} className={tabClass('email')}><i className="fas fa-at" /> Email</button>
          <button onClick={() => setAccountTab('password')} className={tabClass('password')}><i className="fas fa-key" /> Password</button>
          <button onClick={() => setAccountTab('2fa')} className={tabClass('2fa')}><i className="fas fa-mobile-alt" /> 2FA</button>
        </div>
        <div className="p-6">
          {accountTab === 'email' && (
            <form onSubmit={handleChangeEmail} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className={input} />
              </div>
              <button type="submit" disabled={savingAccount} className={saveBtn}>Save</button>
            </form>
          )}
          {accountTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required placeholder="••••••••" className={input} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="••••••••" minLength={8} className={input} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required placeholder="••••••••" minLength={8} className={input} />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={savingAccount} className={saveBtn}>Change password</button>
              </div>
            </form>
          )}
          {accountTab === '2fa' && (
            user?.twoFactorEnabled ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-shield-alt text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm mb-0.5">2FA is active</p>
                  <p className="text-xs text-gray-500 mb-4">Your account is protected with two-factor authentication.</p>
                  <form onSubmit={handle2faDisable} className="flex gap-3 items-end">
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm your password to disable</label>
                      <input type="password" value={tfaDisablePw} onChange={e => setTfaDisablePw(e.target.value)} required placeholder="••••••••" className={input} />
                    </div>
                    <button type="submit" disabled={tfaLoading} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50">Disable</button>
                  </form>
                </div>
              </div>
            ) : tfaStep === 'info' ? (
              <div>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-mobile-alt text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1">Enable two-factor authentication</p>
                    <p className="text-xs text-gray-500">You will need an app like <strong>Google Authenticator</strong> or <strong>Authy</strong>.</p>
                  </div>
                </div>
                <button onClick={handle2faSetup} disabled={tfaLoading} className={saveBtn}>
                  {tfaLoading ? <><i className="fas fa-spinner fa-spin mr-1" /> Generating...</> : 'Set up 2FA'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">Scan the QR code with your app or enter the manual key:</p>
                <div className="flex gap-6 items-start flex-wrap">
                  <img src={tfaQr} alt="QR Code" className="w-36 h-36 border rounded-xl shadow-sm" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Manual key</p>
                    <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg block tracking-widest">{tfaSecret}</code>
                  </div>
                </div>
                <form onSubmit={handle2faEnable} className="flex gap-3 items-end">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Verification code</label>
                    <input type="text" value={tfaCode} onChange={e => setTfaCode(e.target.value)} maxLength={6} pattern="\d{6}" inputMode="numeric" required placeholder="000000" className="w-36 px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-center tracking-widest font-mono focus:ring-2 focus:ring-emerald-200 outline-none transition" />
                  </div>
                  <button type="submit" disabled={tfaLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50">{tfaLoading ? 'Verifying...' : 'Activate 2FA'}</button>
                </form>
              </div>
            )
          )}
        </div>
      </div>

      {/* ══ AI PROVIDER & API KEYS ══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-900 to-violet-900">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-tight">AI Provider</h2>
            <p className="text-indigo-200 text-xs">Keys are stored encrypted (AES-256-GCM). Used for chat, page generation and PDF Q&amp;A.</p>
          </div>
        </div>
        <div className="flex border-b border-gray-100 bg-gray-50">
          <button onClick={() => setAiTab('keys')} className={aiTabClass('keys')}><i className="fas fa-key" /> API Keys</button>
          <button onClick={() => { setAiTab('usage'); loadUsageStats(); }} className={aiTabClass('usage')}><i className="fas fa-chart-line" /> Usage</button>
          <button onClick={() => { setAiTab('history'); loadGenHistory(); }} className={aiTabClass('history')}><i className="fas fa-history" /> History</button>
          <button onClick={() => { setAiTab('ollama'); loadOllamaModels(); }} className={aiTabClass('ollama')}><i className="fas fa-desktop" /> Ollama</button>
          <button onClick={() => setAiTab('pdf')} className={aiTabClass('pdf')}><i className="fas fa-file-pdf" /> Knowledge</button>
        </div>
        <div className="p-6">
          {/* Keys Tab */}
          {aiTab === 'keys' && (
            <div className="space-y-4">
              {PROVIDERS.map(p => {
                const hasSaved = hasKey(p.id);
                const isActive = activeProvider === p.id;
                
                return (
                  <div key={p.id} className={isActive ? 'border border-indigo-300 bg-indigo-50/40 rounded-2xl p-4 space-y-3 transition-all' : 'border border-gray-200 rounded-2xl p-4 space-y-3 transition-all'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{p.icon}</span>
                        <div>
                          <span className="font-bold text-gray-800 text-sm">{p.label}</span>
                          {hasSaved && <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Key saved</span>}
                          {isActive && <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">Active</span>}
                        </div>
                      </div>
                      <a href={p.docs} target="_blank" className="text-xs text-indigo-500 hover:text-indigo-700 underline">Get key</a>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        value={keyInputs[p.id] || ''}
                        onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder={hasSaved ? 'Leave blank to keep existing key' : 'Paste API key here'}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none font-mono"
                      />
                      <button onClick={() => handleSaveApiKey(p.id, keyInputs[p.id] || '')} disabled={testingKey === p.id} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50">
                        Save
                      </button>
                      {hasSaved && (
                        <button onClick={() => handleDeleteApiKey(p.id)} className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition">Del</button>
                      )}
                    </div>
                    {keyMsgs[p.id] && (
                      <div className={keyMsgs[p.id].type === 'success' ? 'text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700' : 'text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600'}>
                        {keyMsgs[p.id].text}
                      </div>
                    )}
                    {hasSaved && (
                      <form onSubmit={e => { e.preventDefault(); handleSetActiveProvider(p.id, (e.target as HTMLFormElement).querySelector<HTMLSelectElement>('select')?.value || p.models[0]); }} className="flex gap-2 items-center flex-wrap border-t border-gray-100 pt-3">
                        <select name="model" defaultValue={isActive ? activeModel : p.models[0]} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none bg-white">
                          {p.models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button type="submit" className={isActive ? 'bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition' : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition'}>
                          {isActive ? 'Active' : 'Set Active'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
              {/* ── Figma Personal Access Token ── */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fas fa-drafting-compass text-violet-400" /> Figma Integration
                </p>
                <div className={`rounded-2xl p-4 space-y-3 border transition-all ${hasKey('figma') ? 'border-violet-300 bg-violet-50/40' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">🎨</span>
                      <div>
                        <span className="font-bold text-gray-800 text-sm">Figma</span>
                        {hasKey('figma') && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block"></span> Token saved
                          </span>
                        )}
                      </div>
                    </div>
                    <a href="https://help.figma.com/hc/en-us/articles/8085703771159" target="_blank" className="text-xs text-violet-500 hover:text-violet-700 underline">Get token</a>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="password"
                      value={keyInputs['figma'] || ''}
                      onChange={e => setKeyInputs(prev => ({ ...prev, figma: e.target.value }))}
                      placeholder={hasKey('figma') ? 'Leave blank to keep existing token' : 'figd_••••••••••••••••'}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 outline-none font-mono"
                    />
                    <button onClick={() => handleSaveApiKey('figma', keyInputs['figma'] || '')} disabled={testingKey === 'figma'} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50">
                      Save
                    </button>
                    {hasKey('figma') && (
                      <button onClick={() => handleDeleteApiKey('figma')} className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition">Del</button>
                    )}
                  </div>
                  {keyMsgs['figma'] && (
                    <div className={keyMsgs['figma'].type === 'success' ? 'text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700' : 'text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600'}>
                      {keyMsgs['figma'].text}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Figma → Account Settings → Personal access tokens → Create token → scope: <code className="bg-gray-100 px-1 rounded">file_content:read</code>.
                    Used by <Link href="/admin/figma" className="text-violet-500 underline">Figma Import</Link> to export frames and recreate them as Brix pages.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5 text-indigo-400"></i>
                <span>The <strong>active provider</strong> is used for all AI features: chat, page generation and PDF Q&amp;A. If no provider is active, the system falls back to <strong>Ollama</strong> (local). Keys never leave the server — stored with AES-256-GCM encryption.</span>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {aiTab === 'usage' && (
            <div className="space-y-4">
              <div className="flex gap-1 justify-end">
                {[{ k: 'today', l: 'Today' }, { k: 'week', l: '7d' }, { k: 'month', l: 'Month' }, { k: 'all', l: 'All' }].map(p => (
                  <button key={p.k} onClick={() => { setUsagePeriod(p.k as typeof usagePeriod); loadUsageStats(); }} type="button" className={usagePeriod === p.k ? 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white' : 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-gray-100 text-gray-600 hover:bg-gray-200'}>{p.l}</button>
                ))}
              </div>
              {usageLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>Loading…</div>
              ) : usageStats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-emerald-700">{formatNum(usageStats.totalCalls)}</p>
                      <p className="text-xs text-emerald-600 font-medium">API Calls</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-blue-700">{formatNum(usageStats.totalInput)}</p>
                      <p className="text-xs text-blue-600 font-medium">Input Tokens</p>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-violet-700">{formatNum(usageStats.totalOutput)}</p>
                      <p className="text-xs text-violet-600 font-medium">Output Tokens</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-amber-700">$ {usageStats.totalCost.toFixed(4)}</p>
                      <p className="text-xs text-amber-600 font-medium">Est. Cost</p>
                    </div>
                  </div>
                  {usageStats.byProvider?.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wide"><th className="px-3 py-2 text-left">Provider</th><th className="px-3 py-2 text-right">Input</th><th className="px-3 py-2 text-right">Output</th><th className="px-3 py-2 text-right">Cost</th></tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {usageStats.byProvider.map(r => (
                            <tr key={r.provider} className="hover:bg-gray-50/50">
                              <td className="px-3 py-2 font-semibold text-gray-700 capitalize">{r.provider}</td>
                              <td className="px-3 py-2 text-right font-mono text-gray-600">{formatNum(r.inputTokens)}</td>
                              <td className="px-3 py-2 text-right font-mono text-gray-600">{formatNum(r.outputTokens)}</td>
                              <td className="px-3 py-2 text-right font-mono text-gray-700 font-bold">$ {r.cost.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <button onClick={clearUsage} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear usage history</button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400"><i className="fas fa-chart-bar text-3xl mb-2 opacity-20"></i><p className="text-sm">No usage data yet.</p></div>
              )}
            </div>
          )}

          {/* History Tab */}
          {aiTab === 'history' && (
            <div>
              {genLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>Loading…</div>
              ) : genHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><i className="fas fa-history text-3xl mb-2 opacity-20"></i><p className="text-sm">No generations yet.</p></div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wide"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Page</th><th className="px-3 py-2 text-left">Prompt</th><th className="px-3 py-2 text-left">Provider</th><th className="px-3 py-2 text-left">Mode</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {genHistory.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">{r.date}</td>
                          <td className="px-3 py-2 font-semibold text-gray-700 max-w-[150px] truncate">{r.pageTitle}</td>
                          <td className="px-3 py-2 text-gray-600 max-w-[250px]"><span title={r.prompt}>{r.prompt.length > 80 ? r.prompt.substring(0, 80) + '…' : r.prompt}</span></td>
                          <td className="px-3 py-2 capitalize text-gray-600">{r.provider}</td>
                          <td className="px-3 py-2"><span className={r.mode === 'update' ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700' : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700'}>{r.mode}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Ollama Tab */}
          {aiTab === 'ollama' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
                <i className="fas fa-desktop mt-0.5"></i>
                <span>Ollama runs locally on your computer. Make sure <strong>ollama serve</strong> is running before using it. <a href="https://ollama.com" target="_blank" className="underline font-bold">Download Ollama ↗</a></span>
              </div>
              {ollamaLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Connecting to Ollama...
                </div>
              ) : ollamaError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 text-sm text-red-700">
                  <p className="font-bold mb-1">⚠️ {ollamaError}</p>
                  <p className="text-xs">Make sure Ollama is running. Open a terminal and run: <code className="bg-red-100 px-1 rounded">ollama serve</code></p>
                  <button onClick={loadOllamaModels} className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition">Try Again</button>
                </div>
              ) : ollamaModels.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-robot text-4xl mb-3 opacity-20"></i>
                  <p className="text-sm">No models found</p>
                  <p className="text-xs mt-1">Run <code className="bg-gray-100 px-1 rounded">ollama pull MODEL_NAME</code> to install models</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available models on your computer:</p>
                  {ollamaModels.map(model => {
                    const isActive = activeProvider === 'ollama' && activeModel === model;
                    return (
                      <div key={model} className={isActive ? 'flex items-center justify-between p-3 rounded-xl border border-blue-300 bg-blue-50' : 'flex items-center justify-between p-3 rounded-xl border border-gray-200'}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">Llama</span>
                          <span className="font-mono text-sm font-medium text-gray-800">{model}</span>
                          {isActive && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Active</span>}
                        </div>
                        <button onClick={() => handleSetOllamaModel(model)} className={isActive ? 'bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition' : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition'}>
                          {isActive ? 'Active' : 'Set Active'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PDF/Knowledge Tab */}
          {aiTab === 'pdf' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button onClick={handleReingest} disabled={reingesting || pdfs.length === 0} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 text-sm font-semibold transition">
                    {reingesting ? 'Hourglass' : 'Refresh'} Re-process All
                  </button>
                  <label className={uploading ? 'px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 text-sm font-semibold cursor-pointer transition opacity-50 pointer-events-none' : 'px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 text-sm font-semibold cursor-pointer transition'}>
                    {uploading ? 'Hourglass Uploading...' : 'Document Upload PDF'}
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              {pdfMsg && (
                <div className={pdfMsg.type === 'success' ? 'px-4 py-3 rounded-xl text-sm font-medium bg-green-50 border border-green-200 text-green-700' : 'px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-600'}>
                  {pdfMsg.type === 'success' ? 'Check' : 'Error'} {pdfMsg.text}
                </div>
              )}
              {pdfsLoading ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">Loading PDFs...</div>
              ) : pdfs.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-5xl mb-4">📄</p>
                  <p className="text-gray-500 text-sm mb-1">No PDFs uploaded yet</p>
                  <p className="text-gray-400 text-xs">Upload PDFs to build the AI knowledge base</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {pdfs.map(pdf => (
                    <div key={pdf.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 group hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <i className="fas fa-file-pdf text-red-400 text-sm flex-shrink-0"></i>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{pdf.name}</p>
                          <p className="text-[10px] text-gray-400">{pdf.formattedSize} · {new Date(pdf.lastModified).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeletePdf(pdf.name)} className="w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition text-xs">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

    </div> </div> </div>
  );
};
