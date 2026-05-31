import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = req.nextUrl.origin;
    const today = new Date().toISOString().split("T")[0];

    const allPages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { id: true, slug: true, parentId: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });

    function getFullPath(page: typeof allPages[0]): string {
      const parts: string[] = [];
      let current: typeof page | undefined = page;
      const visited = new Set<string>();
      while (current && !visited.has(current.id)) {
        visited.add(current.id);
        if (current.slug) parts.unshift(current.slug);
        current = current.parentId ? allPages.find(p => p.id === current!.parentId) : undefined;
      }
      return parts.join('/');
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    for (const page of allPages) {
      const path = getFullPath(page);
      if (!path) continue;
      const lastMod = page.updatedAt.toISOString().split("T")[0];
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${path}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error("[Sitemap] Error:", err);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}