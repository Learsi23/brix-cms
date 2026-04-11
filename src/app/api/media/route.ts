// /api/media — gestión de carpetas y exploración de medios
// Equivalente al MediaController de .NET (Index, CreateFolder, Delete, DeleteFolder)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mkdir, readdir, rmdir, unlink, stat } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_ ]/g, '-').replace(/ /g, '-').replace(/--+/g, '-').trim();
}

// GET /api/media?folder=subfolder — explorar carpetas y archivos del filesystem
export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get('folder') || '';
  const targetDir = path.join(UPLOADS_DIR, folder);

  // Seguridad: evitar path traversal
  if (!targetDir.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
  }

  await mkdir(targetDir, { recursive: true });

  const entries = await readdir(targetDir, { withFileTypes: true });

  const folders: string[] = [];
  const files: Array<{ filename: string; path: string; size: number; type: string }> = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(entry.name);
    } else if (entry.isFile()) {
      const filePath = path.join(targetDir, entry.name);
      const fileStat = await stat(filePath);
      const ext = path.extname(entry.name).toLowerCase();
      const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      const type = imageExts.includes(ext) ? 'image' : ext === '.pdf' ? 'document' : 'file';
      const publicPath = folder ? `/uploads/${folder}/${entry.name}` : `/uploads/${entry.name}`;
      files.push({ filename: entry.name, path: publicPath, size: fileStat.size, type });
    }
  }

  folders.sort();
  files.sort((a, b) => a.filename.localeCompare(b.filename));

  // Breadcrumbs
  const breadcrumbs: Array<{ name: string; path: string }> = [];
  if (folder) {
    const parts = folder.split('/');
    let accumulated = '';
    for (const part of parts) {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      breadcrumbs.push({ name: part, path: accumulated });
    }
  }

  return NextResponse.json({ folders, files, currentFolder: folder, breadcrumbs });
}

// POST /api/media — crear carpeta o eliminar archivo/carpeta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, folder, name } = body as { action: string; folder: string; name: string };
    const currentDir = path.join(UPLOADS_DIR, folder || '');

    if (!currentDir.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
    }

    if (action === 'createFolder') {
      if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
      const sanitized = sanitizeFolderName(name);
      if (!sanitized) return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
      const newDir = path.join(currentDir, sanitized);
      await mkdir(newDir, { recursive: true });
      return NextResponse.json({ success: true, folder: sanitized });
    }

    if (action === 'deleteFile') {
      if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
      const filePath = path.join(currentDir, name);
      if (!filePath.startsWith(UPLOADS_DIR)) return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
      await unlink(filePath);
      // Also delete from DB
      const publicPath = (folder ? `/uploads/${folder}/${name}` : `/uploads/${name}`).replace(/\\/g, '/');
      await prisma.media.deleteMany({ where: { path: publicPath } });
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteFolder') {
      if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
      const folderPath = path.join(currentDir, name);
      if (!folderPath.startsWith(UPLOADS_DIR)) return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
      const entries = await readdir(folderPath);
      if (entries.length > 0) return NextResponse.json({ error: 'La carpeta no está vacía' }, { status: 400 });
      await rmdir(folderPath);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
