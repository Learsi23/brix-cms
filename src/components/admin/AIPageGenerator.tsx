'use client';

import { useState, useEffect, useRef } from 'react';

interface PageInfo {
  id: string;
  title: string;
  slug: string;
}

interface MediaFolder {
  name: string;
  path: string;
  files: string[];
}

interface SavedKeyInfo {
  provider: string;
  hasSavedKey: boolean;
  updatedAt: string;
}

interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  type: string;
}

type Step = 1 | 2 | 3 | 4;
type Mode = 'create' | 'update';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', icon: '🤖', docsUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'deepseek', label: 'DeepSeek', icon: '🧠', docsUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'mistral', label: 'Mistral AI', icon: '✦', docsUrl: 'https://console.mistral.ai/api-keys/' },
];

const TEMPLATES = [
  'Landing page de presentación de empresa con hero, servicios y contacto',
  'Tienda online con catálogo de productos y carrito de compras',
  'Blog de artículos con imagen destacada y grid de entradas recientes',
  'Página de contacto con formulario, mapa y datos de la empresa',
  'Portfolio de proyectos con galería de imágenes y descripción',
  'Página de precios con 3 planes y tabla comparativa',
  'About us con historia de la empresa, equipo y valores',
  'FAQ con preguntas frecuentes organizadas por categorías',
];

