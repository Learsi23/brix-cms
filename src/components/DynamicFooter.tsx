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
    pagesColumnTitle: 'Páginas',
    pages: [],
    showSocialMediaColumn: true,
    socialMediaColumnTitle: 'Síguenos',
    socialMedia: [],
    showCopyrightRow: true,
    companyName: '',
    companyNumber: '',
    copyrightText: 'Todos los derechos reservados',
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
  } catch {}

  const publishedPages = await prisma.page.findMany({
    where: { isPublished: true },
    orderBy: { title: 'asc' },
    select: { title: true, slug: true },
  });

  let columns = 0;
  if (settings.logo) columns++;
  if (settings.showPagesColumn) columns++;
  if (settings.showSocialMediaColumn && settings.socialMedia.length > 0) columns++;

  const gridClass = columns === 1 ? 'grid-cols-1' :
    columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
    'grid-cols-1 md:grid-cols-3';

  const logoPositionClass = settings.logoPosition === 'center' ? 'text-center' :
    settings.logoPosition === 'right' ? 'text-right' : 'text-left';

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
      pinterest: 'fab fa-pinterest',
      snapchat: 'fab fa-snapchat',
      reddit: 'fab fa-reddit',
      discord: 'fab fa-discord',
      telegram: 'fab fa-telegram',
    };
    return iconMap[platform?.toLowerCase()] || 'fas fa-link';
  };

  const currentYear = new Date().getFullYear().toString();

  return (
    <footer className={settings.paddingVertical} style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="container mx-auto px-4">
        <div className={`grid ${gridClass} ${settings.columnsGap || 'gap-8'} mb-8 justify-items-center text-center`}>
          {settings.logo && (
            <div className={logoPositionClass}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logo} alt={settings.logoAltText} style={{ width: settings.logoWidth }} className="mb-4" />
            </div>
          )}

          {settings.showPagesColumn && (
            <div>
              <h4 className="font-bold mb-4">{settings.pagesColumnTitle}</h4>
              <ul className="space-y-2">
                {settings.pages.length > 0 ? (
                  settings.pages.map((item, i) => {
                    const url = item.isCustomUrl ? item.customUrl : (item.pageSlug ? `/${item.pageSlug}` : '#');
                    return (
                      <li key={i}>
                        <Link href={url} className="hover:opacity-75 transition-opacity">{item.customText || 'Link'}</Link>
                      </li>
                    );
                  })
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

          {settings.showSocialMediaColumn && settings.socialMedia.length > 0 && (
            <div>
              <h4 className="font-bold mb-4">{settings.socialMediaColumnTitle}</h4>
              <div className="flex space-x-4">
                {settings.socialMedia.map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                    {social.iconType === 'class' && social.iconClass ? (
                      <i className={`${social.iconClass} text-xl`} />
                    ) : social.iconClass ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={social.iconClass} alt={social.platform} className="w-6 h-6" />
                    ) : (
                      <i className={`${getSocialIcon(social.platform)} text-xl`} />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {settings.showHorizontalLine && (
          <hr className="my-6" style={{ borderColor: settings.textColor, opacity: 0.3 }} />
        )}

        {settings.showCopyrightRow && (
          <div className="text-center text-sm opacity-75">
            <p>
              © {currentYear} {settings.companyName}
              {settings.companyNumber && <span> | {settings.companyNumber}</span>}
              {settings.copyrightText && `. ${settings.copyrightText}`}.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
