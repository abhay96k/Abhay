import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { useTracker } from './utils/useTracker';

// Core Components
import Navbar from './components/Navbar';
import Background3D from './components/Background3D';
import AdminPortal from './components/admin/AdminPortal';

// Section Components
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  // Initialize lightweight, privacy-friendly visitor telemetry
  useTracker();

  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin'
      );
    }
    return false;
  });

  // Listen to path and hash changes for seamless navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const isCurrentAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin';
      setIsAdminView(isCurrentAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Sync light class on body element
  useEffect(() => {
    const body = document.body;
    body.classList.remove('dark');
    localStorage.setItem('abhay-theme', 'light');
  }, []);

  // Initialize Lenis smooth scroll for public portfolio
  useEffect(() => {
    if (isAdminView) return; // Disable Lenis on Admin Dashboard to ensure snappy admin UI

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isAdminView]);

  const handleOpenAdmin = () => {
    window.history.pushState({}, '', '/admin/dashboard');
    setIsAdminView(true);
  };

  const handleCloseAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  // Dedicated Secure Admin View
  if (isAdminView) {
    return <AdminPortal onClose={handleCloseAdmin} />;
  }

  // Exact Pristine Public Portfolio View
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between selection:bg-accent selection:text-white">
      {/* R3F Animated Organic Shader Mesh and Particles */}
      <Background3D darkMode={false} />

      {/* Floating Sticky Glassmorphic Navbar */}
      <Navbar onOpenAdmin={handleOpenAdmin} />

      {/* Scrolling Content Modules */}
      <main className="w-full relative z-10 flex flex-col items-center">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
