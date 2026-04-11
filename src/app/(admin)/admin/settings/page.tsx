'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  customText: string;
  customUrl: string;
  isCustomUrl: boolean;
  pageSlug: string;
}

interface SocialMedia {
  platform: string;
  url: string;
  iconClass: string;
}

interface NavbarSettings {
  backgroundColor: string;
  textColor: string;
  logo: string;
  logoAltText: string;
  logoWidth: string;
  logoLink: string;
  isSticky: boolean;
  hasShadow: boolean;
  paddingVertical: string;
  menuItems: MenuItem[];
}

interface FooterSettings {
  backgroundColor: string;
  textColor: string;
  logo: string;
  logoAltText: string;
  logoWidth: string;
  logoPosition: string;
  showPagesColumn: boolean;
  pagesColumnTitle: string;
  pages: MenuItem[];
  showSocialMediaColumn: boolean;
  socialMediaColumnTitle: string;
  socialMedia: SocialMedia[];
  showCopyrightRow: boolean;
  companyName: string;
  companyNumber: string;
  copyrightText: string;
  showHorizontalLine: boolean;
  paddingVertical: string;
  columnsGap: string;
}

interface SiteSettings {
  navbar: NavbarSettings;
  footer: FooterSettings;
}

const defaultSettings: SiteSettings = {
  navbar: {
    backgroundColor: '#ffffff', textColor: '#000000', logo: '', logoAltText: 'Logo',
    logoWidth: '150px', logoLink: '/', isSticky: true, hasShadow: true,
    paddingVertical: 'py-3', menuItems: [],
  },
  footer: {
    backgroundColor: '#1a1a1a', textColor: '#ffffff', logo: '', logoAltText: 'Logo',
    logoWidth: '150px', logoPosition: 'left', showPagesColumn: true, pagesColumnTitle: 'Páginas',
    pages: [], showSocialMediaColumn: true, socialMediaColumnTitle: 'Síguenos', socialMedia: [],
    showCopyrightRow: true, companyName: '', companyNumber: '', copyrightText: 'Todos los derechos reservados',
    showHorizontalLine: true, paddingVertical: 'py-6', columnsGap: 'gap-8',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'navbar' | 'footer'>('navbar');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/config?key=site').then(async res => {
      if (res.ok) {
        const data = await res.json();
        if (data.value) setSettings({ ...defaultSettings, ...data.value });
      }
    });
  }, []);

  function updateNavbar(field: string, value: string | boolean) {
    setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, [field]: value } }));
  }

  function updateFooter(field: string, value: string | boolean) {
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  }

  function addMenuItem() {
    setSettings(prev => ({
      ...prev,
      navbar: { ...prev.navbar, menuItems: [...prev.navbar.menuItems, { customText: '', customUrl: '', isCustomUrl: true, pageSlug: '' }] },
    }));
  }

  function removeMenuItem(idx: number) {
    setSettings(prev => ({
      ...prev,
      navbar: { ...prev.navbar, menuItems: prev.navbar.menuItems.filter((_, i) => i !== idx) },
    }));
  }

  function updateMenuItem(idx: number, field: string, value: string | boolean) {
    setSettings(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        menuItems: prev.navbar.menuItems.map((item, i) => i === idx ? { ...item, [field]: value } : item),
      },
    }));
  }

  function addSocialMedia() {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, socialMedia: [...prev.footer.socialMedia, { platform: '', url: '', iconClass: '' }] },
    }));
  }

  function removeSocialMedia(idx: number) {
    setSettings(prev => ({
      ...prev,
      footer: { ...prev.footer, socialMedia: prev.footer.socialMedia.filter((_, i) => i !== idx) },
    }));
  }

  function updateSocialMedia(idx: number, field: string, value: string) {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialMedia: prev.footer.socialMedia.map((item, i) => i === idx ? { ...item, [field]: value } : item),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'site', value: settings }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500';
  const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">Configuración del Sitio</h1>
        <p className="text-slate-500 text-sm mt-1">Navbar y Footer</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('navbar')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'navbar' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          🎨 Navbar
        </button>
        <button onClick={() => setTab('footer')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'footer' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          🦶 Footer
        </button>
      </div>

      {/* NAVBAR */}
      {tab === 'navbar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Apariencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Color de Fondo</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.navbar.backgroundColor} onChange={e => updateNavbar('backgroundColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.navbar.backgroundColor} onChange={e => updateNavbar('backgroundColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Color de Texto</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.navbar.textColor} onChange={e => updateNavbar('textColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.navbar.textColor} onChange={e => updateNavbar('textColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Logo URL</label>
                <input value={settings.navbar.logo} onChange={e => updateNavbar('logo', e.target.value)} placeholder="/uploads/logo.png" className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Ancho del Logo</label>
                <input value={settings.navbar.logoWidth} onChange={e => updateNavbar('logoWidth', e.target.value)} placeholder="150px" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Enlace del Logo</label>
                <input value={settings.navbar.logoLink} onChange={e => updateNavbar('logoLink', e.target.value)} placeholder="/" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Padding Vertical (Tailwind)</label>
                <input value={settings.navbar.paddingVertical} onChange={e => updateNavbar('paddingVertical', e.target.value)} placeholder="py-3" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.navbar.isSticky} onChange={e => updateNavbar('isSticky', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Sticky (fijo al hacer scroll)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.navbar.hasShadow} onChange={e => updateNavbar('hasShadow', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Sombra</span>
              </label>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Items del Menú</h3>
              <button onClick={addMenuItem} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">+ Añadir</button>
            </div>
            {settings.navbar.menuItems.length === 0 && <p className="text-sm text-slate-400">No hay items de menú.</p>}
            {settings.navbar.menuItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <label className={labelCls}>Texto</label>
                  <input value={item.customText} onChange={e => updateMenuItem(i, 'customText', e.target.value)} placeholder="Inicio" className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>URL</label>
                  <input value={item.customUrl} onChange={e => updateMenuItem(i, 'customUrl', e.target.value)} placeholder="/" className={inputCls} />
                </div>
                <button onClick={() => removeMenuItem(i)} className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      {tab === 'footer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Apariencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Color de Fondo</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.footer.backgroundColor} onChange={e => updateFooter('backgroundColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.footer.backgroundColor} onChange={e => updateFooter('backgroundColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Color de Texto</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.footer.textColor} onChange={e => updateFooter('textColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input value={settings.footer.textColor} onChange={e => updateFooter('textColor', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Logo URL</label>
                <input value={settings.footer.logo} onChange={e => updateFooter('logo', e.target.value)} placeholder="/uploads/logo.png" className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Ancho del Logo</label>
                <input value={settings.footer.logoWidth} onChange={e => updateFooter('logoWidth', e.target.value)} placeholder="150px" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nombre de Empresa</label>
                <input value={settings.footer.companyName} onChange={e => updateFooter('companyName', e.target.value)} placeholder="Mi Empresa" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Texto Copyright</label>
                <input value={settings.footer.copyrightText} onChange={e => updateFooter('copyrightText', e.target.value)} placeholder="Todos los derechos reservados" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showPagesColumn} onChange={e => updateFooter('showPagesColumn', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Mostrar columna de páginas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showSocialMediaColumn} onChange={e => updateFooter('showSocialMediaColumn', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Mostrar redes sociales</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showCopyrightRow} onChange={e => updateFooter('showCopyrightRow', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Mostrar copyright</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.footer.showHorizontalLine} onChange={e => updateFooter('showHorizontalLine', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
                <span className="text-sm text-slate-600">Mostrar línea horizontal</span>
              </label>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Redes Sociales</h3>
              <button onClick={addSocialMedia} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">+ Añadir</button>
            </div>
            {settings.footer.socialMedia.length === 0 && <p className="text-sm text-slate-400">No hay redes sociales.</p>}
            {settings.footer.socialMedia.map((sm, i) => (
              <div key={i} className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <label className={labelCls}>Plataforma</label>
                  <input value={sm.platform} onChange={e => updateSocialMedia(i, 'platform', e.target.value)} placeholder="facebook" className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>URL</label>
                  <input value={sm.url} onChange={e => updateSocialMedia(i, 'url', e.target.value)} placeholder="https://facebook.com/..." className={inputCls} />
                </div>
                <button onClick={() => removeSocialMedia(i)} className="px-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 disabled:opacity-50 text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 transition-colors">
          {saving ? 'Guardando...' : '💾 Guardar Configuración'}
        </button>
        {success && <p className="mt-3 text-center text-sm text-emerald-600 font-semibold">✅ Configuración guardada correctamente</p>}
      </div>
    </div>
  );
}