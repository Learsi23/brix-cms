// Ruta catch-all del frontend — equivalente a CmsController.cs en .NET
// Resuelve el slug → busca la página → renderiza sus bloques
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { BlockData } from '@/lib/blocks/types';

export default async function CmsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: slugParts = [] } = await params;

  // Evitar que /admin llegue aquí
  if (slugParts[0] === 'admin') return notFound();

  const slug = slugParts.length > 0 ? slugParts.join('/') : '';

  const page = await prisma.page.findFirst({
    where: {
      slug: slug || undefined,
      // Sin slug → buscar página de inicio (slug vacío o "home")
      ...(slug === '' ? { OR: [{ slug: '' }, { slug: 'home' }, { slug: 'inicio' }] } : {}),
      isPublished: true,
    },
    include: {
      blocks: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!page) return notFound();

  // Separar bloques raíz y hijos
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

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: slugParts = [] } = await params;
  const slug = slugParts.join('/');
  
  const page = await prisma.page.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, description: true, ogImage: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eden-cms.com';
  const pageUrl = slug ? `${baseUrl}/${slug}` : baseUrl;

  return {
    title: page?.title || 'Eden CMS',
    description: page?.description || '',
    openGraph: {
      title: page?.title || 'Eden CMS',
      description: page?.description || '',
      url: pageUrl,
      siteName: 'Eden CMS',
      type: 'website',
      images: page?.ogImage ? [{ url: page.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: page?.title || 'Eden CMS',
      description: page?.description || '',
      images: page?.ogImage ? [page.ogImage] : [],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}
