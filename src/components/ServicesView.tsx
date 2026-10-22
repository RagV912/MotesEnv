import React from 'react';
import { Settings, RefreshCw, Zap, Wrench, Droplet, FileText, ExternalLink, ChevronRight } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const serviceLines = [
    {
      icon: <Settings className="h-6 w-6 text-emerald-600 shrink-0" />,
      title: "Turnkey EPC Designing & Installations",
      desc: "Comprehensive civil, mechanical, piping, electrical, and automation engineering for wastewater and water treatment plants from ground zero. Includes sizing calculations, process flows, structural design, and field instruments integration."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-emerald-600 shrink-0" />,
      title: "Plant Revamping & Modernization",
      desc: "Converting underperforming, legacy wastewater facilities into automated, highly efficient systems. Specializing in upgrading Activated Sludge (ASP) setups to Membrane Bioreactors (MBR) or Moving Bed Biofilm Reactors (MBBR) to double capacities without expanding layout footprint."
    },
    {
      icon: <Zap className="h-6 w-6 text-emerald-600 shrink-0" />,
      title: "Process Troubleshooting & Toxic Shock Recovery",
      desc: "Deployment of environmental specialist engineers to analyze sludge bulking, active biomass death, aeration malfunctions, and toxic process shocks. We rapidly restore biochemical equilibria, optimize dissolved oxygen (DO) profiles, and ensure compliance."
    },
    {
      icon: <Wrench className="h-6 w-6 text-emerald-600 shrink-0" />,
      title: "Comprehensive Operation & Maintenance (O&M)",
      desc: "Full-ownership operation of large municipal and industrial installations. Providing skilled operators, chemical supply chains, predictive equipment maintenance, water analysis logs, and strict adherence to safety standards."
    }
  ];

  const technologies = [
    {
      name: "SBR (Sequencing Batch Reactor)",
      scale: "Municipal Scale (up to 245+ MLD)",
      desc: "A fill-and-draw biological wastewater treatment process where aeration, sedimentation, and clarification occur sequentially in a single reactor. Extremely robust, offering highly flexible cycle configurations and automatic nitrogen/phosphorus removal.",
      dataUrl: "https://www.epa.gov/sites/default/files/2015-06/documents/sbr.pdf",
      dataLabel: "EPA Technical Fact Sheet: Sequencing Batch Reactors (SBR)"
    },
    {
      name: "MBR (Membrane Bioreactor)",
      scale: "High-Purity Industrial & Commercial (40 KLD - 10 MLD)",
      desc: "Combines classic suspended-growth activated sludge treatment with high-efficiency microfiltration or ultrafiltration membrane separation. Eliminates the need for secondary clarifiers, producing exceptional, virus-free effluent ideal for direct recycling.",
      dataUrl: "https://www.sciencedirect.com/topics/engineering/membrane-bioreactor-process",
      dataLabel: "ScienceDirect: Membrane Bioreactor Engineering Overview"
    },
    {
      name: "MBBR (Moving Bed Biofilm Reactor)",
      scale: "Biological Retrofits & Extensions",
      desc: "Utilizes specialized floating plastic bio-media carriers inside the aeration tank. The bacteria grow as a thin, highly resilient biofilm on these carriers, significantly increasing the active biological surface area and treatment density within existing tank volumes.",
      dataUrl: "https://www.unep.org/resources/report/moving-bed-biofilm-reactor-mbbr-technology",
      dataLabel: "UNEP Resource: Moving Bed Biofilm Reactor (MBBR) Guidelines"
    },
    {
      name: "ASP (Activated Sludge Process)",
      scale: "Classic Municipal Treatment",
      desc: "The foundational biological wastewater remediation method using air (or oxygen) and active biological floc (sludge) to decompose organic pollutants. We optimize existing ASP plants through fine-bubble diffuser retrofits, automated return activated sludge (RAS) controls, and desludging.",
      dataUrl: "https://www.britannica.com/technology/activated-sludge-process",
      dataLabel: "Encyclopedia Britannica: Activated Sludge Process Parameters"
    }
  ];

  return (
    <div className="animate-fade-in py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Solutions Portfolio</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Services & Engineered Technologies
          </h2>
          <div className="h-1.5 w-16 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Deep dive into our engineering capabilities, service parameters, and standard biological treatment models. Supported by regulatory and scientific data references.
          </p>
        </div>

        {/* Part 1: Service Lines */}
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold text-slate-950 flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            Turnkey Engineering Disciplines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceLines.map((line, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-150 p-6 flex gap-4 items-start shadow-sm hover:border-emerald-500/25 transition-all">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  {line.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-900 text-base">
                    {line.title}
                  </h4>
                  <p className="text-sm text-slate-650 leading-relaxed">
                    {line.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Technologies Deep Dive */}
        <div className="space-y-8">
          <div className="border-t border-slate-200 pt-12">
            <h3 className="font-display text-xl font-bold text-slate-950 flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              Core Wastewater Treatment Technologies
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              We engineer, construct, and operate plants leveraging the following standard mechanical & biological models optimized for high efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {technologies.map((tech, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-display text-xl font-extrabold text-emerald-700 uppercase tracking-tight">
                      {tech.name}
                    </h4>
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-bold px-2.5 py-1 rounded">
                      {tech.scale}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {tech.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
