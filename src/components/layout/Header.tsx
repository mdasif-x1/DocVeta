import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, FileText } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'All Tools', path: '/tools' },
    { name: 'Image to PDF', path: '/image-to-pdf' },
    { name: 'Merge PDF', path: '/merge-pdf' },
    { name: 'PDF to Image', path: '/pdf-to-image' },
    { name: 'PDF to Text', path: '/pdf-to-text' },
    { name: 'Image to Text', path: '/image-to-text' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      <div className="docveta-container flex items-center justify-between h-14">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-900 group"
          aria-label="DocVeta - Home"
        >
          <div className="w-7 h-7 rounded-md bg-brand-600 text-white flex items-center justify-center shadow-2xs group-hover:bg-brand-700 transition">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-950">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Client-Side Privacy Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Runs 100% on device</span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="py-2 px-3 mb-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Files never leave your browser</span>
          </div>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                location.pathname === link.path
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
