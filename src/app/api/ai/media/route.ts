import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

interface MediaFolder {
  name: string;
  displayName: string;
  path: string;
  fileCount: number;
  files: string[];
}

/**
 * Recursively scans a directory and returns all image file paths (public-relative).
 */
function scanImagesInDir(
  dirPath: string,
  publicPrefix: string,
  maxPreview = 5,
): { files: string[]; total: number } {
  const allFiles: string[] = [];
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
        allFiles.push(`${publicPrefix}/${entry.name}`);
      }
    }
  } catch {
    // directory unreadable
  }
  return { files: allFiles.slice(0, maxPreview), total: allFiles.length };
}

/**
 * Dynamically discovers ALL subdirectories under /public/uploads/
 * plus /public/images/, and returns them as selectable media folders.
 */
export async function GET() {
  try {
    const uploadsRoot = join(process.cwd(), "public", "uploads");
    const imagesRoot = join(process.cwd(), "public", "images");
    const result: MediaFolder[] = [];

    // ── Scan /public/uploads/ subdirectories dynamically ──────────────────
    try {
      const uploadEntries = readdirSync(uploadsRoot, { withFileTypes: true });

      for (const entry of uploadEntries) {
        if (!entry.isDirectory()) continue;

        const folderPath = join(uploadsRoot, entry.name);
        const publicPath = `/uploads/${entry.name}`;
        const { files, total } = scanImagesInDir(folderPath, publicPath, 5);

        // Give user-friendly display names
        const displayName = `📁 ${entry.name.replace(/([A-Z])/g, " $1").trim()}`;

        result.push({
          name: entry.name,
          displayName,
          path: `${publicPath}/`,
          fileCount: total,
          files,
        });
      }

      // Also include the uploads root itself (images directly in /uploads/)
      const rootImages = scanImagesInDir(uploadsRoot, "/uploads", 5);
      if (rootImages.total > 0) {
        result.unshift({
          name: "uploads",
          displayName: "📁 Uploads (raíz)",
          path: "/uploads/",
          fileCount: rootImages.total,
          files: rootImages.files,
        });
      }
    } catch {
      // /public/uploads doesn't exist yet
    }

    // ── Scan /public/images/ ───────────────────────────────────────────────
    const generalImages = scanImagesInDir(imagesRoot, "/images", 5);
    result.push({
      name: "images",
      displayName: "🖼️ Imágenes Generales",
      path: "/images/",
      fileCount: generalImages.total,
      files: generalImages.files,
    });

    // Sort: folders with images first, then empty ones
    result.sort((a, b) => b.fileCount - a.fileCount);

    return NextResponse.json({ folders: result });
  } catch (error) {
    console.error("[Media API] Error listing folders:", error);
    return NextResponse.json(
      { error: "Failed to list media folders" },
      { status: 500 },
    );
  }
}
