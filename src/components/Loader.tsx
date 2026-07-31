import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Premium organic loading progression (slowing down as it approaches 100%)
      let increment = 0;
      if (current < 40) {
        increment = Math.floor(Math.random() * 15) + 5;
      } else if (current < 70) {
        increment = Math.floor(Math.random() * 8) + 2;
      } else if (current < 90) {
        increment = Math.floor(Math.random() * 4) + 1;
      } else {
        increment = Math.floor(Math.random() * 2) + 0.5;
      }
      
      current = Math.min(100, current + increment);
      // Format to single decimal or integer
      const roundedCurrent = Math.round(current * 10) / 10;
      setProgress(roundedCurrent);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 700); // Premium brief pause at 100%
      }
    }, 70);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Format progress for aesthetic display (e.g. "05", "23", "100")
  const formatProgress = (val: number) => {
    const intVal = Math.floor(val);
    if (intVal < 10) return `0${intVal}`;
    return `${intVal}`;
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        y: -100,
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[99999] flex flex-col justify-between p-8 md:p-16 bg-bgLight dark:bg-bgDark transition-colors duration-500"
    >
      {/* Top section */}
      <div className="flex justify-between items-start w-full border-b border-borderLight dark:border-borderDark pb-6">
        <div>
          <span className="font-serif italic text-accent font-medium text-lg">Abhay Chavan</span>
          <p className="text-[10px] uppercase tracking-widest text-subLight dark:text-subDark mt-1">Portfolio Experience ©2026</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-subLight dark:text-subDark">Engineering Student</span>
          <p className="text-[10px] uppercase tracking-widest text-subLight dark:text-subDark mt-1">Full Stack Developer</p>
        </div>
      </div>

      {/* Middle logo / Title centered */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden py-4"
        >
          <h1 className="font-serif italic font-bold text-5xl md:text-8xl tracking-tight text-textLight dark:text-textDark m-0">
            Handcrafted
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mt-4">Premium Digital Space</p>
        </motion.div>

        {/* Elegant Centered Progress bar */}
        <div className="w-48 h-[1px] bg-borderLight dark:bg-borderDark relative overflow-hidden mt-8">
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Counter and details */}
      <div className="flex flex-col md:flex-row justify-between items-end w-full border-t border-borderLight dark:border-borderDark pt-6">
        <div className="mb-4 md:mb-0">
          <span className="text-[10px] uppercase tracking-widest text-subLight dark:text-subDark">MERN Stack • Three.js • GSAP</span>
        </div>

        {/* Big percentage counter */}
        <div className="relative font-serif font-bold italic text-7xl md:text-9xl text-accent select-none leading-none">
          <span className="absolute -left-8 md:-left-12 top-0 text-xl font-sans not-italic font-light text-subLight dark:text-subDark">%</span>
          {formatProgress(progress)}
        </div>
      </div>
    </motion.div>
  );
}
