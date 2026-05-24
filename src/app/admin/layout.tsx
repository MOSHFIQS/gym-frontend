"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Users", href: "/admin/users", icon: UserCheck },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-neutral-950 shrink-0">
          {/* Logo */}
          <div className="h-20 border-b border-white/10 flex items-center px-6">
            <Link
              href="/"
              className="text-accent font-black text-3xl italic tracking-tight hover:scale-105 transition-transform"
            >
              Fitness
            </Link>
          </div>

          {/* Links */}
          <nav className="flex-1 py-6 px-4 space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/25"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/50 group-hover:text-white"}`} />
                    {link.label}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-white" : "text-white/40"}`} />
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile Footer */}
          <div className="border-t border-white/10 p-4 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent shrink-0 uppercase">
                {user?.email[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.email}</p>
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => signout()}
              className="p-2 text-white/50 hover:text-accent rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Mobile Navbar Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-neutral-950 flex items-center justify-between px-4 z-40">
          <Link href="/" className="text-accent font-black text-2xl italic tracking-tight">
            Fitness
          </Link>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/5 rounded-lg cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />

            <aside className="relative flex flex-col w-64 bg-neutral-950 h-full border-r border-white/10 animate-slide-right">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-lg cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-20 flex items-center px-6 border-b border-white/10">
                <span className="text-accent font-black text-2xl italic tracking-tight">
                  Fitness
                </span>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-1.5">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-lg shadow-accent/25"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/50"}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 p-4 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent shrink-0 uppercase">
                    {user?.email[0] || "A"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{user?.email}</p>
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signout()}
                  className="p-2 text-white/50 hover:text-accent rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content area */}
        <main className="flex-1 min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