export default function AIPageGenerator({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<Mode>('create');
  const [prompt, setPrompt] = useState('');
  const [folder, setFolder] = useState('');
  const [pdf, setPdf] = useState('');
  const [pageToUpdateId, setPageToUpdateId] = useState('');
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [mediaFolders, setMediaFolders] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [savedKeys, setSavedKeys] = useState<Record<string, SavedKeyInfo>>({});
  const [provider, setProvider] = useState('gemini');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeProviderId, setActiveProviderId] = useState<string>('');

  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [genStatus, setGenStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQId, setPickerQId] = useState('');
  const [pickerMode, setPickerMode] = useState<'single' | 'multi'>('single');
  const [pickerFolder, setPickerFolder] = useState('');
  const [pickerFolders, setPickerFolders] = useState<string[]>([]);
  const [pickerImages, setPickerImages] = useState<string[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [pagesRes, mediaRes, pdfsRes, keysRes, configRes] = await Promise.all([
        fetch('/api/pages'),
        fetch('/api/ai/media'),
        fetch('/api/ai-config'),
        fetch('/api/ai/api-keys'),
        fetch('/api/config?key=ai'),
      ]);

      const pagesData = await pagesRes.json();
      setPages(pagesData.pages || pagesData || []);

      const mediaData = await mediaRes.json();
      setMediaFolders(mediaData.folders?.map((f: any) => f.name || f.path) || []);
      
      const allFiles: string[] = [];
      (mediaData.folders || []).forEach((f: any) => {
        (f.files || []).forEach((img: string) => allFiles.push(img));
      });
      setAllImages(allFiles);

      const pdfsData = await pdfsRes.json();
      setPdfs(pdfsData.map((p: any) => p.name) || []);

      const keysData = await keysRes.json();
      const keysMap: Record<string, SavedKeyInfo> = {};
      (keysData.keys || []).forEach((k: SavedKeyInfo) => { keysMap[k.provider] = k; });
      setSavedKeys(keysMap);

      const configData = await configRes.json();
      if (configData.value?.provider) {
        setActiveProvider(`${configData.value.provider} — ${configData.value.model}`);
        setActiveProviderId(configData.value.provider);
      }
    } catch (e) {
      console.error('Load initial data error', e);
    }
  }

  function getStepTitle() {
    if (step === 1) return mode === 'update' ? 'Update Page with AI' : 'Generate Page with AI';
    if (step === 2) return 'A few questions…';
    if (step === 3) return mode === 'update' ? 'Updating your page…' : 'Building your page…';
    return 'Something went wrong';
  }

  async function analyze() {
    if (!prompt.trim()) return;
    if (mode === 'update' && !pageToUpdateId) return;

    setStep(3);
    setGenStatus('Analyzing your request…');
    setLoading(true);
    setErrorMsg('');

    try {
      // Determinar el provider a usar
      // Si hay un provider activo configurado, usarlo; si no, usar ollama
      const providerToUse = activeProviderId && savedKeys[activeProviderId]?.hasSavedKey ? activeProviderId : 'ollama';
      console.log('[AI] Using provider:', providerToUse);

      const res = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: providerToUse,
          selectedMedia: folder || undefined,
          pdfFileName: pdf || undefined,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.error) {
        setErrorMsg(data.error);
        setStep(4);
        return;
      }

      if (data.mode === 'questions' && data.questions?.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setProductImages({});
        data.questions.forEach((q: ClarifyingQuestion) => { answers[q.id] = ''; });
        setStep(2);
      } else if (data.success && data.page?.id) {
        // Page already generated on first call — redirect directly, no second API call needed
        window.location.href = `/admin/pages/${data.page.id}/preview`;
      } else {
        setErrorMsg(data.error || 'Unexpected response from AI');
        setStep(4);
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setStep(4);
    }
  }

  async function generate() {
    setStep(3);
    setGenStatus(mode === 'update' ? 'Loading current page…' : 'Building the hero section…');
    setLoading(true);
    setErrorMsg('');

    // Determinar el provider a usar
    const providerToUse = activeProviderId && savedKeys[activeProviderId]?.hasSavedKey ? activeProviderId : 'ollama';
    console.log('[AI] Using provider for generate:', providerToUse);

    const msgs = mode === 'update'
      ? ['Analyzing current blocks…', 'Applying your changes…', 'Rebuilding sections…', 'Almost done…']
      : ['Building hero section…', 'Adding content blocks…', 'Creating product cards…', 'Applying colors…', 'Almost done…'];
    let mi = 0;
    const ticker = setInterval(() => { setGenStatus(msgs[mi++ % msgs.length]); }, 4000);

    try {
      const res = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: providerToUse,
          selectedMedia: folder || undefined,
          pdfFileName: pdf || undefined,
          questionAnswers: Object.keys(answers).length > 0 ? answers : undefined,
        }),
      });

      clearInterval(ticker);
      setLoading(false);
      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
        setStep(4);
        return;
      }

      if (data.success && data.page?.id) {
        window.location.href = `/admin/pages/${data.page.id}/preview`;
      }
    } catch (e) {
      clearInterval(ticker);
      setLoading(false);
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setStep(4);
    }
  }

  function openPicker(qId: string, mode: 'single' | 'multi') {
    setPickerQId(qId);
    setPickerMode(mode);
    setPickerFolder('');
    setPickerOpen(true);
    loadPickerFolder('');
  }

  async function loadPickerFolder(f: string) {
    setPickerFolder(f);
    setPickerLoading(true);
    try {
      let url = '/api/ai/media';
      if (f) {
        url = '/api/ai/media?folder=' + encodeURIComponent(f);
      }
      const res = await fetch(url);
      const data = await res.json();
      setPickerFolders(data.folders?.map((fol: any) => fol.name || fol.path) || []);
      const imgs: string[] = [];
      data.folders?.forEach((fol: any) => { (fol.files || []).forEach((img: string) => imgs.push(img)); });
      setPickerImages(imgs);
    } catch { } finally {
      setPickerLoading(false);
    }
  }

  function pickerIsSelected(img: string) {
    if (pickerMode === 'single') return answers[pickerQId] === img;
    return (productImages[pickerQId] || []).includes(img);
  }

  function pickerSelect(img: string) {
    if (pickerMode === 'single') {
      setAnswers(prev => ({ ...prev, [pickerQId]: img }));
    } else {
      const current = productImages[pickerQId] || [];
      const idx = current.indexOf(img);
      if (idx === -1) {
        setProductImages(prev => ({ ...prev, [pickerQId]: [...current, img] }));
        setAnswers(prev => ({ ...prev, [pickerQId]: [...current, img].map((p, i) => `Product ${i+1}: ${p}`).join(', ') }));
      } else {
        const updated = current.filter((_, i) => i !== idx);
        setProductImages(prev => ({ ...prev, [pickerQId]: updated }));
        setAnswers(prev => ({ ...prev, [pickerQId]: updated.map((p, i) => `Product ${i+1}: ${p}`).join(', ') }));
      }
    }
  }

  function pickerConfirm() {
    if (pickerMode === 'single') {
    } else {
      const arr = productImages[pickerQId] || [];
      setAnswers(prev => ({ ...prev, [pickerQId]: arr.map((p, i) => `Product ${i+1}: ${p}`).join(', ') }));
    }
    setPickerOpen(false);
  }

  function removeProductImg(qId: string, idx: number) {
    const updated = [...(productImages[qId] || [])];
    updated.splice(idx, 1);
    setProductImages(prev => ({ ...prev, [qId]: updated }));
    setAnswers(prev => ({ ...prev, [qId]: updated.map((p, i) => `Product ${i+1}: ${p}`).join(', ') }));
  }

  function isImageQuestion(q: ClarifyingQuestion) {
    return /logo|image|photo|banner|hero|media|picture|visual/i.test(q.id + ' ' + q.question);
  }

  function isProductQuestion(q: ClarifyingQuestion) {
    return /product|card/i.test(q.id + ' ' + q.question);
  }

  const hasSavedKey = savedKeys[provider]?.hasSavedKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b rounded-t-2xl ${
          step === 3 ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
          mode === 'update' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
          activeProvider ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
          'bg-gradient-to-r from-gray-700 to-gray-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
              {mode === 'update' ? '✏️' : '🤖'}
            </div>
            <div>
              <h2 className="font-black text-white text-base">{getStepTitle()}</h2>
              <p className="text-white/70 text-xs">
                {activeProvider || '🖥️ Ollama — configure in Settings → AI Config'}
              </p>
            </div>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          )}
        </div>

        {/* No provider warning */}
        {!activeProvider && step === 1 && (
          <div className="px-6 pt-4">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs">
              <span>⚠️</span>
              <div>
                <p className="font-bold text-amber-800">No AI provider configured</p>
                <p className="text-amber-700">Go to Settings → AI Config, add a Gemini API key, and set as Active.</p>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* STEP 1: Describe */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button onClick={() => setMode('create')} type="button"
                  className={`flex-1 py-2.5 text-xs font-bold transition ${mode === 'create' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  ✨ Create new page
                </button>
                <button onClick={() => setMode('update')} type="button"
                  className={`flex-1 py-2.5 text-xs font-bold transition ${mode === 'update' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  ✏️ Update existing page
                </button>
              </div>

              {/* Page selector (update mode) */}
              {mode === 'update' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Which page to update?</label>
                  <select value={pageToUpdateId} onChange={(e) => setPageToUpdateId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                    <option value="">— Select a page —</option>
                    {pages.map(pg => (
                      <option key={pg.id} value={pg.id}>{pg.title} ({pg.slug})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Prompt */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {mode === 'update' ? 'What changes do you want?' : 'Describe the page'}
                </label>
                {mode === 'create' && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Quick templates</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TEMPLATES.map(t => (
                        <button key={t} type="button" onClick={() => setPrompt(t)}
                          className="text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 px-3 py-1.5 rounded-full transition font-medium">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder={mode === 'update'
                    ? 'Ex: Change the hero image to the new banner. Add a contact section at the bottom.'
                    : 'Ex: Landing page for a manga store — dark slate-900 background, 4 product cards, contact section at the bottom.'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📁 Image folder</label>
                  <select value={folder} onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                    <option value="">— All folders —</option>
                    {mediaFolders.filter(Boolean).map(f => (
                      <option key={f} value={f}>📁 {f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📄 Reference PDF</label>
                  <select value={pdf} onChange={(e) => setPdf(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                    <option value="">— No PDF —</option>
                    {pdfs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Questions */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 italic">Answer as many as you can — skip what you don't know:</p>
              {questions.map(q => (
                <div key={q.id} className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-0.5">💡 {q.why}</p>
                  </div>
                  <div className="px-4 py-3">
                    {/* image type */}
                    {q.type === 'image' && (
                      <div>
                        {answers[q.id] && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-violet-50 rounded-xl border border-violet-200">
                            <img src={answers[q.id]} className="w-14 h-10 object-cover rounded-lg shadow"/>
                            <span className="text-xs text-violet-700 font-mono flex-1 truncate">{answers[q.id]}</span>
                            <button onClick={() => setAnswers(prev => ({ ...prev, [q.id]: '' }))} type="button" className="text-xs text-red-400 hover:text-red-600 font-bold px-2">✕ Remove</button>
                          </div>
                        )}
                        <button type="button" onClick={() => openPicker(q.id, 'single')}
                          className="flex items-center gap-2 w-full border-2 border-dashed border-violet-300 hover:border-violet-500 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-3 text-sm font-semibold text-violet-600 transition">
                          🖼️ <span>{answers[q.id] ? 'Change image…' : 'Browse & select image…'}</span>
                        </button>
                      </div>
                    )}

                    {/* product_images type */}
                    {q.type === 'product_images' && (
                      <div>
                        {productImages[q.id]?.length > 0 && (
                          <div className="flex flex-col gap-1 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Selected (in order):</p>
                            {productImages[q.id].map((img, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-violet-50 rounded-lg px-2 py-1.5 border border-violet-100">
                                <span className="text-xs font-black text-violet-500 w-5 text-center">{idx+1}.</span>
                                <img src={img} className="w-10 h-8 object-cover rounded shadow"/>
                                <span className="text-xs text-violet-700 font-mono flex-1 truncate">{img}</span>
                                <button onClick={() => removeProductImg(q.id, idx)} type="button" className="text-red-400 hover:text-red-600 text-xs font-bold px-1">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button type="button" onClick={() => openPicker(q.id, 'multi')}
                          className="flex items-center gap-2 w-full border-2 border-dashed border-violet-300 hover:border-violet-500 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-3 text-sm font-semibold text-violet-600 transition">
                          🖼️ Browse & add product images…
                        </button>
                        <p className="text-xs text-gray-400 mt-1">Click images in order — first image → first product.</p>
                      </div>
                    )}

                    {/* color type */}
                    {q.type === 'color' && (
                      <div className="flex items-center gap-3">
                        <input type="color" value={answers[q.id] || '#1e293b'}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
                        <input type="text" value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                          placeholder="#1e293b"/>
                      </div>
                    )}

                    {/* url type */}
                    {q.type === 'url' && (
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['/', '/products', '/contact', '/about', '#'].map(preset => (
                            <button key={preset} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: preset }))} type="button"
                              className={`text-xs font-mono px-2.5 py-1 rounded-lg transition ${answers[q.id] === preset ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input type="text" value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                          placeholder="/my-page or https://..."/>
                      </div>
                    )}

                    {/* textarea type */}
                    {q.type === 'textarea' && (
                      <textarea value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                        placeholder="Your answer..."/>
                    )}

                    {/* default text input */}
                    {!['image', 'product_images', 'color', 'url', 'textarea'].includes(q.type) && (
                      <input type="text" value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        placeholder="Your answer..."/>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Generating */}
          {step === 3 && (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-bounce"
                style={{ background: mode === 'update' ? 'linear-gradient(135deg,#2563eb22,#0891b222)' : 'linear-gradient(135deg,#7c3aed22,#4f46e522)' }}>
                {mode === 'update' ? '✏️' : '🤖'}
              </div>
              <p className="font-bold text-gray-800 text-lg">{mode === 'update' ? 'Updating your page…' : 'Generating your page…'}</p>
              <p className="text-sm text-gray-500 max-w-sm">{genStatus}</p>
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* STEP 4: Error */}
          {step === 4 && (
            <div className="py-6">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-bold mb-1">Something went wrong</p>
                  <p className="text-xs font-mono break-all leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center gap-3 rounded-b-2xl">
          <span className="text-xs text-gray-400 flex-1">
            {step === 1 && mode === 'create' && 'Draft created — review in Preview before publishing.'}
            {step === 1 && mode === 'update' && 'The AI will always ask for confirmation before making changes.'}
            {step === 2 && 'Skip questions you don\'t know — AI uses sensible defaults.'}
            {step === 3 && 'This may take 10–30 seconds…'}
          </span>
          <div className="flex gap-2">
            {step === 1 && (
              <>
                <button onClick={onClose} type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
                <button onClick={analyze} disabled={!prompt.trim() || (mode === 'update' && !pageToUpdateId)} type="button"
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-40">
                  🔍 Analyze Request
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">← Back</button>
                <button onClick={generate} type="button" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">
                  {mode === 'update' ? '✏️ Apply Changes' : '🚀 Generate Page'}
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <button onClick={onClose} type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Close</button>
                <button onClick={() => setStep(questions.length > 0 ? 2 : 1)} type="button" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">↩ Try Again</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-3xl" style={{ maxHeight: '88vh' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🖼️</span>
                <div>
                  <h3 className="font-black text-white text-base">Media Library</h3>
                  <p className="text-white/60 text-xs">
                    {pickerMode === 'multi' ? 'Click images in order to select them' : 'Click an image to select it'}
                  </p>
                </div>
              </div>
              <button onClick={() => setPickerOpen(false)} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Folder sidebar */}
              <div className="w-44 flex-shrink-0 border-r bg-gray-50 overflow-y-auto">
                <div className="p-2 space-y-0.5">
                  <button onClick={() => loadPickerFolder('')}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition flex items-center gap-2 ${pickerFolder === '' ? 'bg-violet-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
                    <span>📂</span> All images
                    <span className="ml-auto text-[10px] opacity-60">{allImages.length}</span>
                  </button>
                  {pickerFolders.map(f => (
                    <button key={f} onClick={() => loadPickerFolder(f)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition flex items-center gap-2 ${pickerFolder === f ? 'bg-violet-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
                      <span>📁</span>
                      <span className="flex-1 truncate">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image grid */}
              <div className="flex-1 overflow-y-auto p-3">
                {pickerLoading ? (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm gap-2">
                    <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading…
                  </div>
                ) : pickerImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400 text-sm">
                    <span className="text-4xl">🖼️</span>
                    <p>No images in this folder.</p>
                  </div>
                ) : (
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))' }}>
                    {pickerImages.map(img => (
                      <div key={img} onClick={() => pickerSelect(img)}
                        className={`cursor-pointer rounded-xl overflow-hidden aspect-square relative transition-all shadow-sm ${
                          pickerIsSelected(img) ? 'ring-3 ring-violet-500 ring-offset-1' : 'hover:ring-2 hover:ring-violet-300'
                        }`}>
                        <img src={img} className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).parentElement?.remove()} />
                        {pickerMode === 'multi' && pickerIsSelected(img) && (
                          <div className="absolute inset-0 bg-violet-500/25 flex items-end justify-center pb-1.5">
                            <span className="bg-violet-600 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow">
                              {(productImages[pickerQId] || []).indexOf(img) + 1}
                            </span>
                          </div>
                        )}
                        {pickerMode === 'single' && pickerIsSelected(img) && (
                          <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                            <span className="bg-violet-600 text-white text-sm font-black rounded-full w-7 h-7 flex items-center justify-center shadow">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex items-center gap-3 rounded-b-2xl">
              <span className="text-xs text-gray-400 flex-1">
                {pickerMode === 'single' ? `${pickerImages.length} image(s) in folder` : `${(productImages[pickerQId] || []).length} selected`}
              </span>
              <button onClick={() => setPickerOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={pickerConfirm}
                disabled={pickerMode === 'single' && !answers[pickerQId]}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-40">
                {pickerMode === 'single' ? '✓ Use this image' : `✓ Done (${(productImages[pickerQId] || []).length} selected)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
