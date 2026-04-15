import Link from 'next/link';
import { prisma } from '@/lib/db';

interface MenuItem {
  customText: string;
  customUrl: string;
  isCustomUrl: boolean;
  pageSlug: string;
}

interface SocialMedia {
  platform: string;
  url: string;
  iconType?: string;
  iconClass: string;
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

export default async function DynamicFooter() {
  let settings: FooterSettings = {
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    logo: '',
    logoAltText: 'Logo',
    logoWidth: '150px',
    logoPosition: 'left',
    showPagesColumn: true,
    pagesColumnTitle: 'Pages',
    pages: [],
    showSocialMediaColumn: true,
    socialMediaColumnTitle: 'Follow Us',
    socialMedia: [],
    showCopyrightRow: true,
    companyName: '',
    companyNumber: '',
    copyrightText: 'All rights reserved',
    showHorizontalLine: true,
    paddingVertical: 'py-6',
    columnsGap: 'gap-8',
  };

  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
    if (config) {
      const parsed = JSON.parse(config.value);
      if (parsed?.footer) {
        settings = { ...settings, ...parsed.footer };
      }
    }
  } catch (e) {
    console.error("Error loading footer config:", e);
  }

  const publishedPages = await prisma.page.findMany({
    where: { isPublished: true },
    orderBy: { title: 'asc' },
    select: { title: true, slug: true },
  });

  const getSocialIcon = (platform: string) => {
    const iconMap: Record<string, string> = {
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      twitter: 'fab fa-x-twitter',
      x: 'fab fa-x-twitter',
      linkedin: 'fab fa-linkedin',
      youtube: 'fab fa-youtube',
      tiktok: 'fab fa-tiktok',
      whatsapp: 'fab fa-whatsapp',
      github: 'fab fa-github',
      npm: 'fab fa-npm',
    };
    return iconMap[platform?.toLowerCase()] || 'fas fa-link';
  };

  // Cálculo de columnas para el grid
  let columns = 0;
  if (settings.logo) columns++;
  if (settings.showPagesColumn) columns++;
  if (settings.showSocialMediaColumn && settings.socialMedia.length > 0) columns++;

  const gridClass = columns === 1 ? 'grid-cols-1' :
    columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
    'grid-cols-1 md:grid-cols-3';

  const currentYear = new Date().getFullYear().toString();

  return (
    <footer className={settings.paddingVertical} style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="container mx-auto px-4">
        <div className={`grid ${gridClass} ${settings.columnsGap || 'gap-8'} mb-8 items-start`}>
          
          {/* Columna 1: Logo */}
          {settings.logo && (
            <div className={settings.logoPosition === 'center' ? 'text-center' : settings.logoPosition === 'right' ? 'text-right' : 'text-left'}>
              <img src={settings.logo} alt={settings.logoAltText} style={{ width: settings.logoWidth }} className="inline-block mb-4" />
            </div>
          )}

          {/* Columna 2: Páginas */}
          {settings.showPagesColumn && (
            <div className="text-center md:text-left">
              <h4 className="font-bold mb-4">{settings.pagesColumnTitle}</h4>
              <ul className="space-y-2">
                {settings.pages.length > 0 ? (
                  settings.pages.map((item, i) => (
                    <li key={i}>
                      <Link href={item.isCustomUrl ? item.customUrl : `/${item.pageSlug}`} className="hover:opacity-75 transition-opacity">
                        {item.customText}
                      </Link>
                    </li>
                  ))
                ) : (
                  publishedPages.map(p => (
                    <li key={p.slug}>
                      <Link href={`/${p.slug}`} className="hover:opacity-75 transition-opacity">{p.title}</Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* Columna 3: Redes Sociales */}
          {settings.showSocialMediaColumn && settings.socialMedia.length > 0 && (
            <div className="text-center md:text-left">
              <h4 className="font-bold mb-4">{settings.socialMediaColumnTitle}</h4>
              <div className="flex justify-center md:justify-start space-x-4">
                {settings.socialMedia.map((social, i) => {
                  // LÓGICA CRÍTICA: Determinar si es clase o imagen
                  const isFA = social.iconType === 'class' || 
                               social.iconClass?.startsWith('fa') || 
                               !social.iconClass?.includes('/');

                  return (
                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity text-2xl">
                      {isFA ? (
                        <i className={social.iconClass || getSocialIcon(social.platform)} />
                      ) : (
                        <img src={social.iconClass} alt={social.platform} className="w-6 h-6 object-contain" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {settings.showHorizontalLine && (
          <hr className="my-6" style={{ borderColor: settings.textColor, opacity: 0.2 }} />
        )}

        <div className="text-center text-sm opacity-75">
          <p>© {currentYear} {settings.companyName}. {settings.copyrightText}</p>
          <div className="mt-2 text-xs opacity-50">
            <a href="https://brix-cms.com" target="_blank" rel="noopener noreferrer">Powered by BrixCMS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}