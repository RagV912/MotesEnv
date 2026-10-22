import React, { useState } from 'react';
import { COMMERCIAL_DATA } from '../data';
import { Landmark, FileCheck, MapPin, ExternalLink, ShieldCheck, Mail, Phone, ChevronRight } from 'lucide-react';

export const CommercialView: React.FC = () => {
  const [activeMapTab, setActiveMapTab] = useState<number>(0);

  const statutoryItems = [
    { label: "Proprietor Name", val: COMMERCIAL_DATA.proprietor },
    { label: "Entity Category", val: COMMERCIAL_DATA.type },
    { label: "MSME Registration", val: COMMERCIAL_DATA.msme },
    { label: "GSTIN New Delhi", val: COMMERCIAL_DATA.gstinDelhi },
    { label: "GSTIN Madhya Pradesh", val: COMMERCIAL_DATA.gstinMP },
    { label: "Permanent Account No. (PAN)", val: COMMERCIAL_DATA.pan },
    { label: "EPFO Establishment Code", val: COMMERCIAL_DATA.epfo },
    { label: "ESIC Establishment Code", val: COMMERCIAL_DATA.esic },
    { label: "MP PWD Contractor Reg.", val: COMMERCIAL_DATA.pwdReg },
  ];

  return (
    <div className="animate-fade-in py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Commercial & Financials</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Statutory Credentials & Offices
          </h2>
          <div className="h-1.5 w-16 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Authorized statutory codes, banking details, and interactive Google Maps office coordinate references for physical and corporate offices.
          </p>
        </div>

        {/* Upper Layout: statutory numbers and bank coordinates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Block: Statutory credentials table */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Statutory Registrations
            </h3>

            <div className="divide-y divide-slate-100">
              {statutoryItems.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4 text-sm">
                  <div className="space-y-0.5">
                    <span className="block text-slate-400 font-bold uppercase tracking-wider text-xs">{item.label}</span>
                    <span className="block font-mono font-bold text-slate-900 text-base">{item.val}</span>
                  </div>
                  
                  {/* Verified Indicator instead of external link */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Registered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Bank Coordinates & Compliance Stamp */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* ICICI Banking Details */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Landmark className="h-40 w-40" />
              </div>

              <div className="space-y-1 relative z-10">
                <span className="inline-block px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                  Official Account
                </span>
                <h3 className="font-display text-xl font-bold text-white pt-2 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-400" />
                  Banking Coordinates
                </h3>
              </div>

              <div className="space-y-4 text-sm relative z-10">
                <div className="border-b border-slate-800 pb-3">
                  <span className="block text-xs font-mono uppercase text-slate-500">Beneficiary Bank</span>
                  <span className="block font-bold text-slate-100 text-base">{COMMERCIAL_DATA.bank.name}</span>
                </div>

                <div className="border-b border-slate-800 pb-3">
                  <span className="block text-xs font-mono uppercase text-slate-500">IFSC Routing Code</span>
                  <span className="block font-mono font-bold text-emerald-400 text-base">{COMMERCIAL_DATA.bank.ifsc}</span>
                </div>

                <div className="border-b border-slate-800 pb-3">
                  <span className="block text-xs font-mono uppercase text-slate-500">Current Account Number</span>
                  <span className="block font-mono font-bold text-slate-100 text-base tracking-wide">{COMMERCIAL_DATA.bank.account}</span>
                </div>

                <div>
                  <span className="block text-xs font-mono uppercase text-slate-500">Indore Regional Branch Address</span>
                  <span className="block text-slate-300 leading-relaxed text-sm font-semibold">{COMMERCIAL_DATA.bank.branch}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-500 leading-normal">
                Strict financial transparency. Double-signed authorization applied to all outward RTGS / NEFT vendor transfers.
              </div>
            </div>

            {/* Turnover Stamp */}
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-xs font-mono uppercase text-slate-400">Audited Financial Turnover</span>
                <span className="block font-display text-2xl font-extrabold text-emerald-700">₹ 4.0 Crore+ Annual</span>
              </div>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold px-2.5 py-1 rounded">
                Verified audited books
              </span>
            </div>

          </div>
        </div>

        {/* Lower Layout: Google Maps Location Tabs (滿足 use google map locations 需求) */}
        <div className="border-t border-slate-200 pt-12 space-y-8">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Office Locations</span>
            <h3 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Interactive Google Maps Portals
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Pan, zoom, and fetch satellite directional routes to our physical registered and branch office hubs in real-time.
            </p>
          </div>

          {/* Double Location Tab triggers */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white border border-slate-150 p-1.5 rounded-2xl gap-2 shadow-sm">
              {COMMERCIAL_DATA.offices.map((off, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMapTab(idx)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeMapTab === idx
                      ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {off.type}
                </button>
              ))}
            </div>
          </div>

          {/* Active map display panel */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Map Info details */}
              <div className="lg:col-span-4 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-mono uppercase text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/50 px-2 py-1 rounded w-fit">
                    {COMMERCIAL_DATA.offices[activeMapTab].type}
                  </span>
                  <h4 className="font-display text-xl font-bold text-slate-900 pt-2 flex items-center gap-1.5">
                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
                    Office Coordinates
                  </h4>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold">
                  {COMMERCIAL_DATA.offices[activeMapTab].address}
                </p>

                <div className="space-y-2 text-sm border-t border-slate-100 pt-4 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-semibold text-slate-700">{COMMERCIAL_DATA.offices[activeMapTab].gps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Corporate Phone:</span>
                    <span className="font-semibold text-slate-700">{COMMERCIAL_DATA.offices[activeMapTab].tel}</span>
                  </div>
                </div>

                <a
                  href={COMMERCIAL_DATA.offices[activeMapTab].directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-slate-900 hover:bg-slate-950 text-white text-sm font-mono font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  Fetch Google Maps Directions
                </a>
              </div>

              {/* Real interactive Google Map iframe */}
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-slate-150 overflow-hidden bg-slate-100 aspect-video shadow-inner relative group">
                  <iframe
                    title={`${COMMERCIAL_DATA.offices[activeMapTab].type} Location`}
                    src={COMMERCIAL_DATA.offices[activeMapTab].mapEmbedUrl}
                    className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300"
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
