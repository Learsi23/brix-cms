"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedLayout from "@/components/ProtectedLayout";
import Image from "next/image";

const navItems = [
  { href: "/admin",          label: "Pages",           icon: "🌐", exact: true },
  { href: "/admin/settings", label: "Navbar & Footer", icon: "🎨" },
  { href: "/admin/media",    label: "Media",           icon: "🖼️" },
  { href: "/admin/backup",   label: "Backup",          icon: "💾" },
  { href: "/admin/account",  label: "Account",         icon: "👤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <ProtectedLayout>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-slate-900 text-white p-6 flex-shrink-0 flex flex-col">
          <div className="mb-10">
            <Image src="/LogoNavbar.png" height={120} width={120} alt="Brix CMS" />
          </div>
          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive(item.href, item.exact)
                        ? "bg-emerald-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="pt-6 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>🚪</span>
              Logout
            </button>
            <a
              href="https://edencms.io"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Powered by <span className="font-bold text-slate-500">BrixCMS</span>
            </a>
          </div>
        </aside>
        <main id="main-wrapper" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedLayout>
  );
}
