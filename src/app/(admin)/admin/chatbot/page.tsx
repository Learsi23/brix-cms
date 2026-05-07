'use client';

import { useState, useEffect } from 'react';

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

interface OllamaModel {
  name: string;
  size?: number;
}

export default function ChatbotPage() {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [downloadModel, setDownloadModel] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/chat/config');
      if (res.ok) {
        const data = await res.json();
        if (data.ollama_url) setOllamaUrl(data.ollama_url);
        if (data.ollama_model) setOllamaModel(data.ollama_model);
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
        name: m.name,
        size: m.size,
      }));
      setModels(list);
      if (list.length === 0) setStatus({ type: 'error', msg: 'No models found. Pull a model first.' });
    } catch (err) {
      setStatus({ type: 'error', msg: `Could not connect to Ollama at ${ollamaUrl}. Is it running?` });
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/chat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ollamaUrl, model: ollamaModel }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save');
      setStatus({ type: 'success', msg: 'Chatbot configuration saved.' });
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDownload() {
    if (!downloadModel.trim()) return;
    setDownloadLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: downloadModel.trim() }),
      });
      if (!res.ok) throw new Error('Pull failed');
      setStatus({ type: 'success', msg: `Model '${downloadModel}' pull started. Refresh models when done.` });
      setDownloadModel('');
    } catch {
      setStatus({ type: 'error', msg: `Could not pull model. Is Ollama running at ${ollamaUrl}?` });
    } finally {
      setDownloadLoading(false);
    }
  }

  const popularModels = ['llama3.2', 'mistral', 'gemma3', 'phi4', 'qwen2.5', 'llama3.1:8b'];

  if (configLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Chatbot Configuration</h1>
        <p className="text-sm text-slate-400 mt-1">Connect your Ollama server and select the AI model for chat blocks.</p>
      </div>

      <StatusBanner status={status} />

      <Card title="Ollama Server" subtitle="Configure connection to your local Ollama instance">
        <form onSubmit={handleSave} className="space-y-4">
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
                {modelsLoading ? 'Loading...' : '↻ Refresh models'}
              </button>
            </div>
            {models.length > 0 ? (
              <select
                className={inputCls}
                value={ollamaModel}
                onChange={e => setOllamaModel(e.target.value)}
              >
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
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
          >
            {saveLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </Card>

      <Card title="Download Model" subtitle="Pull a new model from the Ollama registry">
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
              />
              <button
                onClick={handleDownload}
                disabled={downloadLoading || !downloadModel.trim()}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {downloadLoading ? '...' : 'Pull'}
              </button>
            </div>
          </div>

          <div>
            <p className={labelCls}>Popular Models</p>
            <div className="flex flex-wrap gap-2">
              {popularModels.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDownloadModel(m)}
                  className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
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

      <Card title="How It Works" subtitle="AI chat blocks connect to this Ollama server">
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">1.</span>
            Install <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Ollama</a> on your server or local machine.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">2.</span>
            Enter the URL where Ollama is running (default: http://localhost:11434).
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">3.</span>
            Refresh models to see what&apos;s installed, or pull a new model above.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">4.</span>
            Select your model and save. AI Chat blocks on your pages will use this model.
          </li>
        </ul>
      </Card>
    </div>
  );
}
