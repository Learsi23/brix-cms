import Link from 'next/link';
import { prisma } from '@/lib/db';
import { buildMenuEntries } from '@/lib/utils/pageTree';
import type { PageNode } from '@/lib/utils/pageTree';

interface MenuItem {
  customText?: string;
  customUrl?: string;
  isCustomUrl?: boolean;
  pageSlug?: string;
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

const DEFAULTS: FooterSettings = {
  backgroundColor: '#1a1a1a',
  textColor: '#ffffff',
  logo: '',
  logoAltText: 'Logo',
  logoWidth: '150px',
  logoPosition: 'left',
  showPagesColumn: true,
  pagesColumnTitle: 'P\u00e1ginas',
  pages: [],
  showSocialMediaColumn: true,
  socialMediaColumnTitle: 'S\u00edguenos',
  socialMedia: [],
  showCopyrightRow: true,
  companyName: '',
  companyNumber: '',
  copyrightText: 'Todos los derechos reservados',
  showHorizontalLine: true,
  paddingVertical: 'py-6',
  columnsGap: 'gap-8',
};

export default async function DynamicFooter() {
  let settings: FooterSettings = { ...DEFAULTS };

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

  const publishedPages: PageNode[] = await prisma.page.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, slug: true, parentId: true, sortOrder: true, isPublished: true },
  });

  const footerEntries = buildMenuEntries(settings.pages ?? [], publishedPages);

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

          {settings.logo && (
            <div className={settings.logoPosition === 'center' ? 'text-center' : settings.logoPosition === 'right' ? 'text-right' : 'text-left'}>
              <img src={settings.logo} alt={settings.logoAltText} style={{ width: settings.logoWidth }} className="inline-block mb-4" />
            </div>
          )}

          {settings.showPagesColumn && (
            <div className="text-center md:text-left">
              <h4 className="font-bold mb-4">{settings.pagesColumnTitle}</h4>
              <ul className="space-y-2">
                {footerEntries.length > 0 ? (
                  footerEntries.map((entry, i) => (
                    <li key={i}>
                      <Link href={entry.url} className="hover:opacity-75 transition-opacity">{entry.text}</Link>
                      {entry.children.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-1 border-l border-gray-600 pl-3">
                          {entry.children.map((c, j) => (
                            <li key={j}>
                              <Link href={c.url} className="hover:opacity-75 transition-opacity text-sm opacity-80">
                                — {c.text}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-sm opacity-60">No pages configured</li>
                )}
              </ul>
            </div>
          )}

          {settings.showSocialMediaColumn && settings.socialMedia.length > 0 && (
            <div className="text-center md:text-left">
              <h4 className="font-bold mb-4">{settings.socialMediaColumnTitle}</h4>
              <div className="flex justify-center md:justify-start space-x-4">
                {settings.socialMedia.map((social, i) => {
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

        {settings.showCopyrightRow && (
          <div className="text-center text-sm opacity-75">
            <p>&copy; {currentYear} {settings.companyName}. {settings.copyrightText}</p>
            <div className="mt-2 text-xs opacity-50">
              <a href="https://brix-cms.com" target="_blank" rel="noopener noreferrer">Powered by BrixCMS</a>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
