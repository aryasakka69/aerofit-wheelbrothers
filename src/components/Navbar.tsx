'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wind, 
  Bike, 
  Calculator, 
  TrendingUp, 
  Lightbulb, 
  Database, 
  Camera, 
  Waves,
  Menu,
  X,
  ChevronRight,
  Activity
} from 'lucide-react';
import { getUserBikes } from '@/lib/storage';
import { UserBikeProfile } from '@/lib/types/bike';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeBike, setActiveBike] = useState<UserBikeProfile | null>(null);

  useEffect(() => {
    const bikes = getUserBikes();
    if (bikes.length > 0) {
      setActiveBike(bikes[0]);
    }
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Wind },
    { href: '/bikes', label: 'Sepeda', icon: Bike },
    { href: '/calculator', label: 'Kalkulator CdA', icon: Calculator },
    { href: '/calculator/chung', label: 'Chung Method', icon: TrendingUp },
    { href: '/recommendations', label: 'Tips & AI', icon: Lightbulb },
    { href: '/bike-fit', label: 'Bike Fitting', icon: Camera },
    { href: '/simulation', label: 'Simulasi CFD', icon: Waves },
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/admin/bikes', label: 'Admin DB', icon: Database },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <Wind className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-30 blur transition" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">Aero<span className="text-cyan-400">Fit</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Aerodynamic Drag & CdA Optimization</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Active Bike Pill & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {activeBike && (
            <Link 
              href="/bikes" 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/25 hover:border-cyan-400/50 text-xs text-slate-300 transition group"
              title="Sepeda aktif yang sedang digunakan untuk kalkulasi"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Sepeda:</span>
              <span className="font-semibold text-cyan-300 max-w-[140px] truncate">{activeBike.customName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-1">
          {activeBike && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-xs">
              <span className="text-slate-400">Sepeda Aktif: </span>
              <span className="font-semibold text-cyan-300">{activeBike.customName}</span>
            </div>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
