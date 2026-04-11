// POST /api/upload — subir archivo al servidor (con soporte de carpetas)
// GET  /api/upload — listar archivos con filtro de carpeta
// Equivalente al MediaController de .NET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir, readdir, rmdir, unlink, stat } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_]/g, '-').replace(/--+/g, '-').trim();
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '';

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetDir = path.join(UPLOADS_DIR, folder);
    await mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${base}-${Date.now()}${ext}`;
    const fullPath = path.join(targetDir, filename);
    await writeFile(fullPath, buffer);

    const publicPath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;
    const mimeType = file.type || 'application/octet-stream';
    const type = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : 'document';

    const media = await prisma.media.create({
      data: { filename, path: publicPath, folder, type, size: buffer.length, mimeType },
    });

    return NextResponse.json({ url: publicPath, media }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get('folder') || '';
  const where = folder ? { folder } : { folder: '' };
  const media = await prisma.media.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(media);
}
