// POST /api/pdf-products/upload — Upload a PDF to public/data/ for product extraction
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file received' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    await mkdir(DATA_DIR, { recursive: true });

    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const dest = path.join(DATA_DIR, safe);
    const bytes = await file.arrayBuffer();
    await writeFile(dest, Buffer.from(bytes));

    return NextResponse.json({ fileName: safe });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

// GET /api/pdf-products/upload — list PDFs in public/data/
export async function GET() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const files = existsSync(DATA_DIR)
      ? readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
      : [];
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

// DELETE /api/pdf-products/upload?file=name.pdf
export async function DELETE(req: NextRequest) {
  try {
    const fileName = req.nextUrl.searchParams.get('file');
    if (!fileName) return NextResponse.json({ error: 'file param required' }, { status: 400 });

    const safe = path.basename(fileName); // prevent path traversal
    const target = path.join(DATA_DIR, safe);
    if (!existsSync(target)) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const { unlink } = await import('fs/promises');
    await unlink(target);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
