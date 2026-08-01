import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiMapPin, FiCheckCircle, FiSend, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';
import { saveMessageToSupabase } from '../utils/database';

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) tempErrors.subject = 'Subject is required';
    if (!formData.message.trim()) tempErrors.message = 'Message is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const openMailtoFallback = () => {
    const mailtoSubject = encodeURIComponent(`[Portfolio Message] ${formData.subject}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:abhaychavan672@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    setIsSubmitting(false);
    setIsSuccess(true);
    triggerConfetti();
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Save message to Supabase Cloud Database (if VITE_SUPABASE_* keys configured)
    await saveMessageToSupabase(formData);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    const web3Key = import.meta.env.VITE_WEB3FORMS_KEY || '';

    if (serviceId && templateId && publicKey && formRef.current) {
      try {
        await emailjs.sendForm(serviceId, templateId, formRef.current, publicKey);
        setIsSuccess(true);
        triggerConfetti();
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (err) {
        console.error('EmailJS error:', err);
        openMailtoFallback();
      } finally {
        setIsSubmitting(false);
      }
    } else if (web3Key) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: web3Key,
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }),
        });
        if (response.ok) {
          setIsSuccess(true);
          triggerConfetti();
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          openMailtoFallback();
        }
      } catch (err) {
        openMailtoFallback();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Guaranteed delivery via direct mailto link to abhaychavan672@gmail.com
      openMailtoFallback();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D97706', '#0F766E', '#111111', '#FAFAFA']
    });
  };

  return (
    <motion.section 
      id="contact" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full py-28 px-6 md:px-12 flex justify-center items-center relative border-t border-borderLight"
    >
      <div className="w-full max-w-5xl flex flex-col space-y-16">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-4"
        >
          <span className="text-sm sm:text-base uppercase tracking-[0.3em] font-extrabold text-accent">05 / Connection</span>
          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-textLight m-0">
            Start a Conversation
          </h2>
          <motion.div 
            initial={{ width: 0 }} 
            whileInView={{ width: 64 }} 
            viewport={{ once: false }} 
            transition={{ duration: 0.8, delay: 0.25 }} 
            className="h-[2px] bg-accent rounded-full" 
          />
        </motion.div>

        {/* Full-width introductory text (Straight Line) */}
        <div className="max-w-4xl space-y-3 pb-2">
          <h3 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-textLight leading-tight m-0">
            Let’s create something remarkable together.
          </h3>
          <p className="text-sm sm:text-base text-subLight leading-relaxed font-medium m-0">
            Whether you want to build a MERN application, configure spatial maps, hire a developer intern, or simply chat about software engineering—feel free to drop a message.
          </p>
        </div>

        {/* Split Grid: Two Boxes Below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side Box: Contact Information Cards */}
          <div className="lg:col-span-5 p-5 sm:p-8 md:p-10 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white flex flex-col justify-between space-y-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-500 min-w-0">
            
            {/* Info Cards Container */}
            <div className="space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-center min-w-0">
              
              {/* Email */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer min-w-0">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl text-accent border border-neutral-200/50 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-accent font-extrabold">Email Direct</span>
                  <a 
                    href="mailto:abhaychavan672@gmail.com" 
                    className="text-[11px] sm:text-xs md:text-sm font-sans font-black text-textLight group-hover:text-accent transition-colors duration-300 truncate block"
                    data-cursor-text="mail"
                    title="abhaychavan672@gmail.com"
                  >
                    abhaychavan672@gmail.com
                  </a>
                </div>
              </div>

              {/* GitHub */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer min-w-0">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl text-accent border border-neutral-200/50 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <FiGithub className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-accent font-extrabold">GitHub</span>
                  <a 
                    href="https://github.com/abhay96k" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-xs md:text-sm font-sans font-black text-textLight group-hover:text-accent transition-colors duration-300 truncate block"
                    data-cursor-text="github"
                    title="github.com/abhay96k"
                  >
                    github.com/abhay96k
                  </a>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer min-w-0">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl text-accent border border-neutral-200/50 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <FiLinkedin className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-accent font-extrabold">LinkedIn</span>
                  <a 
                    href="https://www.linkedin.com/in/abhay-chavan96" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-xs md:text-sm font-sans font-black text-textLight group-hover:text-accent transition-colors duration-300 truncate block"
                    data-cursor-text="linkedin"
                    title="linkedin.com/in/abhay-chavan96"
                  >
                    linkedin.com/in/abhay-chavan96
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer min-w-0">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl text-accent border border-neutral-200/50 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <FiInstagram className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-accent font-extrabold">Instagram</span>
                  <a 
                    href="https://www.instagram.com/abhay_chavan.96k" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-xs md:text-sm font-sans font-black text-textLight group-hover:text-accent transition-colors duration-300 truncate block"
                    data-cursor-text="instagram"
                    title="instagram.com/abhay_chavan.96k"
                  >
                    instagram.com/abhay_chavan.96k
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-white hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer min-w-0">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl text-accent border border-neutral-200/50 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-accent font-extrabold">Location</span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-sans font-black text-textLight truncate block">
                    Belgavi, Karnataka, India
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: High-End Glossy Glass Contact Form Module */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-10 md:p-12 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_15px_50px_rgba(0,0,0,0.04)] relative overflow-hidden hover:shadow-2xl transition-all duration-500">
              
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    key="contactForm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col space-y-6"
                  >
                    {/* Name input */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase font-extrabold tracking-widest text-accent pl-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`px-5 py-3.5 bg-neutral-50/80 border ${
                          errors.name ? 'border-red-500' : 'border-neutral-200/80'
                        } rounded-2xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight transition-all duration-300 shadow-inner`}
                        placeholder="John Doe"
                      />
                      {errors.name && <span className="text-[10px] text-red-500 pl-1">{errors.name}</span>}
                    </div>

                    {/* Email input */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase font-extrabold tracking-widest text-accent pl-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`px-5 py-3.5 bg-neutral-50/80 border ${
                          errors.email ? 'border-red-500' : 'border-neutral-200/80'
                        } rounded-2xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight transition-all duration-300 shadow-inner`}
                        placeholder="johndoe@example.com"
                      />
                      {errors.email && <span className="text-[10px] text-red-500 pl-1">{errors.email}</span>}
                    </div>

                    {/* Subject input */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase font-extrabold tracking-widest text-accent pl-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`px-5 py-3.5 bg-neutral-50/80 border ${
                          errors.subject ? 'border-red-500' : 'border-neutral-200/80'
                        } rounded-2xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight transition-all duration-300 shadow-inner`}
                        placeholder="Collaboration Opportunities"
                      />
                      {errors.subject && <span className="text-[10px] text-red-500 pl-1">{errors.subject}</span>}
                    </div>

                    {/* Message input */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase font-extrabold tracking-widest text-accent pl-1">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className={`px-5 py-3.5 bg-neutral-50/80 border ${
                          errors.message ? 'border-red-500' : 'border-neutral-200/80'
                        } rounded-2xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight resize-none transition-all duration-300 shadow-inner`}
                        placeholder="Tell me about your project..."
                      />
                      {errors.message && <span className="text-[10px] text-red-500 pl-1">{errors.message}</span>}
                    </div>

                    {errors.submit && <span className="text-[10px] text-amber-600 pl-1">{errors.submit}</span>}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-accent to-amber-600 hover:from-amber-600 hover:to-accent disabled:opacity-70 text-white text-xs sm:text-sm uppercase tracking-widest font-black rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_10px_25px_rgba(217,119,6,0.25)] hover:shadow-[0_15px_35px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 cursor-pointer"
                      data-cursor-text="submit"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Message</span>
                          <FiSend className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  // Success State Card
                  <motion.div
                    key="successMessage"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="flex flex-col items-center justify-center text-center py-16 space-y-4"
                  >
                    <div className="p-4 bg-green-500/10 text-green-500 rounded-full animate-bounce">
                      <FiCheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="font-sans font-extrabold text-2xl text-textLight">
                      Message Dispatched!
                    </h4>
                    <p className="text-xs md:text-sm text-subLight max-w-sm font-light leading-relaxed">
                      Thank you for reaching out. I have received your email and will follow up with you within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-5 py-2.5 rounded-full border border-borderLight hover:border-accent text-xs font-semibold text-textLight transition-colors duration-300 mt-6 cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </motion.section>
  );
}
