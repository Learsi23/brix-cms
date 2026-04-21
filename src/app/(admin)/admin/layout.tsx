// Server component — runs on the server before ANY content is sent to browser.
// Reads the auth cookie and redirects to /login if missing or invalid.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('eden_auth');

  if (!token?.value) {
    redirect('/login');
  }

  // Validate the token against the database
  try {
    const user = await prisma.user.findUnique({ where: { id: token.value } });
    if (!user) redirect('/login');
  } catch {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main id="main-wrapper" className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
