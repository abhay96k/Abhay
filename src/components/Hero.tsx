import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiLinkedin, FiInstagram, FiGithub } from 'react-icons/fi';
import abhayProfile from '../assets/abhay-profile.png';

export default function Hero() {
  const [currentRoleIdx, setCurrentRoleIdx] = useState(0);
  const roles = [
    "AI & Computer Vision Enthusiast",
    "AI Developer",
    "Web Developer",
    "Graphic Designer",
    "Video Editing",
    "UI/UX Designer"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIdx((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Mouse coordinates for 3D parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for translation and rotation
  const springConfig = { damping: 28, stiffness: 100 };
  const transX = useSpring(useTransform(x, [-350, 350], [-12, 12]), springConfig);
  const transY = useSpring(useTransform(y, [-350, 350], [-12, 12]), springConfig);
  const rotX = useSpring(useTransform(y, [-350, 350], [5, -5]), springConfig);
  const rotY = useSpring(useTransform(x, [-350, 350], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleScrollToProjects = () => {
    const el = document.getElementById('projects');
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="home"
      className="min-h-screen w-full flex items-center justify-center pt-28 pb-16 px-6 md:px-12 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* LEFT SIDE: Typography & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          {/* Badge */}
          <div className="select-none mb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-neutral-100/60 rounded-full border border-neutral-200/40 -translate-y-5 lg:-translate-y-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] tracking-wider font-bold text-accent uppercase">
                PORTFOLIO
              </span>
            </motion.div>
          </div>

          {/* Heading */}
          <div className="select-none py-1">
            <motion.h1
              initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="inline-block origin-left scale-y-125 font-['Unbounded'] font-bold text-3xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none text-textLight uppercase whitespace-nowrap"
            >
              ABHAY CHAVAN
            </motion.h1>
          </div>

          {/* Subheading description */}
          <div className="max-w-lg flex flex-col space-y-1.5 select-none mt-6">
            {/* Animated Role Cycler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
              className="h-8 overflow-hidden relative flex items-center"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentRoleIdx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg sm:text-xl font-bold text-neutral-800 font-sans block"
                >
                  {roles[currentRoleIdx]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            
            {/* Description Suffix */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="text-xs sm:text-sm text-neutral-400 font-medium tracking-wide m-0 pt-2.5"
            >
              Computer Science Engineering Student
            </motion.p>
          </div>

          {/* Pill Tags (6 boxes) with staggered entrance animation */}
          <div className="flex flex-wrap gap-x-3 gap-y-3 pt-6 pb-2">
            {[
              "AI Developer",
              "Web Developer",
              "Graphic Designer",
              "Video Editing",
              "UI/UX Designer",
              "Cloud & DevOps"
            ].map((tag, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.42 + idx * 0.08, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="px-4.5 py-2.5 bg-white/70 backdrop-blur-xl border border-white/90 rounded-full text-[11px] sm:text-xs font-semibold text-neutral-800 shadow-[0_4px_20px_0_rgba(0,0,0,0.04)] cursor-default hover:bg-white/90 hover:border-white hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                {tag}
              </motion.div>
            ))}
          </div>

          {/* Action CTAs (Projects & Contact buttons) placed below the 6 boxes */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.88 }}
            className="flex items-center space-x-4 pt-4"
          >
            {/* View Projects CTA */}
            <button
              onClick={handleScrollToProjects}
              className="px-8 py-4 bg-black hover:bg-neutral-800 text-white text-sm sm:text-base font-extrabold rounded-xl transition-all duration-300 flex items-center space-x-2.5 cursor-pointer shadow-md hover:shadow-lg"
              data-cursor-text="explore"
            >
              <span>Projects</span>
              <FiArrowRight className="w-4.5 h-4.5" />
            </button>

            {/* Contact CTA */}
            <button
              onClick={handleScrollToContact}
              className="px-8 py-4 bg-white/80 backdrop-blur-xl hover:bg-white text-textLight text-sm sm:text-base font-extrabold rounded-xl border border-white/90 shadow-[0_8px_25px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
              data-cursor-text="get in touch"
            >
              Contact
            </button>
          </motion.div>

        </div>

        {/* RIGHT SIDE: Interactive Portrait Silhouette */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative -mt-3 lg:-mt-6 pl-6 lg:pl-20 translate-x-3 lg:translate-x-8">
          
          <motion.div
            style={{ 
              x: transX, 
              y: transY,
              rotateX: rotX,
              rotateY: rotY,
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative z-10 w-full max-w-[580px] lg:max-w-[660px] xl:max-w-[700px] aspect-[4/5] flex items-end justify-center group"
          >
            {/* Profile image with subtle float, drop-shadow, and smooth bottom fade */}
            <motion.img 
              src={abhayProfile}
              alt="Abhay Chavan"
              className="w-full h-auto max-h-[700px] object-contain z-10 select-none group-hover:scale-[1.03] transition-transform duration-700 ease-out pointer-events-none filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.15)]"
              style={{
                maskImage: 'linear-gradient(to bottom, black 78%, transparent 92%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent 92%)'
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            {/* Vertical Floating Social Media Icon Stack (LinkedIn, Instagram, GitHub) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-12 sm:-right-24 lg:-right-36 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-3.5"
            >
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/abhay-chavan96"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:shadow-xl flex items-center justify-center text-neutral-700 hover:text-accent hover:border-accent hover:scale-110 transition-all duration-300 cursor-pointer"
                data-cursor-text="linkedin"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/abhay_chavan.96k"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:shadow-xl flex items-center justify-center text-neutral-700 hover:text-accent hover:border-accent hover:scale-110 transition-all duration-300 cursor-pointer"
                data-cursor-text="instagram"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/abhay96k"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:shadow-xl flex items-center justify-center text-neutral-700 hover:text-accent hover:border-accent hover:scale-110 transition-all duration-300 cursor-pointer"
                data-cursor-text="github"
                aria-label="GitHub"
              >
                <FiGithub className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </motion.div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
