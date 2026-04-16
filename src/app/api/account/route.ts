// /api/account — Account security: change email and password
// Equivalent to ConfiguracionController.ChangeEmail / ChangePassword in .NET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function getUserIdFromCookie(req: NextRequest): string | null {
  return req.cookies.get('brix_auth')?.value ?? null;
}

// GET — Return current user info
export async function GET(req: NextRequest) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

// PATCH — Change email or password
export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'change-email') {
    const { newEmail } = body;
    if (!newEmail) return NextResponse.json({ error: 'New email is required' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });
    return NextResponse.json({ success: true, message: 'Email updated successfully' });
  }

  if (action === 'change-password') {
    const { currentPassword, newPassword, confirmPassword } = body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    await prisma.user.update({ where: { id: userId }, data: { password: newPassword } });
    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
