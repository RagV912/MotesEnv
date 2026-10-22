import React, { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, MapPin, Eye, ExternalLink, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { PROJECTS_DATA, INITIAL_MEDIA_FOLDER_IMAGES, getFolderKeyForProject, getPlantDetailForProject } from '../data';

interface GalleryProject {
  id: number;
  title: string;
  client: string;
  location: string;
  tech: string;
  // Array of image paths. Slot 1 is the primary image. Slots 2 & 3 are ready for copy-pasting direct links.
  images: string[];
  description: string;
}

interface ProjectCardProps {
  proj: GalleryProject;
  onSelect: (proj: GalleryProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ proj, onSelect }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Filter out the non-HTTP placeholder strings so we only cycle real image URLs (allowing Base64 data urls as well)
  const validImages = proj.images.filter(
    (img) => img && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/'))
  );

  useEffect(() => {
    setImageError(false);
  }, [proj.id, activeIdx, proj.images]);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % validImages.length);
    }, 4000); // cycle slide every 4 seconds when in card view
    return () => clearInterval(interval);
  }, [validImages.length]);

  const currentUrl = validImages[activeIdx];

  return (
    <div
      id={`project-card-${proj.id}`}
      className="group bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center group-hover:scale-[1.01] transition-transform">
        {imageError || !currentUrl ? (
          /* Stylized Fallback Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-slate-100 to-cyan-50/50">
            <div className="p-3 bg-cyan-100/70 border border-cyan-200 rounded-2xl text-cyan-700 mb-3 animate-pulse">
              <ImageIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-slate-700 font-display">{proj.title}</span>
            <span className="text-xs text-cyan-700 font-mono font-bold mt-1 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              {proj.tech}
            </span>
            <p className="text-xs text-slate-450 mt-2 max-w-[200px] leading-tight">
              Photo failed to load.
            </p>
          </div>
        ) : (
          /* Normal Image Rendering with no-referrer */
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={activeIdx}
                src={currentUrl}
                alt={proj.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full h-full object-cover absolute inset-0"
              />
            </AnimatePresence>
            {validImages.length > 1 && (
              <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-mono font-bold text-white tracking-widest z-10">
                {activeIdx + 1}/{validImages.length}
              </div>
            )}
          </div>
        )}

        {/* Badge Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs font-bold uppercase tracking-wider">
            {proj.tech}
          </span>
        </div>

        {/* Interactive Action Overlays */}
        <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onSelect(proj)}
            id={`btn-view-details-${proj.id}`}
            className="p-2.5 bg-white rounded-full text-slate-900 hover:bg-cyan-600 hover:text-white transition-all shadow-md transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Eye className="h-4 w-4" />
            <span>View Detail</span>
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-mono text-cyan-700 font-bold">
            <MapPin className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
            <span>{proj.location}</span>
          </div>
          <h4 className="font-display text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
            {proj.title}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
            {proj.description}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Client Contracting Entity</span>
            <span className="block text-xs font-bold text-slate-750 truncate max-w-[180px]">{proj.client}</span>
          </div>
          <button
            onClick={() => onSelect(proj)}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors inline-flex items-center gap-0.5"
          >
            <span>Read case</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState<number>(0);
  const [filterTech, setFilterTech] = useState<string>('All');

  useEffect(() => {
    const loadGalleryData = () => {
      const savedProjects = localStorage.getItem('motes_projects_list');
      let plist: Project[] = [];
      if (savedProjects) {
        try {
          plist = JSON.parse(savedProjects);
        } catch (e) {
          plist = PROJECTS_DATA;
        }
      } else {
        plist = PROJECTS_DATA;
      }

      // Migrate "Philippines Projects" to "Industrial Sewage Treatment Plant"
      let plistChanged = false;
      plist = plist.map(p => {
        if (p.site === "Philippines Projects") {
          plistChanged = true;
          return { ...p, site: "Industrial Sewage Treatment Plant" };
        }
        return p;
      });
      if (plistChanged) {
        localStorage.setItem('motes_projects_list', JSON.stringify(plist));
      }

      // Sort plist chronologically from present to past (newest first)
      const parseStartYear = (fyStr: string) => {
        const parts = fyStr.split(' - ');
        if (parts.length > 0) {
          const year = parseInt(parts[0], 10);
          if (!isNaN(year)) return year;
        }
        return 0;
      };

      plist = [...plist].sort((a, b) => {
        const yearA = parseStartYear(a.fy);
        const yearB = parseStartYear(b.fy);
        if (yearB !== yearA) {
          return yearB - yearA;
        }
        return b.id - a.id;
      });

      const defaultSiteImage = localStorage.getItem('motes_default_site_image') || 'https://i.postimg.cc/tTn7YWZ8/DEFAULT.png';

      const savedFolderImagesV3 = localStorage.getItem('motes_media_folder_images_v3');
      let folderImgMap: Record<string, { url: string }[]> = {};
      if (savedFolderImagesV3) {
        try {
          folderImgMap = JSON.parse(savedFolderImagesV3);
        } catch (e) {
          folderImgMap = {};
        }
      } else {
        // Try migrating from V2
        const savedFolderImagesV2 = localStorage.getItem('motes_media_folder_images_v2');
        let tempMap: Record<string, { url: string }[]> = {};
        if (savedFolderImagesV2) {
          try {
            tempMap = JSON.parse(savedFolderImagesV2);
          } catch (e) {}
        } else {
          tempMap = INITIAL_MEDIA_FOLDER_IMAGES;
        }

        // Map every project to its new key
        plist.forEach(p => {
          const oldKey = p.site;
          const newKey = getFolderKeyForProject(p);
          const imgs = tempMap[oldKey] || tempMap[oldKey.trim()];
          if (imgs) {
            folderImgMap[newKey] = imgs;
          }
        });

        localStorage.setItem('motes_media_folder_images_v3', JSON.stringify(folderImgMap));
      }

      const groupedGalleryMap: Record<string, GalleryProject> = {};
      plist.forEach(p => {
        const plantDetail = getPlantDetailForProject(p);
        if (!plantDetail) return;
        
        const folderKey = getFolderKeyForProject(p);
        const folderImgs = folderImgMap[folderKey] || [];
        let imageUrls = folderImgs.map((img: any) => img.url).filter(Boolean);
        
        if (imageUrls.length === 0) {
          imageUrls = [defaultSiteImage];
        }
        
        if (!groupedGalleryMap[plantDetail]) {
          groupedGalleryMap[plantDetail] = {
            id: p.id,
            title: plantDetail,
            client: p.client,
            location: p.location,
            tech: p.tech,
            images: imageUrls,
            description: p.description
          };
        } else {
          // If this plant detail already exists, combine unique images
          const existingImages = groupedGalleryMap[plantDetail].images.filter(img => img !== defaultSiteImage);
          const incomingImages = imageUrls.filter(img => img !== defaultSiteImage);
          let combined = Array.from(new Set([...existingImages, ...incomingImages]));
          if (combined.length === 0) {
            combined = [defaultSiteImage];
          }
          groupedGalleryMap[plantDetail].images = combined;
        }
      });

      const galleryItems = Object.values(groupedGalleryMap).filter(item => {
        // ONLY show records that have at least one real image (i.e. not the default placeholder)
        return item.images.some(url => url && url !== defaultSiteImage && !url.includes('DEFAULT.png'));
      });
      setProjects(galleryItems);
    };

    loadGalleryData();

    window.addEventListener('motes_projects_updated', loadGalleryData);
    window.addEventListener('motes_media_folder_images_updated', loadGalleryData);
    
    return () => {
      window.removeEventListener('motes_projects_updated', loadGalleryData);
      window.removeEventListener('motes_media_folder_images_updated', loadGalleryData);
    };
  }, []);

  useEffect(() => {
    setModalImageIdx(0);
  }, [selectedProject]);

  const categories = useMemo(() => {
    const techs = projects.map(p => p.tech).filter(Boolean);
    return ['All', ...Array.from(new Set(techs))];
  }, [projects]);

  const filteredProjects = projects.filter(p => filterTech === 'All' || p.tech === filterTech);

  return (
    <div className="space-y-8">
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 justify-center pb-2">
        <span className="text-sm font-mono text-slate-600 mr-2 flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter Portfolio:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setFilterTech(cat)}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all ${
              filterTech === cat
                ? 'bg-cyan-700 border-cyan-700 text-white font-bold shadow-sm shadow-cyan-700/10'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat === 'All' ? 'Show All Sites' : cat.split(' ')[0] || cat}
          </button>
        ))}
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((proj) => (
          <ProjectCard 
            key={proj.id}
            proj={proj}
            onSelect={setSelectedProject}
          />
        ))}
      </div>

      {/* Detail Modal Overlay (Case Study Mode) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl space-y-0 relative">
            
            {/* Case Study Image Slider */}
            <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
              {(() => {
                const validModalImages = selectedProject.images.filter(
                  (img) => img && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/'))
                );
                const currentModalUrl = validModalImages[modalImageIdx] || selectedProject.images[0];

                return (
                  <>
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={modalImageIdx}
                        src={currentModalUrl}
                        alt={`${selectedProject.title} - Slide ${modalImageIdx + 1}`}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    </AnimatePresence>

                    {/* Manual controls (Arrows): Rendered only if there are multiple valid images */}
                    {validModalImages.length > 1 && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Left Control */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIdx((prev) => (prev - 1 + validModalImages.length) % validModalImages.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full flex items-center justify-center transition-all shadow hover:scale-105 active:scale-95 focus:outline-none pointer-events-auto"
                          title="Previous Slide"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>

                        {/* Right Control */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIdx((prev) => (prev + 1) % validModalImages.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full flex items-center justify-center transition-all shadow hover:scale-105 active:scale-95 focus:outline-none pointer-events-auto"
                          title="Next Slide"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Slide Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto">
                          {validModalImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalImageIdx(idx);
                              }}
                              className={`h-2 w-2 rounded-full transition-all ${
                                idx === modalImageIdx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Counter Badge */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md text-white font-mono text-[9px] px-2.5 py-1 rounded-full font-bold tracking-wider pointer-events-auto">
                          {modalImageIdx + 1} / {validModalImages.length}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 h-8 w-8 bg-slate-950/80 text-white rounded-full flex items-center justify-center hover:bg-slate-950 transition-colors shadow z-10"
              >
                ✕
              </button>
            </div>

            {/* Case Study Details */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-cyan-700">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                  <span>{selectedProject.location}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="text-slate-700 text-base leading-relaxed border-t border-b border-slate-100 py-4">
                <p>{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Contract Client</span>
                  <span className="block font-bold text-slate-800 text-base mt-0.5">{selectedProject.client}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Process Category</span>
                  <span className="inline-block mt-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 text-sm">
                    {selectedProject.tech}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Close Case Study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
