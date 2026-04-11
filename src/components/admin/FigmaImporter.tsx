'use client';

/**
 * FigmaImporter — Multi-step UI to import Figma frames and recreate them
 * as Eden CMS pages using the AI generator.
 *
 * Flow:
 *   Step 1 → Paste Figma URL → fetch file structure → select frames
 *   Step 2 → Generating (export + AI analysis)
 *   Step 3 → Done (redirect to editor)  |  Error state
 */

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Frame {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface FigmaPage {
  id: string;
  name: string;
  frames: Frame[];
}

interface FileInfo {
  fileKey: string;
  fileName: string;
  pages: FigmaPage[];
}

type Step = 'select' | 'generating' | 'done' | 'error';

const PROVIDERS = [
  { id: 'gemini',   label: 'Google Gemini',  icon: '🤖', note: 'Fastest, best vision' },
  { id: 'deepseek', label: 'DeepSeek',        icon: '🧠', note: 'Excellent reasoning' },
  { id: 'mistral',  label: 'Mistral AI',      icon: '✦',  note: 'Pixtral vision model' },
  { id: 'ollama',   label: 'Ollama (local)',  icon: '🖥️', note: 'Slow, needs vision model' },
];

const GEN_MSGS = [
  'Exporting frames from Figma…',
  'Analyzing layout and colors…',
  'Mapping sections to blocks…',
  'Building the page structure…',
  'Almost done…',
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function FigmaImporter() {
  const [step, setStep] = useState<Step>('select');

  // Step 1 state
  const [figmaUrl, setFigmaUrl] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [connectError, setConnectError] = useState('');
  const [selectedFrames, setSelectedFrames] = useState<Frame[]>([]);
  const [provider, setProvider] = useState('gemini');
  const [importMode, setImportMode] = useState<'one-page' | 'multi-page'>('one-page');

  // Step 2/3 state
  const [genStatus, setGenStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdPages, setCreatedPages] = useState<Array<{ id: string; title: string; slug: string }>>([]);

  // ── Step 1: Connect to Figma ─────────────────────────────────────────────

  async function handleConnect() {
    if (!figmaUrl.trim()) return;
    setConnecting(true);
    setConnectError('');
    setFileInfo(null);
    setSelectedFrames([]);

    try {
      const res = await fetch(`/api/figma/file?url=${encodeURIComponent(figmaUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) { setConnectError(data.error || 'Connection failed'); return; }
      setFileInfo(data);
    } catch {
      setConnectError('Network error — could not reach the server.');
    } finally {
      setConnecting(false);
    }
  }

  function toggleFrame(frame: Frame) {
    setSelectedFrames(prev =>
      prev.some(f => f.id === frame.id)
        ? prev.filter(f => f.id !== frame.id)
        : [...prev, frame],
    );
  }

  function selectAllFrames() {
    if (!fileInfo) return;
    const all = fileInfo.pages.flatMap(p => p.frames);
    setSelectedFrames(all);
  }

  function clearSelection() {
    setSelectedFrames([]);
  }

  // ── Step 2: Export + Generate ────────────────────────────────────────────

  async function handleGenerate() {
    if (!fileInfo || selectedFrames.length === 0) return;
    setStep('generating');
    setErrorMsg('');
    setCreatedPages([]);

    let msgIdx = 0;
    setGenStatus(GEN_MSGS[0]);
    const ticker = setInterval(() => {
      msgIdx = (msgIdx + 1) % GEN_MSGS.length;
      setGenStatus(GEN_MSGS[msgIdx]);
    }, 5000);

    try {
      // ── Export frames from Figma ───────────────────────────────────
      setGenStatus('Exporting frames from Figma…');
      const exportRes = await fetch('/api/figma/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey: fileInfo.fileKey, frames: selectedFrames }),
      });
      const exportData = await exportRes.json();
      if (!exportRes.ok) throw new Error(exportData.error || 'Figma export failed');

      const exportedFrames: Array<{ id: string; name: string; base64: string }> =
        exportData.frames || [];

      if (exportedFrames.length === 0) {
        throw new Error('No frames were exported. They may be empty.');
      }

      // ── Generate pages ─────────────────────────────────────────────
      setGenStatus('Analyzing design with AI…');

      const results: Array<{ id: string; title: string; slug: string }> = [];

      if (importMode === 'one-page') {
        // All frames → single page (pass all images at once)
        const frameNames = exportedFrames.map(f => f.name).join(', ');
        const prompt =
          `Analyze these Figma design frames and recreate them as a complete Eden CMS page.\n` +
          `Frames included: ${frameNames}\n` +
          `File: ${fileInfo.fileName}\n\n` +
          `Requirements:\n` +
          `- Preserve the visual layout, color scheme and content from the designs\n` +
          `- Extract all visible text and use it in the blocks\n` +
          `- Match colors exactly using hex values you observe\n` +
          `- Map each design section to the most appropriate Eden CMS block\n` +
          `- Create a complete, well-structured page`;

        const page = await callAIGenerate(
          prompt,
          exportedFrames.map(f => f.base64),
          provider,
        );
        results.push(page);
      } else {
        // Each frame → separate page
        for (const frame of exportedFrames) {
          setGenStatus(`Generating page for "${frame.name}"…`);
          const prompt =
            `Analyze this Figma design frame and recreate it as an Eden CMS page.\n` +
            `Frame name: "${frame.name}" (from file: ${fileInfo.fileName})\n\n` +
            `Requirements:\n` +
            `- Preserve the visual layout, color scheme and content from the design\n` +
            `- Extract all visible text and use it in the blocks\n` +
            `- Match colors exactly using hex values you observe\n` +
            `- Map each section to the most appropriate Eden CMS block\n` +
            `- Use the frame name as the page title`;

          const page = await callAIGenerate(prompt, [frame.base64], provider);
          results.push(page);
        }
      }

      clearInterval(ticker);
      setCreatedPages(results);
      setStep('done');
    } catch (err) {
      clearInterval(ticker);
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  }

  async function callAIGenerate(
    prompt: string,
    images: string[],
    aiProvider: string,
  ): Promise<{ id: string; title: string; slug: string }> {
    const res = await fetch('/api/ai/generate-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider: aiProvider, images }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'AI generation failed');
    }
    if (data.mode === 'questions') {
      // AI asked questions — regenerate with a note to skip questions
      const res2 = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt + '\n\nDo NOT ask questions — generate the page directly based on what you see in the images.',
          provider: aiProvider,
          images,
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok || !data2.success || !data2.page?.id) {
        throw new Error(data2.error || 'AI generation failed on retry');
      }
      return data2.page;
    }
    if (!data.page?.id) throw new Error('No page returned from AI');
    return data.page;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  function FrameTag({ frame, pageId }: { frame: Frame; pageId: string }) {
    const selected = selectedFrames.some(f => f.id === frame.id);
    return (
      <button
        onClick={() => toggleFrame(frame)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all text-xs ${
          selected
            ? 'border-violet-400 bg-violet-50 text-violet-800 shadow-sm'
            : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50/50'
        }`}
        key={`${pageId}-${frame.id}`}
      >
        <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          selected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
        }`}>
          {selected && <span className="text-white text-[9px] font-black">✓</span>}
        </span>
        <span className="truncate max-w-[180px] font-medium">{frame.name}</span>
        {frame.width > 0 && (
          <span className="ml-auto text-gray-400 whitespace-nowrap">{frame.width}×{frame.height}</span>
        )}
      </button>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  // ── Step: Generating ──────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
          <i className="fas fa-drafting-compass text-violet-600 text-2xl animate-pulse" />
        </div>
        <div>
          <p className="font-black text-gray-800 text-lg mb-1">Importing from Figma</p>
          <p className="text-gray-500 text-sm">{genStatus}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs text-gray-400 max-w-xs">
          This may take 30–120 seconds depending on the number of frames and AI provider.
        </p>
      </div>
    );
  }

  // ── Step: Done ────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <i className="fas fa-check-circle text-emerald-600 text-3xl" />
        </div>
        <div>
          <p className="font-black text-gray-800 text-xl mb-1">
            {createdPages.length === 1 ? 'Page created!' : `${createdPages.length} pages created!`}
          </p>
          <p className="text-gray-500 text-sm">Review and publish from the editor.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {createdPages.map(page => (
            <a
              key={page.id}
              href={`/admin/pages/${page.id}/preview`}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-violet-400 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-file-alt text-violet-600 text-sm" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{page.title}</p>
                <p className="text-xs text-gray-400">/{page.slug}</p>
              </div>
              <i className="fas fa-arrow-right text-gray-300 group-hover:text-violet-500 transition-colors" />
            </a>
          ))}
        </div>
        <button
          onClick={() => {
            setStep('select');
            setFileInfo(null);
            setFigmaUrl('');
            setSelectedFrames([]);
            setCreatedPages([]);
          }}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Import another file
        </button>
      </div>
    );
  }

  // ── Step: Error ───────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <i className="fas fa-exclamation-circle text-red-500 text-3xl" />
        </div>
        <div>
          <p className="font-black text-gray-800 text-xl mb-2">Import failed</p>
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md">{errorMsg}</p>
        </div>
        <button
          onClick={() => { setStep('select'); setErrorMsg(''); }}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Step: Select ──────────────────────────────────────────────────────────
  const allFrames = fileInfo?.pages.flatMap(p => p.frames) ?? [];
  const canGenerate = fileInfo && selectedFrames.length > 0;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── URL Input ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-900 to-purple-900">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-drafting-compass text-white text-sm" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-tight">Connect to Figma</h2>
            <p className="text-violet-200 text-xs">Paste the URL of your Figma file or design</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-3">
            <input
              type="url"
              value={figmaUrl}
              onChange={e => { setFigmaUrl(e.target.value); setConnectError(''); setFileInfo(null); setSelectedFrames([]); }}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              placeholder="https://www.figma.com/design/ABC123/My-Design"
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition font-mono"
            />
            <button
              onClick={handleConnect}
              disabled={connecting || !figmaUrl.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {connecting
                ? <><i className="fas fa-spinner fa-spin" /> Connecting…</>
                : <><i className="fas fa-plug" /> Connect</>}
            </button>
          </div>
          {connectError && (
            <p className="mt-3 text-xs px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <i className="fas fa-exclamation-circle mr-1" />{connectError}
            </p>
          )}
          {fileInfo && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
              <i className="fas fa-check-circle" />
              <strong>{fileInfo.fileName}</strong>
              <span className="text-emerald-500">— {allFrames.length} frames in {fileInfo.pages.length} page{fileInfo.pages.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Frame Selection ─────────────────────────────────────────── */}
      {fileInfo && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-black text-gray-800 text-sm">Select Frames</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {selectedFrames.length} of {allFrames.length} selected
                {selectedFrames.length > 8 && <span className="ml-2 text-amber-500">(max 8 frames per import)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={selectAllFrames} className="text-xs text-violet-600 hover:text-violet-800 font-bold px-3 py-1.5 rounded-lg hover:bg-violet-50 transition">
                Select all
              </button>
              {selectedFrames.length > 0 && (
                <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="p-5 space-y-5">
            {fileInfo.pages.map(page => (
              <div key={page.id}>
                {fileInfo.pages.length > 1 && (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="fas fa-layer-group" /> {page.name}
                  </p>
                )}
                {page.frames.length === 0 ? (
                  <p className="text-xs text-gray-300 italic">No frames found in this page.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {page.frames.map(frame => (
                      <FrameTag key={frame.id} frame={frame} pageId={page.id} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Generation Options ───────────────────────────────────────── */}
      {fileInfo && selectedFrames.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-800 text-sm">Generation Options</h2>
          </div>
          <div className="p-5 space-y-5">

            {/* Import mode */}
            {selectedFrames.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Import mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'one-page',    icon: 'fa-file',      label: 'Single page',   desc: 'All frames → one page' },
                    { id: 'multi-page',  icon: 'fa-copy',      label: 'Multiple pages', desc: 'One page per frame' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setImportMode(opt.id as 'one-page' | 'multi-page')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        importMode === opt.id
                          ? 'border-violet-400 bg-violet-50 shadow-sm'
                          : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40'
                      }`}
                    >
                      <i className={`fas ${opt.icon} text-violet-500`} />
                      <div>
                        <p className="text-sm font-bold text-gray-700">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Provider */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                AI Provider <span className="normal-case font-normal text-gray-400">(needs vision support)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      provider === p.id
                        ? 'border-violet-400 bg-violet-50 shadow-sm'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40'
                    }`}
                  >
                    <span className="text-xl leading-none">{p.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{p.label}</p>
                      <p className="text-[10px] text-gray-400">{p.note}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-xs text-violet-700 space-y-1">
              <p><strong>{selectedFrames.length} frame{selectedFrames.length > 1 ? 's' : ''}</strong> selected</p>
              <p>Mode: <strong>{importMode === 'one-page' ? 'All frames → 1 page' : `${selectedFrames.length} frames → ${selectedFrames.length} pages`}</strong></p>
              <p>Provider: <strong>{PROVIDERS.find(p => p.id === provider)?.label}</strong></p>
              <p className="text-violet-500">Estimated time: ~{selectedFrames.length * (provider === 'ollama' ? 90 : 20)}–{selectedFrames.length * (provider === 'ollama' ? 180 : 45)} seconds</p>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className="fas fa-magic" />
              Import {selectedFrames.length} Frame{selectedFrames.length > 1 ? 's' : ''} with AI
            </button>
          </div>
        </div>
      )}

      {/* ── No token warning ─────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-3">
        <i className="fas fa-info-circle mt-0.5 flex-shrink-0" />
        <div>
          <strong>Figma Personal Access Token required.</strong> If you see a connection error, go to{' '}
          <a href="/admin/ai-config" className="underline hover:text-amber-900">Configuration → API Keys</a>
          {' '}and paste your token (Figma → Account Settings → Personal access tokens, scope: <code>file_content:read</code>).
        </div>
      </div>
    </div>
  );
}
