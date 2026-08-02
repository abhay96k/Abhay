import { useState, useEffect } from 'react';
import Lenis from 'lenis';

// Core Components
import Navbar from './components/Navbar';
import Background3D from './components/Background3D';
import AdminDashboard from './components/AdminDashboard';

// Section Components
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync light class on body element & check URL hash for #admin
  useEffect(() => {
    const body = document.body;
    body.classList.remove('dark');
    localStorage.setItem('abhay-theme', 'light');

    if (window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like decelerating curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
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
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between selection:bg-accent selection:text-white">
      {/* R3F Animated Organic Shader Mesh and Particles */}
      <Background3D darkMode={false} />

      {/* Floating Sticky Glassmorphic Navbar */}
      <Navbar />

      {/* Scrolling Content Modules */}
      <main className="w-full relative z-10 flex flex-col items-center">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      {/* Minimal Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Secure Admin Messages Dashboard */}
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash === '#admin') {
            history.pushState("", document.title, window.location.pathname + window.location.search);
          }
        }} 
      />
    </div>
  );
}
