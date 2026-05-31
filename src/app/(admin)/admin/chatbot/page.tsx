'use client';

import { useState, useEffect } from 'react';

type Status = { type: 'success' | 'error'; msg: string } | null;

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium mb-4 ${isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
      <i className={`fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`} />
      {status.msg}
    </div>
  );
}

function Card({ title, subtitle, children, accent }: { title: string; subtitle: string; children: React.ReactNode; accent?: string }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-6 py-5 border-b border-slate-100 ${accent ? 'border-l-4' : ''}`} style={accent ? { borderLeftColor: accent } : {}}>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

const inputCls  = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors';
const labelCls  = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';
const selectCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors';

interface OllamaModel { name: string; size?: number }

interface PullStatus {
  status: string;
  completed?: number;
  total?: number;
  digest?: string;
}

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite  (fastest, free tier)' },
  { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash       (balanced)' },
  { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro         (most capable)' },
  { value: 'gemini-1.5-flash',      label: 'Gemini 1.5 Flash       (legacy)' },
];

export default function ChatbotPage() {
  // ── Ollama state ────────────────────────────────────────────────────────────
  const [ollamaUrl,   setOllamaUrl]   = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('');
  const [models,      setModels]      = useState<OllamaModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [downloadModel,   setDownloadModel]   = useState('');
  const [pullStatus,      setPullStatus]      = useState<PullStatus | null>(null);
  const [pullProgress,    setPullProgress]    = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // ── Gemini state ────────────────────────────────────────────────────────────
  const [geminiKey,      setGeminiKey]      = useState('');
  const [geminiKeyIsSet, setGeminiKeyIsSet] = useState(false);
  const [geminiModel,    setGeminiModel]    = useState('gemini-2.5-flash-lite');
  const [geminiTesting,  setGeminiTesting]  = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // ── Active provider state ───────────────────────────────────────────────────
  const [activeProvider, setActiveProvider] = useState<'ollama' | 'gemini'>('ollama');

  // ── Shared ──────────────────────────────────────────────────────────────────
  const [saveLoading,   setSaveLoading]   = useState(false);
  const [status,        setStatus]        = useState<Status>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/chat/config');
      if (res.ok) {
        const data = await res.json();
        if (data.ollama_url)    setOllamaUrl(data.ollama_url);
        if (data.ollama_model)  setOllamaModel(data.ollama_model);
        if (data.ai_provider)   setActiveProvider(data.ai_provider);
        if (data.gemini_model)  setGeminiModel(data.gemini_model);
        setGeminiKeyIsSet(!!data.gemini_key_is_set);
      }
    } finally {
      setConfigLoading(false);
    }
  }

  async function fetchModels() {
    setModelsLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`);
      if (!res.ok) throw new Error('Could not reach Ollama server');
      const data = await res.json();
      const list: OllamaModel[] = (data.models ?? []).map((m: { name: string; size?: number }) => ({
        name: m.name, size: m.size,
      }));
      setModels(list);
      if (list.length === 0) setStatus({ type: 'error', msg: 'No models found. Pull a model first.' });
    } catch {
      setStatus({ type: 'error', msg: `Could not connect to Ollama at ${ollamaUrl}. Is it running?` });
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }

  async function handleSaveOllama(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/chat/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ollama_url: ollamaUrl, ollama_model: ollamaModel }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setStatus({ type: 'success', msg: 'Ollama configuration saved.' });
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleSaveGemini(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setStatus(null);
    setGeminiTestResult(null);
    try {
      const body: Record<string, string> = { gemini_model: geminiModel };
      if (geminiKey.trim()) body.gemini_api_key = geminiKey.trim();
      const res = await fetch('/api/chat/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setStatus({ type: 'success', msg: 'Gemini configuration saved.' });
      setGeminiKey('');
      setGeminiKeyIsSet(true);
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDeleteGeminiKey() {
    if (!confirm('Remove saved Gemini API key?')) return;
    setSaveLoading(true);
    try {
      await fetch('/api/chat/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ gemini_api_key: '' }),
      });
      setGeminiKeyIsSet(false);
      setGeminiKey('');
      setStatus({ type: 'success', msg: 'Gemini API key removed.' });
      // If active provider was Gemini, switch back to Ollama
      if (activeProvider === 'gemini') await handleSetProvider('ollama');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleTestGemini() {
    const key = geminiKey.trim() || (geminiKeyIsSet ? '(saved)' : '');
    if (!key) { setGeminiTestResult({ ok: false, msg: 'Enter or save a Gemini API key first.' }); return; }
    setGeminiTesting(true);
    setGeminiTestResult(null);
    try {
      // Use a minimal non-streaming request to test the key
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${geminiKey.trim()}`,
        },
        body: JSON.stringify({
          model:      geminiModel,
          messages:   [{ role: 'user', content: 'Say "OK" only.' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) {
        setGeminiTestResult({ ok: true, msg: `✓ Connected to ${geminiModel} successfully.` });
      } else {
        const txt = await res.text().catch(() => '');
        setGeminiTestResult({ ok: false, msg: `Error ${res.status}: ${txt.slice(0, 120)}` });
      }
    } catch (err) {
      setGeminiTestResult({ ok: false, msg: (err as Error).message });
    } finally {
      setGeminiTesting(false);
    }
  }

  async function handleSetProvider(provider: 'ollama' | 'gemini') {
    if (provider === 'gemini' && !geminiKeyIsSet) {
      setStatus({ type: 'error', msg: 'Save a Gemini API key first.' });
      return;
    }
    try {
      await fetch('/api/chat/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ai_provider: provider }),
      });
      setActiveProvider(provider);
      setStatus({ type: 'success', msg: `Active provider set to ${provider === 'gemini' ? 'Gemini' : 'Ollama'}.` });
    } catch {
      setStatus({ type: 'error', msg: 'Failed to set active provider.' });
    }
  }

  // Streaming pull — reads NDJSON from Ollama /api/pull
  async function handleDownload() {
    if (!downloadModel.trim()) return;
    setDownloadLoading(true);
    setStatus(null);
    setPullStatus(null);
    setPullProgress(0);

    try {
      const res = await fetch(`${ollamaUrl}/api/pull`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: downloadModel.trim(), stream: true }),
      });

      if (!res.ok || !res.body) throw new Error('Pull request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const json: PullStatus = JSON.parse(trimmed);
            setPullStatus(json);
            if (json.total && json.completed) {
              setPullProgress(Math.round((json.completed / json.total) * 100));
            }
            if (json.status === 'success') {
              setStatus({ type: 'success', msg: `Model '${downloadModel}' downloaded successfully.` });
              setDownloadModel('');
              fetchModels();
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setStatus({ type: 'error', msg: `Could not pull model. Is Ollama running at ${ollamaUrl}?` });
    } finally {
      setDownloadLoading(false);
      setPullProgress(0);
    }
  }

  const popularModels = ['llama3.2', 'mistral', 'gemma3', 'phi4', 'qwen2.5', 'llama3.1:8b', 'codellama', 'deepseek-r1:7b'];

  if (configLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <i className="fas fa-spinner fa-spin" />
          <span className="text-sm">Loading configuration…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Chatbot Configuration</h1>
        <p className="text-sm text-slate-400 mt-1">
          Choose between a local Ollama model or Gemini cloud AI. Both work with ChatBlock and FloatingChatBlock.
        </p>
      </div>

      <StatusBanner status={status} />

      {/* ── Active provider selector ────────────────────────────────────────── */}
      <Card title="Active Provider" subtitle="Which AI powers chat blocks on your site right now">
        <div className="flex gap-3">
          {(['ollama', 'gemini'] as const).map(p => {
            const isActive = activeProvider === p;
            const label = p === 'ollama'
              ? { icon: 'fas fa-server',  name: 'Ollama (local)',  desc: 'Free · Private · No API key' }
              : { icon: 'fas fa-cloud',   name: 'Gemini (cloud)',  desc: 'Google AI · Requires API key' };
            return (
              <button
                key={p}
                onClick={() => handleSetProvider(p)}
                disabled={p === 'gemini' && !geminiKeyIsSet}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <i className={`${label.icon} text-sm ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-slate-700'}`}>{label.name}</span>
                  {isActive && <span className="ml-auto text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                </div>
                <p className="text-xs text-slate-400">{label.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Gemini ─────────────────────────────────────────────────────────── */}
      <Card title="Google Gemini" subtitle="Cloud AI — connect your Gemini API key" accent="#4285F4">
        <form onSubmit={handleSaveGemini} className="space-y-4">

          {/* Key field */}
          <div>
            <label className={labelCls}>API Key</label>
            {geminiKeyIsSet && !geminiKey && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <i className="fas fa-check-circle" /> API key is saved
                </span>
                <button
                  type="button"
                  onClick={handleDeleteGeminiKey}
                  className="text-xs text-red-400 hover:text-red-600 ml-auto"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              className={inputCls}
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder={geminiKeyIsSet ? 'Enter new key to replace…' : 'AIza…'}
              autoComplete="new-password"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Get your free key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                aistudio.google.com/apikey
              </a>
            </p>
          </div>

          {/* Model selector */}
          <div>
            <label className={labelCls}>Model</label>
            <select
              className={selectCls}
              value={geminiModel}
              onChange={e => setGeminiModel(e.target.value)}
            >
              {GEMINI_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Test result */}
          {geminiTestResult && (
            <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${geminiTestResult.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <i className={`fas ${geminiTestResult.ok ? 'fa-check-circle' : 'fa-exclamation-circle'} mt-0.5 flex-shrink-0`} />
              {geminiTestResult.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {saveLoading && <i className="fas fa-spinner fa-spin text-xs" />}
              {saveLoading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={geminiTesting || (!geminiKey.trim() && !geminiKeyIsSet)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {geminiTesting && <i className="fas fa-spinner fa-spin text-xs" />}
              {geminiTesting ? 'Testing…' : 'Test connection'}
            </button>
          </div>
        </form>
      </Card>

      {/* ── Ollama ─────────────────────────────────────────────────────────── */}
      <Card title="Ollama (local)" subtitle="Free, private AI running on your own server" accent="#22C55E">
        <form onSubmit={handleSaveOllama} className="space-y-4">
          <div>
            <label className={labelCls}>Ollama URL</label>
            <input
              className={inputCls}
              type="url"
              value={ollamaUrl}
              onChange={e => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Model</label>
              <button
                type="button"
                onClick={fetchModels}
                disabled={modelsLoading}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 flex items-center gap-1"
              >
                <i className={`fas ${modelsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} text-[10px]`} />
                {modelsLoading ? 'Loading…' : 'Refresh models'}
              </button>
            </div>
            {models.length > 0 ? (
              <select className={selectCls} value={ollamaModel} onChange={e => setOllamaModel(e.target.value)}>
                <option value="">— Select a model —</option>
                {models.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}{m.size ? ` (${(m.size / 1e9).toFixed(1)} GB)` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputCls}
                type="text"
                value={ollamaModel}
                onChange={e => setOllamaModel(e.target.value)}
                placeholder="e.g. llama3.2, mistral, gemma3"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {saveLoading && <i className="fas fa-spinner fa-spin text-xs" />}
            {saveLoading ? 'Saving…' : 'Save Configuration'}
          </button>
        </form>
      </Card>

      {/* ── Download Model ─────────────────────────────────────────────────── */}
      <Card title="Download Ollama Model" subtitle="Pull a new model from the Ollama registry">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Model Name</label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                type="text"
                value={downloadModel}
                onChange={e => setDownloadModel(e.target.value)}
                placeholder="e.g. llama3.2, mistral:7b"
                disabled={downloadLoading}
                onKeyDown={e => e.key === 'Enter' && handleDownload()}
              />
              <button
                onClick={handleDownload}
                disabled={downloadLoading || !downloadModel.trim()}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors flex-shrink-0 flex items-center gap-2"
              >
                {downloadLoading && <i className="fas fa-spinner fa-spin text-xs" />}
                {downloadLoading ? 'Pulling…' : 'Pull'}
              </button>
            </div>
          </div>

          {downloadLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{pullStatus?.status ?? 'Connecting…'}</span>
                {pullProgress > 0 && <span className="font-semibold">{pullProgress}%</span>}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${pullProgress || 5}%` }}
                />
              </div>
              {pullStatus?.digest && (
                <p className="text-[10px] text-slate-400 font-mono truncate">{pullStatus.digest}</p>
              )}
            </div>
          )}

          <div>
            <p className={labelCls}>Popular Models</p>
            <div className="flex flex-wrap gap-2">
              {popularModels.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDownloadModel(m)}
                  disabled={downloadLoading}
                  className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Pulling a model downloads it to your Ollama server. This may take several minutes depending on model size.
          </p>
        </div>
      </Card>

    </div>
  );
}
