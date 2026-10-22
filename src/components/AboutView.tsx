import React from 'react';
import { User, Shield, Target, Award, MapPin, ChevronRight, Image as ImageIcon } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="animate-fade-in py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">About Us</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Pioneering Wastewater Treatment Professionals
          </h2>
          <div className="h-1.5 w-16 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Founded in 2016, Motes Envirotech delivers durable, compliant, and cost-effective environmental engineering solutions for industrial and government sectors.
          </p>
        </div>

        {/* Corporate History & Core Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white rounded-3xl border border-slate-150 p-8 sm:p-10 shadow-sm">
          
          {/* Left Block: History Text */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              Our Corporate Story
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              Motes Envirotech is a premier water and wastewater treatment company. We are committed to environmental stewardship, precision engineering, and the deployment of state-of-the-art waste remediation techniques. 
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              Our core competencies include turnkey EPC execution for municipal sewage, heavy industrial effluent treatment plants, safe drinking water filtration systems, and deep hydraulic desludging operations. We serve as a trusted technical advisor to government municipalities and public sector undertakings across India.
            </p>

            <h4 className="font-display text-lg font-bold text-slate-900 pt-4">Mission & Visions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block font-bold text-emerald-700 text-sm font-mono uppercase tracking-wider mb-1">Our Mission</span>
                <p className="text-sm text-slate-600 leading-relaxed">To extract clean, recycled water of maximum purity to support water conservation and ensure zero environmental discharge violations.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block font-bold text-emerald-700 text-sm font-mono uppercase tracking-wider mb-1">Our Vision</span>
                <p className="text-sm text-slate-600 leading-relaxed">To lead India's environmental sanitation expansion by implementing robust, cost-effective chemical process systems up to 300+ MLD.</p>
              </div>
            </div>
          </div>

          {/* Right Block: Core Competencies Box */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-150 p-6 space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-900">
              Our Core Strengths
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <Shield className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-950 text-base">Technical Rigor</h4>
                  <p className="text-sm text-slate-600 mt-0.5">High-end biological and mechanical process simulations beforehand.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Target className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-950 text-base">On-Schedule Delivery</h4>
                  <p className="text-sm text-slate-600 mt-0.5">Strict compliance with industrial deadlines and milestone logs.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Award className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-950 text-base">Statutory Compliant</h4>
                  <p className="text-sm text-slate-600 mt-0.5">100% compliant with EPFO, ESIC, ISO, and state PWD certifications.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <span className="text-xs sm:text-sm font-mono text-emerald-600 font-bold uppercase tracking-widest block mb-2">Our Footprint scale</span>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Our plant portfolios scale from small high-rate industrial package MBR systems (40 KLD) to mammoth municipal civil-works networks (245 MLD).
              </p>
            </div>
          </div>

        </div>

        {/* Managing Partners Leadership Section */}
        <div className="border-t border-slate-200 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Leadership Team</span>
            <h3 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Managing Partners
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Led by highly experienced environmental and structural civil engineers with over 30 years of premier domain expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chetan Verma */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm hover:border-emerald-500/20 transition-all">
              
              {/* Text Information Column */}
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="font-display text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
                    Chetan Verma
                  </h4>
                  <p className="text-sm font-mono text-emerald-600 font-bold uppercase mt-1">
                    Masters in Ecology & Environment
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-semibold">AVP & Director Operations</p>
                </div>

                <ul className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Former AVP & Director:</strong> Headed Operations & Services at Toshiba Water Solutions Pvt. Ltd., Gurugram.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>30+ Years Global Track:</strong> Directed major environmental complexes across India, Oman, UAE, and Thailand.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Heavy Industrial Partners:</strong> Engineered ETP/CETP systems for IOCL, HPCL, BPCL, ONGC, Vizag Steel, & AB Mauri.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Municipal Systems:</strong> Successfully managed large-scale wastewater setups with UPJN, BWSSB, BUDCO, & JUIDCO.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vandana Verma */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm hover:border-emerald-500/20 transition-all">
              
              {/* Text Information Column */}
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="font-display text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
                    Vandana Verma
                  </h4>
                  <p className="text-sm font-mono text-emerald-600 font-bold uppercase mt-1">
                    B.E. Civil & M.Tech Industrial Engineering
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-semibold">GM - Skeleton Consultant</p>
                </div>

                <ul className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Former GM Design:</strong> Acted as General Manager at Skeleton Consultant Pvt. Ltd., Noida.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Structural Specialization:</strong> Specialist structural design of reservoirs, PEB steel framing, & industrial Retaining Walls.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Historic Engagements:</strong> Conducted design calculations at ATV Projects, Charu Engineering, Meinhardt, & ERA Systems.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Public Statues & Monuments:</strong> Contracted for calculating stability & materials of several landmark national public monuments.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
