import React, { useState, useMemo, useEffect } from 'react';
import { PROJECTS_DATA, getProjectImageDefault } from '../data';
import { Project } from '../types';
import { Search, SlidersHorizontal, CheckCircle2, Clock, PlayCircle, FileSpreadsheet, Briefcase, RefreshCw, Camera } from 'lucide-react';
import { ProjectGallery } from './ProjectGallery';

export const ExperienceView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gallery' | 'log'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Load from localStorage on mount and register update listener
  useEffect(() => {
    const loadProjects = () => {
      const saved = localStorage.getItem('motes_projects_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Project[];
          let modified = false;
          const migrated = parsed.map(p => {
            if (!p.imageUrl) {
              const defImg = getProjectImageDefault(p.id, p.site, p.client, p.location) || localStorage.getItem('motes_default_site_image') || '';
              if (defImg) {
                modified = true;
                return { ...p, imageUrl: defImg };
              }
            }
            return p;
          });
          if (modified) {
            localStorage.setItem('motes_projects_list', JSON.stringify(migrated));
            setProjectsList(migrated);
          } else {
            setProjectsList(parsed);
          }
        } catch (e) {
          setProjectsList(PROJECTS_DATA);
        }
      } else {
        const globalDefault = localStorage.getItem('motes_default_site_image') || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
        const initialized = PROJECTS_DATA.map(p => {
          if (!p.imageUrl) {
            const defImg = getProjectImageDefault(p.id, p.site, p.client, p.location) || globalDefault;
            return { ...p, imageUrl: defImg };
          }
          return p;
        });
        setProjectsList(initialized);
        localStorage.setItem('motes_projects_list', JSON.stringify(initialized));
      }
    };

    loadProjects();

    const handleUpdate = () => {
      loadProjects();
    };
    window.addEventListener('motes_projects_updated', handleUpdate);
    return () => {
      window.removeEventListener('motes_projects_updated', handleUpdate);
    };
  }, []);

  // Helper to extract the start year for chronological descending sorting
  const parseStartYear = (fyStr: string) => {
    const parts = fyStr.split(' - ');
    if (parts.length > 0) {
      const year = parseInt(parts[0], 10);
      if (!isNaN(year)) return year;
    }
    return 0;
  };

  // Programmatically sort projects from current year to previous year (newest first)
  const sortedAndFilteredProjects = useMemo(() => {
    // 1. Sort chronologically from current to year to previous
    const sorted = [...projectsList].sort((a, b) => {
      const yearA = parseStartYear(a.fy);
      const yearB = parseStartYear(b.fy);
      
      if (yearB !== yearA) {
        return yearB - yearA; // Descending start year (newest first)
      }
      // If year is identical, keep newest ID first
      return b.id - a.id;
    });

    // 2. Apply search filter
    return sorted.filter(p => {
      const matchesSearch = 
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tech.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      
      const matchesTech = techFilter === 'All' || 
        p.tech.toLowerCase().includes(techFilter.toLowerCase()) ||
        (techFilter === 'O&M' && p.tech === 'O&M') ||
        (techFilter === 'Sewer' && (p.tech.includes('Sewer') || p.tech.includes('Jetting')));

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [projectsList, searchTerm, statusFilter, techFilter]);

  // Extract statistics
  const stats = useMemo(() => {
    const total = projectsList.length;
    const completed = projectsList.filter(p => p.status === 'Completed').length;
    const ongoing = projectsList.filter(p => p.status === 'Ongoing' || p.status === 'Under Commissioning').length;
    return { total, completed, ongoing };
  }, [projectsList]);

  // Unique tech triggers
  const techCategories = ['All', 'SBR', 'MBR', 'MBBR', 'ASP', 'O&M', 'Sewer', 'Civil'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            Completed
          </span>
        );
      case 'Ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0 animate-pulse" />
            Ongoing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <PlayCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            Commissioning
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-sm font-mono font-bold tracking-widest text-emerald-600 uppercase">Track Record</span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Engineering Experience Log
          </h2>
          <div className="h-1.5 w-16 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-650 leading-relaxed max-w-2xl mx-auto">
            Review all 32 prime wastewater and civil work orders. Organized chronologically from the current year down to previous years of operations.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex bg-white border border-slate-200 p-1.5 rounded-2xl gap-2 shadow-sm">
            <button
              onClick={() => setViewMode('gallery')}
              id="view-mode-gallery"
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'gallery'
                  ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Camera className="h-4.5 w-4.5" />
              <span>Project Photo Gallery</span>
            </button>
            <button
              onClick={() => setViewMode('log')}
              id="view-mode-log"
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'log'
                  ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              <span>Comprehensive Work Log ({stats.total})</span>
            </button>
          </div>
        </div>

        {viewMode === 'gallery' ? (
          <ProjectGallery />
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Work Orders</span>
                  <span className="block font-display text-2xl font-extrabold text-slate-900">{stats.total} Projects</span>
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Completed Contracts</span>
                  <span className="block font-display text-2xl font-extrabold text-emerald-700">{stats.completed} Commissioned</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Works In-Progress</span>
                  <span className="block font-display text-2xl font-extrabold text-blue-700">{stats.ongoing} Active Sites</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl animate-pulse">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Interactive Filter Tool-bar */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl space-y-4 shadow-sm">
              
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
                
                {/* Search Input Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by client name, keywords, location, or system technology..."
                    className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Status Select Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-600 flex items-center gap-1 shrink-0">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    Status:
                  </span>
                  <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
                    {['All', 'Completed', 'Ongoing'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                          statusFilter === status
                            ? 'bg-white text-slate-900 shadow-sm font-bold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Technology filter chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-sm font-mono text-slate-600 mr-2">Process Tech:</span>
                {techCategories.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => setTechFilter(tech)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      techFilter === tech
                        ? 'bg-emerald-700 border-emerald-700 text-white font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

            </div>

            {/* Work Orders Display */}
            {sortedAndFilteredProjects.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-150 text-xs font-mono uppercase tracking-wider text-slate-600">
                        <th className="py-4.5 px-5 w-[110px]">FY Year</th>
                        <th className="py-4 px-5 w-[150px]">Technology</th>
                        <th className="py-4 px-5">Client & Site Location</th>
                        <th className="py-4 px-5">Scope & Operations Summary</th>
                        <th className="py-4 px-5 text-right w-[140px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {sortedAndFilteredProjects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {proj.fy}
                          </td>
                          <td className="py-5 px-5">
                            <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs">
                              {proj.tech}
                            </span>
                          </td>
                          <td className="py-5 px-5">
                            <div className="space-y-1">
                              <strong className="block text-slate-900 text-base">{proj.client}</strong>
                              <span className="block text-xs text-slate-600 font-semibold">{proj.site}</span>
                              <span className="block text-xs text-slate-400">{proj.location}</span>
                            </div>
                          </td>
                          <td className="py-5 px-5 leading-relaxed text-slate-600 max-w-xs xl:max-w-md">
                            {proj.description}
                          </td>
                          <td className="py-5 px-5 text-right">
                            {getStatusBadge(proj.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card / Bento Layout */}
                <div className="block md:hidden space-y-4">
                  {sortedAndFilteredProjects.map((proj) => (
                    <div key={proj.id} className="bg-white rounded-2xl border border-slate-150 p-5 space-y-3.5 shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-mono font-bold text-slate-900 text-base">{proj.fy}</span>
                        {getStatusBadge(proj.status)}
                      </div>

                      <div className="space-y-1">
                        <strong className="block text-slate-950 text-base leading-tight">{proj.client}</strong>
                        <span className="block text-xs text-slate-600">{proj.site}</span>
                        <span className="block text-xs text-slate-400">{proj.location}</span>
                      </div>

                      <p className="text-sm text-slate-650 leading-relaxed border-t border-slate-100 pt-3">
                        {proj.description}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-mono text-slate-400">Process Category:</span>
                        <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold">
                          {proj.tech}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center font-mono text-xs text-slate-400 pt-4">
                  Showing {sortedAndFilteredProjects.length} of {projectsList.length} work experience log entries.
                </div>
              </>
            ) : (
              <div className="bg-white border border-dashed border-slate-250 rounded-2xl py-16 px-4 text-center">
                <RefreshCw className="h-8 w-8 text-slate-350 mx-auto animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-700">No projects match your current filter settings.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or category triggers above.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setTechFilter('All');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
