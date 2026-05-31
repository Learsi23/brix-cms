export interface PageNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export function getFullPath(page: PageNode, byId: Map<string, PageNode>): string {
  const parts: string[] = [];
  let cur: PageNode | undefined = page;
  for (let i = 0; i < 8 && cur; i++) {
    if (cur.slug) parts.unshift(cur.slug);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return parts.length === 0 ? '/' : '/' + parts.join('/');
}

export interface RenderedEntry {
  url: string;
  text: string;
  children: { url: string; text: string }[];
}

interface MenuItem {
  customText?: string;
  customUrl?: string;
  isCustomUrl?: boolean;
  pageSlug?: string;
}

export function buildMenuEntries(
  configuredItems: MenuItem[],
  pages: PageNode[],
): RenderedEntry[] {
  const byId = new Map(pages.map(p => [p.id, p]));
  const slugToPage = new Map<string, PageNode>();
  for (const p of pages) {
    if (p.slug) {
      const key = p.slug.toLowerCase();
      if (!slugToPage.has(key)) slugToPage.set(key, p);
    }
  }
  const childrenByParent = new Map<string, PageNode[]>();
  for (const p of pages) {
    if (p.parentId) {
      const arr = childrenByParent.get(p.parentId) ?? [];
      arr.push(p);
      childrenByParent.set(p.parentId, arr);
    }
  }
  for (const arr of childrenByParent.values()) arr.sort((a, b) => a.sortOrder - b.sortOrder);

  const childEntries = (parent: PageNode) =>
    (childrenByParent.get(parent.id) ?? []).map(c => ({
      url: getFullPath(c, byId),
      text: c.title,
    }));

  const out: RenderedEntry[] = [];

  if (configuredItems.length > 0) {
    const handledSlugs = new Set<string>();
    for (const item of configuredItems) {
      let url: string;
      let matched: PageNode | undefined;
      let itemSlug: string | undefined;
      if (item.isCustomUrl) {
        const u = (item.customUrl ?? '').trim();
        if (!u || u === '#' || u.startsWith('#') || u.endsWith('.html')) continue;
        url = u;
        const slugFromUrl = u.replace(/^\//, '').split('/')[0].split('?')[0].split('#')[0];
        if (slugFromUrl) itemSlug = slugFromUrl.toLowerCase();
      } else if (item.pageSlug) {
        itemSlug = item.pageSlug.toLowerCase();
        matched = slugToPage.get(itemSlug);
        if (!matched) continue;
        url = getFullPath(matched, byId);
      } else {
        url = '/';
      }
      if (itemSlug) handledSlugs.add(itemSlug);
      const text = item.customText?.trim() || matched?.title || 'Link';
      out.push({ url, text, children: matched ? childEntries(matched) : [] });
    }
    const top = pages.filter(p => !p.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    for (const p of top) {
      if (handledSlugs.has(p.slug.toLowerCase())) continue;
      out.push({
        url: getFullPath(p, byId),
        text: p.title,
        children: childEntries(p),
      });
    }
  } else {
    const top = pages.filter(p => !p.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    for (const p of top) {
      out.push({
        url: getFullPath(p, byId),
        text: p.title,
        children: childEntries(p),
      });
    }
  }

  return out;
}
