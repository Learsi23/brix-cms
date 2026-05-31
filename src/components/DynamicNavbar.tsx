import Link from 'next/link';
import { prisma } from '@/lib/db';
import { buildMenuEntries, getFullPath } from '@/lib/utils/pageTree';
import type { PageNode } from '@/lib/utils/pageTree';
import MobileNavMenu from '@/components/MobileNavMenu';
import type { FlatEntry } from '@/components/MobileNavMenu';

interface MenuItem {
  customText?: string;
  customUrl?: string;
  isCustomUrl?: boolean;
  pageSlug?: string;
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

const DEFAULTS: NavbarSettings = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  logo: '',
  logoAltText: 'Logo',
  logoWidth: '150px',
  logoLink: '/',
  isSticky: true,
  hasShadow: true,
  paddingVertical: 'py-3',
  menuItems: [],
};

export default async function DynamicNavbar() {
  let settings: NavbarSettings = { ...DEFAULTS };

  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
    if (config) {
      const parsed = JSON.parse(config.value);
      if (parsed?.navbar) {
        settings = { ...settings, ...parsed.navbar };
      }
    }
  } catch {}

  const publishedPages: PageNode[] = await prisma.page.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, slug: true, parentId: true, sortOrder: true, isPublished: true },
  });

  const menuEntries = buildMenuEntries(settings.menuItems ?? [], publishedPages);
  const byId = new Map(publishedPages.map(p => [p.id, p]));
  const mobileEntries: FlatEntry[] = (settings.menuItems ?? []).length > 0
    ? menuEntries.flatMap(e => [{ url: e.url, text: e.text }, ...e.children.map(c => ({ url: c.url, text: c.text }))])
    : publishedPages.map(p => ({ url: getFullPath(p, byId), text: p.title }));

  const navClasses = [
    settings.paddingVertical || 'py-3',
    settings.isSticky ? 'fixed top-0 left-0 right-0 w-full z-50' : 'relative',
    settings.hasShadow ? 'shadow-md' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses} style={{ backgroundColor: settings.backgroundColor }}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href={settings.logoLink || '/'} className="flex-shrink-0">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.logoAltText} style={{ width: settings.logoWidth }} />
          ) : (
            <span className="text-xl font-bold" style={{ color: settings.textColor }}>Brix</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {menuEntries.map((entry, i) =>
            entry.children.length === 0 ? (
              <Link key={i} href={entry.url} className="hover:opacity-75 transition-opacity" style={{ color: settings.textColor }}>
                {entry.text}
              </Link>
            ) : (
              <div key={i} className="relative group">
                <Link href={entry.url} className="hover:opacity-75 transition-opacity inline-flex items-center gap-1" style={{ color: settings.textColor }}>
                  {entry.text}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {entry.children.map((c, j) => (
                    <Link key={j} href={c.url} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      {c.text}
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <MobileNavMenu entries={mobileEntries} textColor={settings.textColor} />
      </div>
    </nav>
  );
}
