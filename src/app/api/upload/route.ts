// /api/upload — multipart file upload (single or batch)
// Saves to public/uploads/{folder}/ and records in the Media table.
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const UPLOADS_DIR  = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB per file

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg':        'image',
  'image/jpg':         'image',
  'image/png':         'image',
  'image/gif':         'image',
  'image/webp':        'image',
  'image/svg+xml':     'image',
  'image/bmp':         'image',
  'image/tiff':        'image',
  'image/avif':        'image',
  'application/pdf':   'document',
  'video/mp4':         'video',
  'video/webm':        'video',
  'video/ogg':         'video',
};

// ── helpers ────────────────────────────────────────────────────────────────────

async function fileExists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

/** Returns a filename that does not already exist in `dir`. */
async function uniqueFilename(dir: string, original: string): Promise<string> {
  // Sanitise: keep letters, digits, dots, dashes, underscores
  const safe = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const ext  = path.extname(safe);
  const base = path.basename(safe, ext);

  let filename = safe;
  let counter  = 1;
  while (await fileExists(path.join(dir, filename))) {
    filename = `${base}_${counter}${ext}`;
    counter++;
  }
  return filename;
}

// ── POST /api/upload ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Accept one or more files under the field name "file"
    const rawFiles = formData.getAll('file');
    const folder   = ((formData.get('folder') as string) ?? '').replace(/^\/+|\/+$/g, '');

    if (!rawFiles.length) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    // Validate target directory (prevent path traversal)
    const targetDir = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
    if (!targetDir.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }

    await mkdir(targetDir, { recursive: true });

    const uploaded: Array<{ path: string; filename: string; size: number; type: string }> = [];
    const errors:   Array<{ name: string; error: string }> = [];

    for (const raw of rawFiles) {
      if (!(raw instanceof File)) continue;

      const file = raw as File;

      // ── MIME validation ────────────────────────────────────────────────────
      const mediaType = ALLOWED_MIME[file.type];
      if (!mediaType) {
        errors.push({ name: file.name, error: `Unsupported file type: ${file.type}` });
        continue;
      }

      // ── Size validation ────────────────────────────────────────────────────
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ name: file.name, error: `File too large (max 20 MB): ${file.name}` });
        continue;
      }

      // ── Write to disk ──────────────────────────────────────────────────────
      const filename   = await uniqueFilename(targetDir, file.name);
      const dest       = path.join(targetDir, filename);
      const buffer     = Buffer.from(await file.arrayBuffer());
      await writeFile(dest, buffer);

      const publicPath = folder
        ? `/uploads/${folder}/${filename}`
        : `/uploads/${filename}`;

      // ── Persist to DB ──────────────────────────────────────────────────────
      await prisma.media.upsert({
        where:  { path: publicPath },
        update: { size: file.size, mimeType: file.type, filename },
        create: {
          filename,
          path:     publicPath,
          folder:   folder ?? '',
          type:     mediaType,
          size:     file.size,
          mimeType: file.type,
        },
      });

      uploaded.push({ path: publicPath, filename, size: file.size, type: mediaType });
    }

    // Return 207 (Multi-Status) when there are partial failures
    const status = errors.length > 0 && uploaded.length === 0 ? 400
                 : errors.length > 0                           ? 207
                 :                                               200;

    return NextResponse.json({ success: uploaded.length > 0, files: uploaded, errors }, { status });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
