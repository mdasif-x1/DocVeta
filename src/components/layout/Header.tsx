import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, FileText } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="docveta-container flex items-center justify-between h-16">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-slate-900 group"
          aria-label="DocVeta - Home"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">
              {APP_CONFIG.name}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-700 mt-0.5">
              Free Document Tools
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Client-Side Privacy Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Files stay on your device</span>
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
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <div className="py-2 px-3 mb-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% In-Browser. No files uploaded to servers.</span>
          </div>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-3">
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900">About</Link>
            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900">Privacy Policy</Link>
            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900">Terms</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
};
