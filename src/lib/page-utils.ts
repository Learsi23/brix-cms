import { prisma } from '@/lib/db';

export interface PageWithParent {
  id: string;
  slug: string;
  parentId: string | null;
}

export async function getFullPath(page: PageWithParent): Promise<string> {
  const segments: string[] = [];
  let current: PageWithParent | null = page;
  let safety = 0;
  while (current && safety++ < 32) {
    if (current.slug) segments.unshift(current.slug.replace(/^\/+|\/+$/g, ''));
    if (current.parentId) {
      current = await prisma.page.findUnique({ where: { id: current.parentId }, select: { id: true, slug: true, parentId: true } });
    } else {
      current = null;
    }
  }
  return '/' + segments.join('/');
}

export async function resolvePageByPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  let parentId: string | null = null;
  let page = null;

  for (const seg of segments) {
    page = await prisma.page.findFirst({
      where: { slug: seg.toLowerCase(), parentId: parentId, isPublished: true },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!page) break;
    parentId = page.id;
  }

  if (!page && segments.length === 1) {
    const seg = segments[0].toLowerCase();
    page = await prisma.page.findFirst({
      where: { slug: seg, isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  return page;
}

export async function getChildrenByParent(): Promise<Map<string, { id: string; title: string; slug: string; parentId: string | null }[]>> {
  const allPages = await prisma.page.findMany({
    select: { id: true, title: true, slug: true, parentId: true },
    orderBy: { sortOrder: 'asc' },
  });
  const map = new Map<string, typeof allPages>();
  for (const p of allPages) {
    if (p.parentId) {
      const existing = map.get(p.parentId) || [];
      existing.push(p);
      map.set(p.parentId, existing);
    }
  }
  return map;
}
