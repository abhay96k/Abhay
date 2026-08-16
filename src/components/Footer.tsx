import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-6 sm:py-8 px-4 sm:px-8 border-t border-borderLight bg-white relative z-10 flex justify-center"
    >
      <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center">
        
        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-subLight">
          <a
            href="https://www.linkedin.com/in/abhay-chavan96"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-textLight transition-colors duration-300"
            data-cursor-text="linkedin"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/abhay96k"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-textLight transition-colors duration-300"
            data-cursor-text="github"
          >
            GitHub
          </a>
          <a
            href="https://www.instagram.com/abhay_chavan.96k"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-textLight transition-colors duration-300"
            data-cursor-text="instagram"
          >
            Instagram
          </a>
        </div>

        {/* Right Side: Copyright text */}
        <div>
          <p className="text-[11px] sm:text-xs text-subLight font-bold uppercase tracking-wider m-0 text-center sm:text-right">
            © 2026 ABHAY CHAVAN — ALL RIGHTS RESERVED
          </p>
        </div>

      </div>
    </motion.footer>
  );
}
