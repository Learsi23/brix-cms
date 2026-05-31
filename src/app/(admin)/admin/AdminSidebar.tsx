"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin",          label: "Pages",           icon: "fa-file-alt",   exact: true },
  { href: "/admin/media",    label: "Media",           icon: "fa-images" },
  { href: "/admin/settings", label: "Navbar & Footer", icon: "fa-paint-brush" },
  { href: "/admin/chatbot",  label: "Chatbot",         icon: "fa-robot" },
  { href: "/admin/backup",   label: "Backup",          icon: "fa-database" },
  { href: "/admin/security", label: "Security",        icon: "fa-shield-alt" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then(d => { if (d.email) setEmail(d.email); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 bg-slate-900 text-white flex-shrink-0 flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 p-1.5">
            <svg viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="13" height="9" rx="2" fill="#22c55e"/>
              <rect x="15" width="13" height="9" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect y="13" width="8" height="9" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="10" y="13" width="18" height="9" rx="2" fill="#22c55e"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-sm leading-none">
              <span className="text-white">BRIX</span>
              <span style={{ color: '#22c55e' }}>cms</span>
            </p>
            {email && (
              <p className="text-slate-500 text-[9px] mt-0.5 truncate max-w-[120px]">{email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive(item.href, item.exact)
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <i className={`fas ${item.icon} text-xs w-4 text-center`}></i>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <i className="fas fa-sign-out-alt text-xs w-4 text-center"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}
