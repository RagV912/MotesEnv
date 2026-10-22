import React from 'react';
import { Droplet, Award, FileText, Landmark, ShieldCheck, Mail, Phone, ChevronRight } from 'lucide-react';
import { LogoIcon } from './LogoIcon';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const handleNav = (hash: string) => {
    window.location.hash = hash;
    setCurrentPage(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t-4 border-emerald-700">
      {/* Upper Footer: Quick Links & Stat Brief */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Col 1: Brand & Core Values */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-9 w-9" />
            <span className="font-display text-lg font-extrabold text-white tracking-tight uppercase">
              Motes Envirotech
            </span>
          </div>
          <p className="text-sm text-slate-350 leading-relaxed">
            Premier Indian environmental engineering firm delivering customized water and wastewater treatment systems. Operating at municipal and industrial scales up to 245 MLD.
          </p>
          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs sm:text-sm font-mono text-slate-500">
            <div>Proprietorship registered in New Delhi.</div>
            <div>MP PWD Reg ID: PWD210050627</div>
          </div>
        </div>

        {/* Col 2: Navigation Pages */}
        <div className="space-y-4">
          <h4 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Company Pages
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => handleNav('home')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Home Dashboard</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('about')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>About & Leadership</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('services')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Services & Technology</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('projects')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Work Experience Logs</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('commercial')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Statutory & Commercials</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('inquiries')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left py-1 text-emerald-400 font-bold">
                <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Technical Inquiry Desk</span>
              </button>
            </li>
            <li className="pt-2 border-t border-slate-800/40">
              <button onClick={() => handleNav('admin')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left text-slate-500 hover:text-amber-300 font-mono text-xs uppercase font-bold tracking-wider py-1">
                <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Admin Control Console</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Stat Indicators & Certifications */}
        <div className="space-y-4">
          <h4 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Certifications & Trust
          </h4>
          <div className="space-y-3.5 text-sm text-slate-350">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-200">ISO 9001:2015 Registered</span>
                <span className="text-xs text-slate-500">Quality Management Systems (QMS)</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Award className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-200">ISO 14001:2015 Registered</span>
                <span className="text-xs text-slate-500">Environmental Management (EMS)</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Landmark className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-200">ISO 45001:2018 Registered</span>
                <span className="text-xs text-slate-500">Occupational Health & Safety (OHSMS)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 4: Corporate Footprint */}
        <div className="space-y-4">
          <h4 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Active Territories
          </h4>
          <p className="text-sm text-slate-350 leading-relaxed">
            Engineering projects running across India in New Delhi, Haryana, Uttar Pradesh, Madhya Pradesh, Gujarat, Rajasthan, and overseas in the Philippines.
          </p>
          <div className="pt-2">
            <span className="block text-xs font-mono uppercase text-emerald-400 font-bold">GSTIN Delhi:</span>
            <span className="text-sm font-mono text-slate-300">07AKGPA8861K2ZV</span>
          </div>
          <div>
            <span className="block text-xs font-mono uppercase text-emerald-400 font-bold">GSTIN MP:</span>
            <span className="text-sm font-mono text-slate-300">23AKGPA8861K1Z2</span>
          </div>
        </div>

      </div>

      {/* Bottom Legal bar */}
      <div className="bg-slate-950 py-6 px-4 border-t border-slate-800/50 text-center text-sm font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} Motes Envirotech. All Rights Reserved.
          </div>
          <div className="flex gap-4">
            <a href="https://udyamregistration.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              MSME: UDYAM-DL-08-0035149
            </a>
            <span>•</span>
            <span className="text-slate-500">Proprietor: Aditya Narayan Asthana</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
