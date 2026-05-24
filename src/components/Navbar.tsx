"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, signout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/#home" },
    { label: "Service", href: "/#habits" },
    { label: "Contact", href: "/#bmi" },
    { label: "About", href: "/#team" },
  ];

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-lg shadow-black/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[90%] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-accent font-black text-3xl italic tracking-tight hover:scale-105 transition-transform duration-300"
        >
          Fitness
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1 rounded-full border border-white/10 p-1 glass">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-300"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                Dashboard
              </Link>
              <button
                onClick={() => signout()}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all duration-300"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50 text-white cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="text-2xl font-semibold text-white/70 hover:text-white transition-all duration-300"
            style={{
              transitionDelay: isOpen ? `${i * 75}ms` : "0ms",
              transform: isOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            {link.label}
          </Link>
        ))}

        {user ? (
          <div
            className="flex flex-col gap-4 w-[60%] items-center mt-4"
            style={{
              transitionDelay: isOpen ? `${navLinks.length * 75}ms` : "0ms",
              transform: isOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            <Link
              href={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-base font-medium bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-300"
            >
              <LayoutDashboard className="w-5 h-5 text-accent" />
              Dashboard
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signout();
              }}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-base font-medium bg-accent hover:bg-accent-hover text-white transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/auth/signin"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-[60%] px-5 py-3 rounded-full text-base font-medium bg-accent hover:bg-accent-hover text-white transition-all duration-300 mt-4"
            style={{
              transitionDelay: isOpen ? `${navLinks.length * 75}ms` : "0ms",
              transform: isOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            <User className="w-5 h-5" />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
