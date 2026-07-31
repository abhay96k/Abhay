import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  SiReact, SiHtml5, SiCss, SiJavascript, 
  SiNodedotjs, SiExpress, SiMongodb, 
  SiFigma, SiGit, SiVercel, 
  SiTailwindcss, SiGooglecloud, SiSupabase
} from 'react-icons/si';
import { FiCpu, FiGlobe, FiCode, FiImage, FiBox, FiVideo, FiCamera } from 'react-icons/fi';

interface SkillItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface CategoryGroup {
  title: string;
  skills: SkillItem[];
}

function TiltSkillCard({ name, icon }: SkillItem) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d"
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-4 rounded-2xl border border-white/80 bg-white/75 backdrop-blur-xl hover:border-accent/40 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 flex items-center space-x-3 cursor-pointer group"
    >
      <div 
        style={{ transform: "translateZ(20px)" }}
        className="w-9 h-9 rounded-xl bg-neutral-100/70 backdrop-blur-md flex items-center justify-center text-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
      >
        {icon}
      </div>
      <span 
        style={{ transform: "translateZ(10px)" }}
        className="font-sans font-bold text-xs sm:text-sm text-textLight tracking-wide"
      >
        {name}
      </span>
    </motion.div>
  );
}

export default function Skills() {
  const skillCategories: CategoryGroup[] = [
    {
      title: "Frontend Stack",
      skills: [
        { name: 'HTML5', icon: <SiHtml5 className="text-[#E34F26]" />, color: '#E34F26' },
        { name: 'CSS3', icon: <SiCss className="text-[#1572B6]" />, color: '#1572B6' },
        { name: 'JavaScript', icon: <SiJavascript className="text-[#F7DF1E]" />, color: '#F7DF1E' },
        { name: 'React', icon: <SiReact className="text-[#61DAFB]" />, color: '#61DAFB' },
        { name: 'Tailwind CSS', icon: <SiTailwindcss className="text-[#06B6D4]" />, color: '#06B6D4' },
      ]
    },
    {
      title: "Backend & Database",
      skills: [
        { name: 'Node.js', icon: <SiNodedotjs className="text-[#339933]" />, color: '#339933' },
        { name: 'Express.js', icon: <SiExpress className="text-[#111111]" />, color: '#111111' },
        { name: 'MongoDB', icon: <SiMongodb className="text-[#47A248]" />, color: '#47A248' },
        { name: 'Supabase', icon: <SiSupabase className="text-[#3ECF8E]" />, color: '#3ECF8E' },
        { name: 'REST API', icon: <FiCpu className="text-[#0F766E]" />, color: '#0F766E' },
      ]
    },
    {
      title: "Tools & Deployments",
      skills: [
        { name: 'Git & GitHub', icon: <SiGit className="text-[#F05032]" />, color: '#F05032' },
        { name: 'Antigravity', icon: <FiCode className="text-[#007ACC]" />, color: '#007ACC' },
        { name: 'Google Cloud Console', icon: <SiGooglecloud className="text-[#4285F4]" />, color: '#4285F4' },
        { name: 'Render', icon: <FiGlobe className="text-[#430098]" />, color: '#430098' },
        { name: 'Vercel', icon: <SiVercel className="text-[#111111]" />, color: '#111111' },
        { name: 'Figma', icon: <SiFigma className="text-[#F24E1E]" />, color: '#F24E1E' },
      ]
    },
    {
      title: "Design & Creative",
      skills: [
        { name: 'UI / UX Design', icon: <SiFigma className="text-[#F24E1E]" />, color: '#F24E1E' },
        { name: 'Graphic Design', icon: <FiImage className="text-[#D97706]" />, color: '#D97706' },
        { name: 'Product Design', icon: <FiBox className="text-[#0F766E]" />, color: '#0F766E' },
        { name: 'Video Editing', icon: <FiVideo className="text-[#E11D48]" />, color: '#E11D48' },
        { name: 'Creative Media', icon: <FiCamera className="text-[#8B5CF6]" />, color: '#8B5CF6' },
      ]
    }
  ];

  return (
    <motion.section 
      id="skills" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full py-32 px-6 md:px-12 flex justify-center items-center relative border-t border-borderLight"
    >
      <div className="w-full max-w-6xl flex flex-col space-y-16">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="flex flex-col space-y-4">
            <span className="text-sm sm:text-base uppercase tracking-[0.3em] font-extrabold text-accent">02 / Expertise</span>
            <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-textLight m-0">
              Core Skills & Tools
            </h2>
            <motion.div 
              initial={{ width: 0 }} 
              whileInView={{ width: 64 }} 
              viewport={{ once: false }} 
              transition={{ duration: 0.8, delay: 0.25 }} 
              className="h-[2px] bg-accent rounded-full" 
            />
          </div>
          
          <p className="text-sm text-subLight max-w-xs font-light leading-relaxed">
            I prioritize modular architectures, clean state management, and modern developer tooling. Here is my workspace stack.
          </p>
        </motion.div>

        {/* Categories Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: catIdx * 0.15 }}
              className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 flex flex-col space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300"
            >
              <h3 className="font-sans font-extrabold text-lg text-textLight border-b border-borderLight pb-3 m-0">
                {category.title}
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {category.skills.map((skill, skillIdx) => (
                  <TiltSkillCard
                    key={skillIdx}
                    name={skill.name}
                    icon={skill.icon}
                    color={skill.color}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
}
