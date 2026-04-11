import Link from 'next/link';
import { prisma } from '@/lib/db';

interface MenuItem {
  customText: string;
  customUrl: string;
  isCustomUrl: boolean;
  pageSlug: string;
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

export default async function DynamicNavbar() {
  let settings: NavbarSettings = {
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

  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
    if (config) {
      const parsed = JSON.parse(config.value);
      if (parsed?.navbar) {
        settings = { ...settings, ...parsed.navbar };
      }
    }
  } catch {}

  const publishedPages = await prisma.page.findMany({
    where: { isPublished: true },
    orderBy: { title: 'asc' },
    select: { title: true, slug: true },
  });

  const navClasses = [
    settings.paddingVertical || 'py-3',
    settings.isSticky ? 'sticky top-0 z-50' : '',
    settings.hasShadow ? 'shadow-md' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses} style={{ backgroundColor: settings.backgroundColor }}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href={settings.logoLink || '/'} className="flex-shrink-0">
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo} alt={settings.logoAltText} style={{ width: settings.logoWidth }} />
          ) : (
            <span className="text-xl font-bold" style={{ color: settings.textColor }}>EdenCMS</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {settings.menuItems.length > 0 ? (
            settings.menuItems.map((item, i) => {
              const url = item.isCustomUrl ? item.customUrl : (item.pageSlug ? `/${item.pageSlug}` : '#');
              return (
                <Link key={i} href={url} className="hover:opacity-75 transition-opacity" style={{ color: settings.textColor }}>
                  {item.customText || 'Link'}
                </Link>
              );
            })
          ) : (
            publishedPages.map(p => (
              <Link key={p.slug} href={`/${p.slug}`} className="hover:opacity-75 transition-opacity" style={{ color: settings.textColor }}>
                {p.title}
              </Link>
            ))
          )}

          <span className="text-gray-300" style={{ color: settings.textColor }}>|</span>

          <Link href="/cart" className="relative flex items-center hover:opacity-75 transition-opacity" style={{ color: settings.textColor }}>
            <i className="fas fa-shopping-cart text-lg" />
            <span id="cart-count" className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </Link>

          <span className="text-gray-300" style={{ color: settings.textColor }}>|</span>
          <Link href="/admin" className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded hover:bg-gray-200 no-underline">
            ⚙️ Panel
          </Link>
        </div>

        <button className="md:hidden" style={{ color: settings.textColor }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
