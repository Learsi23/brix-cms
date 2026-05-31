// Ruta catch-all del frontend — equivalente a CmsController.cs en .NET
// Resuelve el slug por segmentos para soportar subpages: /parent/child/grandchild
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { BlockData } from '@/lib/blocks/types';
import { resolvePageByPath } from '@/lib/page-utils';

export default async function CmsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: slugParts = [] } = await params;

  if (slugParts[0] === 'admin') return notFound();

  const joined = slugParts.join('/');
  let page: Awaited<ReturnType<typeof resolvePageByPath>>;

  if (joined === '') {
    page = await prisma.page.findFirst({
      where: {
        OR: [{ slug: '' }, { slug: 'home' }, { slug: 'inicio' }],
        parentId: null,
        isPublished: true,
      },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!page) {
      page = await prisma.page.findFirst({
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        include: { blocks: { orderBy: { sortOrder: 'asc' } } },
      });
    }
  } else {
    page = await resolvePageByPath(joined);
  }

  if (!page) return notFound();

//organize blocks into tree structure
  const rootBlocks = page.blocks.filter(b => !b.parentId);
  const childrenByParent = page.blocks
    .filter(b => b.parentId)
    .reduce<Record<string, typeof page.blocks>>((acc, b) => {
      if (!acc[b.parentId!]) acc[b.parentId!] = [];
      acc[b.parentId!].push(b);
      return acc;
    }, {});

  const pageSettings = page.jsonData ? JSON.parse(page.jsonData) : {};
  const bgColor = pageSettings.BackgroundColor?.Value ?? '#ffffff';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {rootBlocks.map(block => {
        const data: BlockData = block.jsonData ? JSON.parse(block.jsonData) : {};
        const children = childrenByParent[block.id] ?? [];
        return (
          <div key={block.id}>
            <BlockRenderer
              type={block.type}
              data={data}
              blocks={children.map(c => ({
                id: c.id,
                type: c.type,
                jsonData: c.jsonData,
              }))}
            />
          </div>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: slugParts = [] } = await params;
  const joined = slugParts.join('/');

  let page;
  if (joined === '') {
    page = await prisma.page.findFirst({
      where: { OR: [{ slug: '' }, { slug: 'home' }, { slug: 'inicio' }], parentId: null, isPublished: true },
      select: { title: true, description: true, ogImage: true },
    });
  } else {
    page = await resolvePageByPath(joined);
    if (page) {
      page = await prisma.page.findUnique({
        where: { id: page.id },
        select: { title: true, description: true, ogImage: true },
      });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brix-cms.com';
  const pageUrl = joined ? `${baseUrl}/${joined}` : baseUrl;

  return {
    title: page?.title || 'Brix',
    description: page?.description || '',
    openGraph: {
      title: page?.title || 'Brix',
      description: page?.description || '',
      url: pageUrl,
      siteName: 'Brix',
      type: 'website',
      images: page?.ogImage ? [{ url: page.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: page?.title || 'Brix',
      description: page?.description || '',
      images: page?.ogImage ? [page.ogImage] : [],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}
