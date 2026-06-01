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

// Adds a page link to the navbar/footer. Purely additive — it never deletes
// pages. Seed/demo pages survive until the user publishes their first real
// page (see clearSeedsOnPublish in the publish route).
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

// Removes the seed/demo navbar + footer links — the custom links without a
// pageSlug (e.g. "Features", "Pro"). Called once, when the first real page is
// published, so the demo links don't dangle to deleted pages.
export async function clearSeedNavItems() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'site' } });
  if (!config) return;

  let settings: SiteSettings;
  try { settings = JSON.parse(config.value); } catch { return; }

  if (settings.navbar?.menuItems) {
    settings.navbar.menuItems = settings.navbar.menuItems.filter(m => m.pageSlug);
  }
  if (settings.footer?.pages) {
    settings.footer.pages = settings.footer.pages.filter(m => m.pageSlug);
  }

  await prisma.siteConfig.update({ where: { key: 'site' }, data: { value: JSON.stringify(settings) } });
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
