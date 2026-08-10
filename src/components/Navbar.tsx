import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { FiDownload } from 'react-icons/fi';
import navbarAvatar from '../assets/navbar-avatar.png';

interface NavbarProps {
  onOpenAdmin?: () => void;
}

export default function Navbar({ onOpenAdmin }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ];

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 80) {
          setVisible(true);
        } else if (currentScrollY > lastScrollY) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Setup intersection observer to determine active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, observerOptions);

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      navItems.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        <div className="w-full max-w-6xl flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-xl pointer-events-auto transition-all duration-300">
          
          {/* Left Side: Circular Avatar + ABHAY CHAVAN */}
          <div 
            onClick={() => handleNavClick('home')}
            onDoubleClick={() => onOpenAdmin?.()}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer min-w-0 select-none"
          >
            <img 
              src={navbarAvatar} 
              alt="Abhay Chavan" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-borderLight shadow-sm flex-shrink-0"
            />
            <span className="font-sans font-extrabold text-xs sm:text-sm md:text-base tracking-wider text-textLight truncate">
              ABHAY CHAVAN
            </span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'text-textLight font-black' 
                      : 'text-subLight hover:text-textLight'
                  }`}
                  data-cursor-text="view"
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black rounded-full"
                      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Utility Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3.5 flex-shrink-0">
            
            {/* Resume Download Button (Desktop) */}
            <a
              href="/Abhay_Chavan_Resume.pdf"
              download="Abhay_Chavan_Resume.pdf"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-borderLight hover:border-textLight text-textLight text-xs sm:text-sm uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 shadow-sm"
              data-cursor-text="download cv"
            >
              <span>Resume</span>
              <FiDownload className="w-4 h-4" />
            </a>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-hoverLight border border-transparent hover:border-borderLight text-subLight hover:text-textLight transition-all duration-300"
              aria-label="Toggle Navigation Menu"
            >
              <HiMenuAlt4 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden flex flex-col justify-center items-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-3 rounded-xl border border-borderLight bg-white text-textLight"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Links List */}
            <div className="flex flex-col items-center space-y-6">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xl uppercase tracking-widest font-sans font-extrabold ${
                    activeSection === item.id 
                      ? 'text-accent' 
                      : 'text-subLight hover:text-textLight'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}

              {/* Mobile Resume Link */}
              <motion.a
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05, duration: 0.5 }}
                href="/Abhay_Chavan_Resume.pdf"
                download="Abhay_Chavan_Resume.pdf"
                className="mt-4 flex items-center space-x-2 px-6 py-3 bg-accent text-white text-xs uppercase tracking-widest font-bold rounded-lg shadow-md"
              >
                <span>Download Resume</span>
                <FiDownload className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
