import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  FiBookOpen, FiCode, FiCpu, 
  FiCloud, FiSliders, FiLayers 
} from 'react-icons/fi';

interface CounterProps {
  value: number;
  suffix?: string;
}

function AnimatedCounter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
      return () => controls.stop();
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toString() + suffix;
      }
    });
  }, [rounded, suffix]);

  return <span ref={ref} className="font-sans font-extrabold text-4xl md:text-5xl text-accent">0{suffix}</span>;
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  const attributes = [
    { text: "Computer Science Engineering Student", icon: <FiBookOpen className="w-5 h-5" /> },
    { text: "Passionate Full Stack MERN Developer", icon: <FiCode className="w-5 h-5" /> },
    { text: "Building Full Stack Web Applications", icon: <FiLayers className="w-5 h-5" /> },
    { text: "Learning Cloud Computing", icon: <FiCloud className="w-5 h-5" /> },
    { text: "Learning DevOps & Problem Solver", icon: <FiSliders className="w-5 h-5" /> },
    { text: "Interested in AI & Fast Learner", icon: <FiCpu className="w-5 h-5" /> }
  ];

  const timelineItems = [
    {
      num: '01',
      year: '2024 - 2028',
      title: 'Computer Science & Engineering',
      institution: 'Angadi Institute of Technology & Management, Belgavi',
      description: (
        <>
          Currently in <strong className="font-extrabold text-textLight">2nd Year</strong> maintaining an <strong className="font-extrabold text-textLight">8.5 CGPA</strong>.
        </>
      ),
      icon: <FiBookOpen className="w-4 h-4 text-accent" />
    },
    {
      num: '02',
      year: '2026',
      title: 'Hackhive Hackathon - 2nd Prize',
      institution: 'Angadi Institute of Technology & Management (E&C)',
      description: 'Secured 2nd prize in App/Web Development domain.',
      icon: <FiCpu className="w-4 h-4 text-accent" />
    },
    {
      num: '03',
      year: '2026 - Present',
      title: 'Full Stack MERN Developer',
      institution: 'Mess Tiffen & Custom Web Apps',
      description: 'Designing and building role-based web applications with meal scheduling and automated billing.',
      icon: <FiCode className="w-4 h-4 text-accent" />
    }
  ];

  return (
    <motion.section 
      id="about" 
      ref={containerRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full py-32 px-6 md:px-12 flex justify-center items-center relative border-t border-borderLight"
    >
      <div className="w-full max-w-5xl flex flex-col space-y-16">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-4"
        >
          <span className="text-sm sm:text-base uppercase tracking-[0.3em] font-extrabold text-accent">01 / Profile</span>
          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-textLight m-0">
            About Me
          </h2>
          <motion.div 
            initial={{ width: 0 }} 
            whileInView={{ width: 64 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.25 }} 
            className="h-[2px] bg-accent rounded-full" 
          />
        </motion.div>

        {/* Full-width introductory bio text */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl pb-4"
        >
          <p className="text-base sm:text-lg md:text-xl font-bold text-textLight leading-relaxed m-0">
            Hi, I am a Computer Science Engineering student specializing in MERN Stack development.<br className="hidden sm:inline" /> I focus on writing clean, modular, optimized code and I am passionate about building interactive applications and automation solutions.
          </p>
        </motion.div>

        {/* Elegant two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: Attribute tags */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <span className="text-xs sm:text-sm uppercase font-bold tracking-wider text-accent pl-1">
              Core Profile & Focus
            </span>
            <div className="flex flex-wrap gap-3.5 sm:gap-4">
              {attributes.map((attr, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="px-6 py-3.5 sm:px-7 sm:py-4 bg-white/75 backdrop-blur-xl hover:bg-white border border-white/90 hover:border-accent/50 rounded-2xl flex items-center space-x-3.5 transition-all duration-300 shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:shadow-lg cursor-default"
                >
                  <div className="text-accent">{attr.icon}</div>
                  <span className="text-sm sm:text-base font-bold text-textLight font-sans">
                    {attr.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Academic & Developer Timeline */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <span className="text-xs sm:text-sm uppercase font-bold tracking-wider text-accent pl-1">
              Academic & Developer Timeline
            </span>

            <div className="relative border-l border-borderLight pl-6 ml-2 space-y-8">
              {timelineItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 }}
                  className="relative group"
                >
                  {/* Timeline Dot Icon indicator */}
                  <span className="absolute -left-[41px] top-2 w-8 h-8 rounded-full bg-white border border-borderLight flex items-center justify-center text-accent group-hover:border-accent transition-colors duration-300 shadow-md">
                    {item.icon}
                  </span>

                  {/* Timeline item card */}
                  <div className="p-7 sm:p-8 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-2xl hover:border-accent/50 hover:bg-white/85 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.05)] hover:shadow-xl flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col space-y-2.5">
                        <span className="text-xs sm:text-sm font-extrabold text-accent uppercase tracking-widest">{item.year}</span>
                        <h4 className="font-sans font-black text-lg sm:text-xl md:text-2xl text-textLight leading-snug m-0">
                          {item.title}
                        </h4>
                        <span className="text-xs sm:text-sm font-bold text-subLight uppercase tracking-wider pt-2 sm:pt-2.5 block">
                          {item.institution}
                        </span>
                      </div>
                      <span className="font-sans font-black text-3xl text-accent/15 select-none">
                        {item.num}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-subLight font-medium leading-relaxed m-0 border-t border-borderLight pt-4">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Statistics Grid with Staggered Scroll Entrance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10">
          {[
            { value: 2, suffix: "+", label: "Years of Coding" },
            { value: 2, suffix: "+", label: "Projects Completed" },
            { value: 10, suffix: "+", label: "Tech Stack Tools" },
            { value: 99, suffix: "%", label: "Lighthouse Target" }
          ].map((stat, sIdx) => (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 35, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: sIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 rounded-3xl border border-borderLight bg-white flex flex-col items-center justify-center text-center space-y-2 hover:border-accent/30 transition-all duration-300 shadow-sm"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-[9px] uppercase tracking-widest text-subLight font-bold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
}
