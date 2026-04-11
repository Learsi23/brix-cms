// /api/ai-config — PDF Management for AI Knowledge Base
// Equivalent to ConfiguracionController.AiConfig in .NET
// Manages PDFs in /public/data/ used as AI knowledge base for ChatBlock
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readdir, stat } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

// GET — List all PDFs
export async function GET() {
  try {
    await ensureDataDir();
    const files = await readdir(DATA_DIR);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    const fileInfos = await Promise.all(
      pdfFiles.map(async (name) => {
        const filePath = path.join(DATA_DIR, name);
        const info = await stat(filePath);
        return {
          name,
          size: info.size,
          lastModified: info.mtime.toISOString(),
          formattedSize: formatSize(info.size),
        };
      })
    );

    fileInfos.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    return NextResponse.json(fileInfos);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — Upload a PDF
export async function POST(req: NextRequest) {
  try {
    await ensureDataDir();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file received' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(DATA_DIR, file.name);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: `PDF '${file.name}' uploaded successfully`,
      name: file.name,
      size: buffer.length,
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — Delete a PDF
export async function DELETE(req: NextRequest) {
  try {
    const { fileName } = await req.json();
    if (!fileName || fileName.includes('..') || fileName.includes('/')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const filePath = path.join(DATA_DIR, fileName);
    await unlink(filePath);

    return NextResponse.json({ success: true, message: `PDF '${fileName}' deleted` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
