export default function Footer() {
  return (
    <footer className="w-full py-10 px-6 md:px-12 border-t border-borderLight bg-white relative z-10 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Side: Brand name */}
        <div>
          <span className="font-sans font-extrabold text-sm tracking-wide text-textLight">
            ABHAY CHAVAN
          </span>
        </div>

        {/* Center: Text Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-subLight">
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
          <p className="text-xs text-subLight font-bold uppercase tracking-wider m-0">
            © 2026 ABHAY CHAVAN — ALL RIGHTS RESERVED
          </p>
        </div>

      </div>
    </footer>
  );
}
