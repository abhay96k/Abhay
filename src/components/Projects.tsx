import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiCpu, FiLayers } from 'react-icons/fi';
import messTiffinImg from '../assets/mess-tiffin.png';
import smartPotholeImg from '../assets/smart-pothole.png';

interface Project {
  id: string;
  title: string;
  headline: string;
  description: string;
  features: string[];
  tech: string[];
  github: string;
  demo: string;
  image: string;
  type: string;
}

export default function Projects() {
  const projectsList: Project[] = [
    {
      id: 'mess-tiffin',
      title: 'Mess Tiffin Management System',
      headline: 'E-Commerce & Meal Subscription Portal',
      description: 'A digitized dashboard replacing manual tiffin records for local food vendors and student subscribers. Enables subscribers to manage their schedules and payments seamlessly while providing vendors with real-time headcounts to prevent waste.',
      features: [
        'Admin Dashboard with Subscriber Metrics',
        'Attendance & Daily Headcount Log',
        'Student Login & Profile Accounts',
        'Fee Management & Sandbox Billing',
        'Announcements Bulletin Board',
        'Feedback Channels & Ratings System',
        'MERN Stack Architecture'
      ],
      tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Tailwind CSS'],
      github: 'https://github.com/abhay96k/Mess-Tiffen--mng',
      demo: 'https://mess-tiffen-mng.vercel.app/',
      image: messTiffinImg,
      type: 'Full Stack MERN Project'
    },
    {
      id: 'smart-pothole',
      title: 'Smart Pothole & Traffic Management',
      headline: 'AI Spatial Analytics & Civic Infrastructure',
      description: 'A civic infrastructure system that detects road damage automatically using IoT accelerometer-GPS modules and computer vision. Feeds real-time coordinates to a municipal dashboard to assist in optimized traffic rerouting and repair scheduling.',
      features: [
        'AI Detection & Defect Classification',
        'Google Maps GIS Spatial Overlay',
        'Traffic Control Dashboard & Optimization',
        'Live Reporting & Citizen Alerts Queue',
        'IoT Firmware Integration'
      ],
      tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Google Maps API', 'AI Analytics', 'IoT WebSockets'],
      github: 'https://github.com/abhay96k/CivicConnect-full-project',
      demo: 'https://civic-connect-2-wine.vercel.app/',
      image: smartPotholeImg,
      type: 'IoT & Web Integration'
    }
  ];

  return (
    <motion.section 
      id="projects" 
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
          <span className="text-sm sm:text-base uppercase tracking-[0.3em] font-extrabold text-accent">03 / Case Studies</span>
          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-textLight m-0">
            Projects Showcase
          </h2>
          <motion.div 
            initial={{ width: 0 }} 
            whileInView={{ width: 64 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.25 }} 
            className="h-[2px] bg-accent rounded-full" 
          />
        </motion.div>

        {/* Project Showcase Stack */}
        <div className="space-y-16">
          {projectsList.map((project, pIdx) => {
            return (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 60, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -6, scale: 1.008 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.85, delay: pIdx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 md:p-12 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/80 flex flex-col space-y-8 hover:border-accent/50 hover:bg-white/85 shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Project Header (Inside the Box) */}
                <div className="flex flex-col space-y-2 border-b border-borderLight pb-6">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-accent flex items-center gap-1.5">
                    <FiCpu className="w-3.5 h-3.5" />
                    {project.type}
                  </span>
                  <h3 className="font-sans font-extrabold text-2xl md:text-3xl text-textLight m-0">
                    {project.title}
                  </h3>
                  <p className="font-sans font-medium text-xs md:text-sm text-subLight uppercase tracking-wider m-0">
                    {project.headline}
                  </p>
                </div>

                {/* Project Content: Screenshot & Detailed Specs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  
                  {/* Left Column: Interactive Screenshot */}
                  <motion.div 
                    initial={{ opacity: 0, y: 70, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className="lg:col-span-6 flex justify-center"
                  >
                    <div className="w-full relative rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-borderLight aspect-[16/10] group cursor-pointer bg-secBgLight">
                      
                      {/* Browser Header Bar */}
                      <div className="w-full h-8 bg-white flex items-center px-4 space-x-1.5 border-b border-borderLight relative z-10">
                        <span className="w-2 h-2 rounded-full bg-accent/30" />
                        <span className="w-2 h-2 rounded-full bg-accent/50" />
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <div className="absolute left-1/2 -translate-x-1/2 bg-secBgLight border border-borderLight px-4 py-0.5 rounded-md text-[8px] font-sans font-semibold text-subLight select-none">
                          {project.id}.demo
                        </div>
                      </div>

                      {/* Screenshot Body */}
                      <div className="w-full h-[calc(100%-32px)] relative overflow-hidden bg-secBgLight">
                        <motion.img 
                          src={project.image}
                          alt={project.title}
                          className="w-full h-auto object-cover absolute top-0 left-0"
                          initial={{ y: 0 }}
                          whileHover={{ 
                            y: "-40%", 
                            transition: { duration: 4.5, ease: "linear" } 
                          }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />

                        {/* Hover instruction */}
                        <div className="absolute inset-0 bg-black/5 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[8px] uppercase tracking-widest font-bold shadow-sm border border-borderLight">
                            Hover to scroll screen
                          </span>
                        </div>
                      </div>

                    </div>
                  </motion.div>

                  {/* Right Column: Descriptions & Tech Specs */}
                  <div className="lg:col-span-6 flex flex-col space-y-6 justify-between h-full">
                    
                    <p className="text-xs sm:text-sm text-subLight font-light leading-relaxed m-0">
                      {project.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-3 pt-4 border-t border-borderLight">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secAccent flex items-center gap-1.5">
                        <FiLayers className="w-3.5 h-3.5" /> Core Features
                      </span>
                      <ul className="text-xs text-subLight space-y-2.5 list-none p-0 m-0">
                        {project.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start space-x-2">
                            <span className="text-accent font-bold mt-0.5">•</span>
                            <span className="font-light leading-normal">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tech.map((t) => (
                        <span 
                          key={t}
                          className="px-3 py-1 rounded-full bg-secBgLight border border-borderLight text-[9px] uppercase tracking-widest font-bold text-subLight"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 pt-4">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-full border border-borderLight bg-white text-[9px] uppercase tracking-widest font-bold text-textLight flex items-center space-x-2 hover:border-accent hover:text-accent transition-all duration-300 shadow-sm"
                        data-cursor-text="code"
                      >
                        <FiGithub className="w-4 h-4" />
                        <span>Code</span>
                      </a>
                      
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-full bg-transparent hover:bg-accent hover:text-white border border-borderLight hover:border-accent text-[9px] uppercase tracking-widest font-bold text-textLight flex items-center space-x-2 transition-all duration-300 shadow-sm"
                        data-cursor-text="launch"
                      >
                        <span>Demo</span>
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}
