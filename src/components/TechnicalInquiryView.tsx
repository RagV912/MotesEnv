import React, { useState, useEffect } from 'react';
import { InquiryTicket } from '../types';
import { Mail, Phone, Clock, FileText, AlertTriangle, CheckCircle2, Trash2, ShieldCheck, Landmark } from 'lucide-react';

export const TechnicalInquiryView: React.FC = () => {
  const [tickets, setTickets] = useState<InquiryTicket[]>([]);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('Turnkey EPC Design');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [corpPhone, setCorpPhone] = useState('+91 9667989921');
  const [corpEmail, setCorpEmail] = useState('motesenviro@gmail.com');

  // Load tickets on mount
  useEffect(() => {
    const saved = localStorage.getItem('motes_inquiry_tickets');
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading tickets", e);
      }
    }

    const savedPhone = localStorage.getItem('motes_contact_phone');
    const savedEmail = localStorage.getItem('motes_contact_email');
    if (savedPhone) setCorpPhone(savedPhone);
    if (savedEmail) setCorpEmail(savedEmail);
  }, []);

  const saveTicketsToStorage = (updatedTickets: InquiryTicket[]) => {
    setTickets(updatedTickets);
    localStorage.setItem('motes_inquiry_tickets', JSON.stringify(updatedTickets));
  };

  const handlePrioritySelect = (p: 'low' | 'medium' | 'high' | 'critical') => {
    setPriority(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg('');

    if (!name.trim() || !company.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg("Please fill in all the required fields marked with *");
      return;
    }

    const newTicket: InquiryTicket = {
      id: 'TKT-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase(),
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceType,
      priority,
      message: message.trim(),
      status: 'Queued for Engineering Review',
      createdAt: new Date().toISOString()
    };

    const updated = [newTicket, ...tickets];
    saveTicketsToStorage(updated);

    // Reset Form
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setServiceType('Turnkey EPC Design');
    setPriority('high');
    setMessage('');
    setSuccess(true);

    // Auto scroll to ticket list
    const badge = document.getElementById('ticket-queue-section');
    if (badge) {
      badge.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteTicket = (id: string) => {
    const filtered = tickets.filter(t => t.id !== id);
    saveTicketsToStorage(filtered);
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-[10px] uppercase">Emergency / Plant Down</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-mono font-bold text-[10px] uppercase">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-[10px] uppercase">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono font-bold text-[10px] uppercase">Low</span>;
    }
  };

  return (
    <div className="animate-fade-in py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Inquiry Desk</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Technical Inquiry & Support Desk
          </h2>
          <div className="h-1.5 w-16 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Submit water treatment pre-feasibility queries or report urgent plant emergencies. Our engineering team reviews submissions within 24 working hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Block: Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              Pre-Feasibility Technical Submission
            </h3>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex gap-2.5 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Ticket Registered Successfully!</strong>
                  <span className="block mt-0.5 text-emerald-700">We have logged your query and generated a tracking code. See the live queue at the bottom of the page.</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex gap-2.5 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="inq-name" className="block text-slate-700 font-bold text-sm">Your Full Name <span className="text-rose-500">*</span></label>
                  <input
                    id="inq-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chetan Kumar"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inq-company" className="block text-slate-700 font-bold text-sm">Company / Government Department <span className="text-rose-500">*</span></label>
                  <input
                    id="inq-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. PNC Infratech Ltd."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="inq-email" className="block text-slate-700 font-bold text-sm">Official Email Address <span className="text-rose-500">*</span></label>
                  <input
                    id="inq-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inq-phone" className="block text-slate-700 font-bold text-sm">Mobile / Telephone <span className="text-rose-500">*</span></label>
                  <input
                    id="inq-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="inq-service" className="block text-slate-700 font-bold text-sm">Remediation Service Domain</label>
                <select
                  id="inq-service"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all text-slate-700 font-bold text-sm"
                >
                  <option value="Turnkey EPC Design">Turnkey EPC Designing & Installations</option>
                  <option value="Retrofitting & Revamping">Plant Retrofitting & Upgrades</option>
                  <option value="Operation & Maintenance">Comprehensive Operation & Maintenance (O&M)</option>
                  <option value="Sludge Desludging">Pond Desludging & Dewatering</option>
                  <option value="Urgent Process Troubleshooting">Urgent Bio-Process Troubleshooting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="inq-message" className="block text-slate-700 font-bold text-sm">Technical Specifications & Message <span className="text-rose-500">*</span></label>
                <textarea
                  id="inq-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your raw discharge parameter constraints, volume scaling, technology parameters, or site specifications..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-750/10 uppercase tracking-wider font-mono text-sm"
              >
                Register Support Ticket
              </button>

            </form>
          </div>

          {/* Right Block: Sidebar stats and official contacts */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-md">
              <h3 className="font-display text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-400 shrink-0" />
                Direct Communication Hub
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4 items-start text-sm leading-relaxed">
                  <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900/60 shrink-0 mt-0.5">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-mono uppercase text-slate-500">Corporate Mobile Line</span>
                    <a href={`tel:${corpPhone}`} className="block font-bold text-white text-lg mt-0.5 hover:text-emerald-300 transition-colors">
                      {corpPhone}
                    </a>
                    <span className="text-xs text-slate-400 block mt-0.5">Primary Contact: Aditya Narayan Asthana</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start text-sm leading-relaxed border-t border-slate-800/80 pt-4">
                  <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900/60 shrink-0 mt-0.5">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-mono uppercase text-slate-500">Official Electronic Mail</span>
                    <a href={`mailto:${corpEmail}`} className="block font-bold text-white text-base mt-0.5 hover:text-emerald-300 transition-colors">
                      {corpEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs sm:text-sm font-mono text-slate-500">
                <div>Operating hours: Mon - Sat | 09:30 - 18:30 IST</div>
                <div>Emergency dispatch operating 24/7.</div>
              </div>
            </div>

            {/* Regulatory Compliance assurance info */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-display font-bold text-slate-900 text-base flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                Compliance & Quality Assurance
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                All customized engineering designs match the stringent Central Pollution Control Board (CPCB) wastewater discharge guidelines. Standard test certificates are generated for biological oxygen demand (BOD) and total suspended solids (TSS) levels.
              </p>
            </div>

          </div>
        </div>

        {/* Real-time Ticket list queue */}
        <div id="ticket-queue-section" className="border-t border-slate-200 pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Active Technical Ticket Queue
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Real-time tracking of registered support queries saved in your local web container.
              </p>
            </div>
            <span id="ticket-count-badge" className="bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold px-2.5 py-1 rounded">
              {tickets.length} Active Tickets
            </span>
          </div>

          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                        {t.id}
                      </span>
                      {getPriorityLabel(t.priority)}
                    </div>

                    <div className="space-y-0.5">
                      <strong className="block text-slate-900 text-base">{t.name}</strong>
                      <span className="block text-sm text-slate-600 font-semibold">{t.company}</span>
                      <span className="block text-xs font-mono text-emerald-600 font-bold uppercase mt-1">Domain: {t.serviceType}</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {t.message}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Cancel Ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400">
              <FileText className="h-7 w-7 text-slate-350 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Your registered ticket queue is currently empty.</p>
              <p className="text-[10px] text-slate-400 mt-1">Complete the submission form above to register an engineering review.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
