import React from 'react';
import { Droplet, Award, ShieldCheck, CheckCircle2, TrendingUp, HelpCircle, ArrowUpRight, ArrowRight } from 'lucide-react';
import { InteractiveWaterBackground } from './InteractiveWaterBackground';
import { motion } from 'motion/react';

interface HomeViewProps {
  setCurrentPage: (page: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setCurrentPage }) => {
  const handleNav = (hash: string) => {
    window.location.hash = hash;
    setCurrentPage(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const keyStats = [
    { value: '32+', label: 'Engineering Work Orders', desc: 'Successfully executed or ongoing across municipal and heavy industrial clients' },
    { value: '30+ Yrs', label: 'Leadership Expertise', desc: 'Managed by leading environmental & civil engineers with deep project exposure' },
    { value: '₹4.0 Cr+', label: 'Annual Turnover', desc: 'Robust statutory compliance and steady corporate financial parameters' },
    { value: '245 MLD', label: 'Maximum Facility Capacity', desc: 'Proven capability operating massive municipal sewage treatment setups' },
  ];

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.215, 0.61, 0.355, 1], // Smooth cubic deceleration
      }
    }
  };

  const containerStagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (idx: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: idx * 0.08,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      }
    })
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#022a36] via-[#005166] to-[#083344] text-white overflow-hidden py-24 sm:py-32">
        {/* Background abstract elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-cyan-500 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-sky-500 blur-3xl"></div>
        </div>

        {/* Interactive liquid waves and cursor-reactive ripples */}
        <InteractiveWaterBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Core Value Pitch */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerStagger}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <motion.div variants={fadeUp} className="text-cyan-200 text-sm font-semibold font-mono tracking-widest uppercase">
                Engineering Excellence Since 2016
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Custom Made Solutions for <span className="text-cyan-300">Water & Wastewater</span> treatment
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg sm:text-xl text-cyan-100/90 max-w-2xl leading-relaxed">
                Motes Envirotech is a premier Indian environmental engineering and chemical EPC company. We specialize in designing, installing, revamping, and managing water, effluent, sewage, and municipal treatment facilities across India.
              </motion.p>

              <motion.div variants={fadeUp} className="border-t border-cyan-800/40 pt-6 space-y-3">
                <p className="text-sm font-semibold font-mono uppercase tracking-wider text-cyan-400">Certified Compliance Standards:</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 text-xs sm:text-sm font-mono">
                  <span className="bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded text-cyan-200 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    ISO 9001:2015 (QMS)
                  </span>
                  <span className="bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded text-cyan-200 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    ISO 14001:2015 (EMS)
                  </span>
                  <span className="bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded text-cyan-200 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    ISO 45001:2018 (OHSMS)
                  </span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => handleNav('projects')}
                  className="px-6 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-950/20 text-center flex items-center justify-center gap-2"
                >
                  Explore 32+ Work Orders
                  <ArrowRight className="h-4 w-4 text-cyan-300" />
                </button>
                <button
                  onClick={() => handleNav('inquiries')}
                  className="px-6 py-3.5 bg-transparent border border-cyan-500/40 hover:bg-cyan-900/35 text-white font-bold rounded-xl transition-all text-center"
                >
                  Get Pre-Feasibility Call
                </button>
              </motion.div>
            </motion.div>

            {/* Right Column: Key Graphic Block */}
            <motion.div 
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
              className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <h3 className="font-display text-lg font-bold text-cyan-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Corporate Core Motto
              </h3>

              <blockquote className="italic text-lg text-slate-100 pl-4 border-l-2 border-cyan-400 leading-relaxed">
                "At Motes Envirotech, we believe that better environmental engineering decisions today will result in a sustainable tomorrow."
              </blockquote>

              <div className="space-y-3 pt-2 text-sm sm:text-base">
                <span className="block text-xs sm:text-sm font-mono text-cyan-400 uppercase tracking-wider font-bold">State Level Footprint</span>
                <p className="text-slate-200 leading-relaxed">
                  Actively engineering wastewater and chemical works across <strong className="text-white">New Delhi, Haryana, Uttar Pradesh, Madhya Pradesh, Gujarat, Rajasthan</strong>, and <strong className="text-white"> Philippines</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-950/55 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block text-xs font-mono uppercase text-slate-500">Inquiry Response Window</span>
                  <span className="font-bold text-cyan-300 text-base">Under 24 Working Hours</span>
                </div>
                <button 
                  onClick={() => handleNav('inquiries')}
                  className="p-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Fact-sheets Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-sm font-mono font-bold tracking-widest text-cyan-600 uppercase">Key Statistics</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Pioneering Water Treatment Infrastructure
            </h2>
            <div className="h-1.5 w-16 bg-cyan-600 mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyStats.map((stat, idx) => (
              <motion.div 
                key={idx} 
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={cardVariants}
                className="bg-slate-50 rounded-2xl border border-slate-150 p-6 hover:border-cyan-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm"
              >
                <span className="block font-display text-3xl font-extrabold text-cyan-600 leading-tight">
                  {stat.value}
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-2">
                  {stat.label}
                </h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quick Informational Guide */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mt-16 bg-cyan-50 rounded-2xl p-6 sm:p-10 border border-cyan-100 flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-mono font-bold uppercase text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded">
                <CheckCircle2 className="h-3 w-3 text-cyan-700" />
                Turnkey Capabilities
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Need customized design, installation, or urgent troubleshooting?
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
                We handle wastewater engineering from pre-feasibility analysis to heavy civil execution (such as OHTs, Zinc-Al tanks, pump houses) and continuous operation & maintenance (O&M) contracts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => handleNav('services')}
                className="px-5 py-3 bg-white text-cyan-800 font-bold text-sm font-mono uppercase tracking-wider rounded-xl border border-cyan-200/60 shadow-sm text-center hover:bg-slate-50 transition-all"
              >
                Services Portfolio
              </button>
              <button
                onClick={() => handleNav('inquiries')}
                className="px-5 py-3 bg-cyan-700 text-white font-bold text-sm font-mono uppercase tracking-wider rounded-xl shadow-sm text-center hover:bg-cyan-800 transition-all"
              >
                File Tech Query
              </button>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
