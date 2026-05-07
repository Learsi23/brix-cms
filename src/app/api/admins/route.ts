// /api/admins — Team management: create, list, update, delete admins
// Equivalent to AdminsController in .NET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string;
  isOwner: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

function getCurrentUserId(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('brix_auth')?.value ?? null;
}

async function isCurrentUserOwner(): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'owner';
}

// GET — List all admins (accessible to authenticated users)
export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(admins);
}

// POST — Create new admin (owner only)
export async function POST(req: NextRequest) {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await isCurrentUserOwner();
  if (!isOwner) {
    return NextResponse.json({ error: 'Only owners can create team members' }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, password, permissions } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: `An admin with email '${email}' already exists` }, { status: 409 });
  }

  const admin = await prisma.user.create({
    data: {
      email,
      name: name || email.split('@')[0],
      password,
      role: 'member',
      permissions: JSON.stringify(permissions || ['pages']),
    },
  });

  return NextResponse.json({ success: true, message: `Team member '${email}' created`, adminId: admin.id });
}

// PATCH — Edit permissions (owner only)
export async function PATCH(req: NextRequest) {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await isCurrentUserOwner();
  if (!isOwner) {
    return NextResponse.json({ error: 'Only owners can edit permissions' }, { status: 403 });
  }

  const body = await req.json();
  const { id, permissions } = body;

  const user = await prisma.user.findUnique({ where: { id: String(id) } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role === 'owner') {
    return NextResponse.json({ error: 'Cannot modify owner permissions' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: String(id) },
    data: { permissions: JSON.stringify(permissions || ['pages']) },
  });

  return NextResponse.json({ success: true, message: 'Permissions updated' });
}

// DELETE — Remove admin (owner only)
export async function DELETE(req: NextRequest) {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await isCurrentUserOwner();
  if (!isOwner) {
    return NextResponse.json({ error: 'Only owners can remove team members' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role === 'owner') {
    return NextResponse.json({ error: 'Cannot delete the owner account' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true, message: 'Team member removed' });
}