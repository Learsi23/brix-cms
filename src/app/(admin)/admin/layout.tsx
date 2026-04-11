"use client";

// Admin Layout — equivalent to _ManagerLayout.cshtml in .NET
// Sidebar navigation + logout. Protected by ProtectedLayout

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedLayout from "@/components/ProtectedLayout";

const navItems = [
  { href: "/admin", label: "Pages", icon: "🌐", exact: true },
  { href: "/admin/settings", label: "Navbar & Footer", icon: "🎨" },
  { href: "/admin/media", label: "Media", icon: "🖼️" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/backup", label: "Backup", icon: "💾" },
  { href: "/admin/ai-config", label: "Configuration", icon: "⚙️" },
  { href: "/admin/ai-generator", label: "AI Generator", icon: "🤖" },
  { href: "/admin/figma", label: "Figma Import", icon: "🎨" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
            <span className="text-lg font-black tracking-tight text-white">
              ⚡ Eden CMS
            </span>
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
          </div>
        </aside>
        <main id="main-wrapper" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedLayout>
  );
}
