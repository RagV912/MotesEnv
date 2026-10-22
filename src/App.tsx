import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { ServicesView } from './components/ServicesView';
import { ExperienceView } from './components/ExperienceView';
import { CommercialView } from './components/CommercialView';
import { TechnicalInquiryView } from './components/TechnicalInquiryView';
import { AdminPanel } from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Load the initial hash from URL to land on the correct subpage on reload
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setCurrentPage(hash);
    } else {
      setCurrentPage('home');
    }
    // Explicitly clean up any dark mode classes from document element
    document.documentElement.classList.remove('dark');
  }, []);

  // Simple rendering engine matching currentPage hashes to independent modular pages
  const renderView = () => {
    switch (currentPage) {
      case 'about':
        return <AboutView />;
      case 'services':
        return <ServicesView />;
      case 'projects':
        return <ExperienceView />;
      case 'commercial':
        return <CommercialView />;
      case 'inquiries':
        return <TechnicalInquiryView />;
      case 'admin':
        return <AdminPanel />;
      case 'home':
      default:
        return <HomeView setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* Dynamic Header */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Pane with smooth fade transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
