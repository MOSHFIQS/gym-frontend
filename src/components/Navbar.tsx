"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Service", href: "#habits" },
  { label: "Contact", href: "#bmi" },
  { label: "About", href: "#team" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <Link href="#home" className="text-accent font-black text-3xl italic tracking-tight hover:scale-105 transition-transform duration-300">
          Fitness
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1 rounded-full border border-white/10 p-1 glass">
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`block px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  i === 0
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isOpen ? "opacity-0 scale-0" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
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
            className={`text-3xl font-bold transition-all duration-300 ${
              i === 0 ? "text-accent" : "text-white/70 hover:text-white"
            }`}
            style={{
              transitionDelay: isOpen ? `${i * 100}ms` : "0ms",
              transform: isOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
