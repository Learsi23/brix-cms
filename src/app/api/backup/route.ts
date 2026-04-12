// /api/backup - Backup & Restore API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Export all pages with their blocks
    const pages = await prisma.page.findMany({
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      pages: pages.map((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        isPublished: page.isPublished,
        publishedAt: page.publishedAt?.toISOString() || null,
        pageType: page.pageType,
        sortOrder: page.sortOrder,
        jsonData: page.jsonData,
        blocks: page.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          sortOrder: block.sortOrder,
          jsonData: block.jsonData,
          parentId: block.parentId,
        })),
      })),
    };

    return NextResponse.json(backup, {
      headers: {
        "Content-Disposition": `attachment; filename="brix-cms-backup-${new Date().toISOString().split("T")[0]}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const replaceAll = formData.get("replaceAll") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const text = await file.text();
    let backup: {
      pages: Array<{
        id: string;
        title: string;
        slug: string;
        isPublished: boolean;
        publishedAt: string | null;
        pageType: string;
        sortOrder: number;
        jsonData: string | null;
        blocks: Array<{
          id: string;
          type: string;
          sortOrder: number;
          jsonData: string | null;
          parentId: string | null;
        }>;
      }>;
    };

    try {
      backup = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
    }

    if (!backup.pages || !Array.isArray(backup.pages)) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    if (replaceAll) {
      await prisma.block.deleteMany();
      await prisma.page.deleteMany();
    }

    let imported = 0;
    for (const page of backup.pages) {
      // Check if page with same slug exists
      const existing = await prisma.page.findUnique({
        where: { slug: page.slug },
      });

      if (existing && !replaceAll) {
        // Skip existing pages when not replacing all
        continue;
      }

      const savedPage = await prisma.page.upsert({
        where: { slug: page.slug },
        update: {
          title: page.title,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
          pageType: page.pageType,
          sortOrder: page.sortOrder,
          jsonData: page.jsonData,
        },
        create: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
          pageType: page.pageType,
          sortOrder: page.sortOrder,
          jsonData: page.jsonData,
        },
      });

      // Import blocks
      if (page.blocks && Array.isArray(page.blocks)) {
        for (const block of page.blocks) {
          await prisma.block.upsert({
            where: { id: block.id },
            update: {
              type: block.type,
              sortOrder: block.sortOrder,
              jsonData: block.jsonData,
              parentId: block.parentId,
            },
            create: {
              id: block.id,
              type: block.type,
              sortOrder: block.sortOrder,
              jsonData: block.jsonData,
              parentId: block.parentId,
              pageId: savedPage.id,
            },
          });
        }
      }

      imported++;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} page(s)`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
