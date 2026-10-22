import React, { useState, useEffect } from 'react';
import { Droplet, Menu, X, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { LogoIcon } from './LogoIcon';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRibbonPoppedOut, setIsRibbonPoppedOut] = useState(false);
  const [phone, setPhone] = useState('+91 9667989921');
  const [email, setEmail] = useState('motesenviro@gmail.com');

  useEffect(() => {
    const savedPhone = localStorage.getItem('motes_contact_phone');
    const savedEmail = localStorage.getItem('motes_contact_email');
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
  }, [currentPage]);

  // Synchronize hash state on click or manual URL change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentPage]);

  const navItems = [
    { label: 'Home', hash: 'home' },
    { label: 'About us', hash: 'about' },
    { label: 'Services & Tech', hash: 'services' },
    { label: 'Experience Records', hash: 'projects' },
    { label: 'Commercial Credentials', hash: 'commercial' },
  ];

  const handleNavClick = (hash: string) => {
    window.location.hash = hash;
    setCurrentPage(hash);
    setIsOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Professional Compliance Ribbon (Popout Mode) */}
      <div 
        onClick={() => setIsRibbonPoppedOut(prev => !prev)}
        className={`bg-emerald-950 text-emerald-100 text-xs sm:text-sm font-mono border-b border-emerald-900/60 w-full shadow-sm transition-all duration-500 ease-in-out overflow-hidden cursor-pointer group/topbar ${
          isRibbonPoppedOut 
            ? 'max-h-[180px] md:max-h-[48px] py-2 px-4 ring-1 ring-emerald-500/30' 
            : 'max-h-[8px] hover:max-h-[180px] md:hover:max-h-[48px] py-0 hover:py-2 px-4'
        }`}
        title={isRibbonPoppedOut ? "Click to collapse ISO Compliance ribbon" : "Click or hover to pop out ISO Compliance ribbon"}
      >
        <div className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 transition-opacity duration-300 ease-in-out ${
          isRibbonPoppedOut ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/topbar:opacity-100 pointer-events-none group-hover/topbar:pointer-events-auto'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              ISO Certified EPC Company:
            </span>
            <span className="text-emerald-100">9001:2015 (QMS)</span>
            <span className="opacity-40 hidden md:inline">|</span>
            <span className="text-emerald-100">14001:2015 (EMS)</span>
            <span className="opacity-40 hidden md:inline">|</span>
            <span className="text-emerald-100">45001:2018 (OHSMS)</span>
          </div>
          
          <div className="flex items-center gap-5 font-semibold">
            <a href={`tel:${phone}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{phone}</span>
            </a>
            <span className="opacity-30">|</span>
            <a href={`mailto:${email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-gradient-to-r from-white via-[#F5FDFF]/95 to-[#D9F4FF]/90 backdrop-blur-md border-b border-slate-150 transition-all duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Logo & Brand Info */}
            <a href="#home" onClick={() => handleNavClick('home')} className="flex items-center gap-3 group focus:outline-none">
              <div className="group-hover:scale-105 transition-transform">
                <LogoIcon className="h-12 w-12" />
              </div>
              <div>
                <span className="block font-display text-xl font-extrabold text-slate-900 leading-tight tracking-tight uppercase">
                  Motes Envirotech
                </span>
                <span className="block text-[11px] font-mono tracking-widest text-emerald-600 font-bold uppercase leading-none mt-1">
                  Environmental Engineering
                </span>
              </div>
            </a>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.hash}
                  onClick={() => handleNavClick(item.hash)}
                  className={`px-4 py-2.5 rounded-lg text-[15px] font-bold transition-all duration-150 ${
                    currentPage === item.hash
                      ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <button 
                onClick={() => handleNavClick('inquiries')}
                className="ml-4 px-5 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all flex items-center gap-1.5"
              >
                Inquiry Support
              </button>
            </nav>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg animate-fade-in">
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <button
                  key={item.hash}
                  onClick={() => handleNavClick(item.hash)}
                  className={`block w-full text-left rounded-lg px-4 py-2.5 text-base font-semibold ${
                    currentPage === item.hash
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => handleNavClick('inquiries')}
                className="block w-full rounded-lg bg-emerald-700 text-white px-4 py-3 text-center text-sm font-bold uppercase tracking-wider mt-4 hover:bg-emerald-800 transition-colors"
              >
                Inquiry Desk & Tickets
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
