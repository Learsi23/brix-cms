import { prisma } from '@/lib/db';

interface MenuItemConfig {
  customText?: string;
  customUrl?: string;
  isCustomUrl?: boolean;
  pageSlug?: string;
}

interface NavbarSettings {
  menuItems?: MenuItemConfig[];
}

interface FooterSettings {
  pages?: MenuItemConfig[];
}

interface SiteSettings {
  navbar?: NavbarSettings;
  footer?: FooterSettings;
}

export async function addPageToNav(title: string, slug: string, isSubpage = false) {
  if (!slug || isSubpage) return;

  const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
  let settings: SiteSettings = {};

  if (config) {
    try { settings = JSON.parse(config.value); } catch { settings = {}; }
  }

  if (!settings.navbar) settings.navbar = { menuItems: [] };
  if (!settings.footer) settings.footer = { pages: [] };
  if (!settings.navbar.menuItems) settings.navbar.menuItems = [];
  if (!settings.footer.pages) settings.footer.pages = [];

  // First real page publish: clear seed items (those without a pageSlug)
  if (!settings.navbar.menuItems.some(m => m.pageSlug)) {
    settings.navbar.menuItems = [];
    settings.footer.pages = [];
  }

  // Always delete seed pages (Features, Pro) and their subpages when a real page is created
  const seedPages = await prisma.page.findMany({
    where: { slug: { in: ['features', 'pro'] }, parentId: null },
    select: { id: true },
  });
  if (seedPages.length > 0) {
    const seedIds = seedPages.map(p => p.id);
    await prisma.page.deleteMany({ where: { parentId: { in: seedIds } } });
    await prisma.page.deleteMany({ where: { id: { in: seedIds } } });
  }

  if (!settings.navbar.menuItems.some(m => m.pageSlug === slug)) {
    settings.navbar!.menuItems!.push({ customText: title, pageSlug: slug });
  }
  if (!settings.footer.pages.some(m => m.pageSlug === slug)) {
    settings.footer!.pages!.push({ customText: title, pageSlug: slug });
  }

  if (config) {
    await prisma.siteConfig.update({ where: { key: 'site' }, data: { value: JSON.stringify(settings) } });
  } else {
    await prisma.siteConfig.create({ data: { key: 'site', value: JSON.stringify(settings) } });
  }
}

export async function removePageFromNav(slug: string) {
  if (!slug) return;

  const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
  if (!config) return;

  try {
    const settings: SiteSettings = JSON.parse(config.value);
    if (settings.navbar?.menuItems) {
      settings.navbar.menuItems = settings.navbar.menuItems.filter(m => m.pageSlug !== slug);
    }
    if (settings.footer?.pages) {
      settings.footer.pages = settings.footer.pages.filter(m => m.pageSlug !== slug);
    }
    await prisma.siteConfig.update({ where: { key: 'site' }, data: { value: JSON.stringify(settings) } });
  } catch {}
}
