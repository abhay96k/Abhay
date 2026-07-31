# Abhay Chavan — Cinematic Luxury 3D Portfolio

An editorial-grade, immersive 3D personal portfolio built for **Abhay Chavan**, Computer Science Engineering Student & Full Stack MERN Developer. Designed with a luxury aesthetic inspired by Apple, Stripe, Linear, and Awwwards, this portfolio features advanced interactions, a real-time responsive 3D scene, and a custom generative background soundtrack.

---

## 🎨 Design System & Aesthetics

Unlike generic developer templates, this portfolio implements a handcrafted editorial aesthetic:
- **Earthy Palette**: Ditching neon glows and purple/blue gradients in favor of **Soft Warm Beige (`#F5F2EB`)**, **Terracotta (`#C56E33`)**, **Olive Teal (`#325C5A`)**, and **Deep Charcoal (`#171717`)**.
- **Tactile Grain Overlay**: An animated film-grain noise texture covers the viewport, adding a physical, high-end magazine feel.
- **Glassmorphic Cards**: Delicate backdrop filters with transparent borders (`rgba(0,0,0,0.08)`) create visual depth.
- **Typographic Layout**: Outfitted with premium serif headlines (*Playfair Display*) and clean geometric body copy (*Outfit*).

---

## ⚙️ Core Technical Features

1. **Custom 3D Scene (Three.js & R3F)**:
   - Renders a floating, liquid organic blob using a vertex-distorted sphere material.
   - Drifting micro-particle stars that respond to scroll velocity.
   - Parallax tracking that lerps coordinates to match the user's cursor position.
2. **Generative Web Audio Synthesizer**:
   - Built directly on the browser's Web Audio API (completely offline and asset-free).
   - Generates detuned triangle/sine chord pads (shifting between *Fmaj9 - Cmaj9 - Am9 - G6*) with slow-attack swells.
3. **Transparent Portrait Silhouette**:
   - The user portrait was processed using a custom Python script powered by `rembg` (U2Net AI) to remove the background, sharpen details, and output a clean PNG.
   - Includes mouse-movement 3D parallax tilt and bottom transparency blending.
4. **Fluid Layout Transitions**:
   - **Lenis Smooth Scroll**: Eliminates browser scroll stuttering, creating a smooth scroll speed.
   - **Framer Motion Layouts**: Category filters in the Skills section trigger spring-animated layout shuffles.
5. **Interactive Custom Cursor**:
   - Spring-interpolated cursor follower that expands over interactive elements and displays custom action tags (e.g., `"view"`, `"launch"`, `"code"`, `"top"`).

---

## 📁 Directory Structure

```text
abhay/
├── .github/                  # CI/CD Workflows
├── public/                   # Static assets
├── scripts/
│   └── remove_bg.py          # Python U2Net background-removal script
├── src/
│   ├── assets/
│   │   ├── abhay-profile.png # Background-removed transparent silhouette
│   │   ├── mess-tiffin.png   # High-fidelity project screenshot
│   │   └── smart-pothole.png # High-fidelity project screenshot
│   ├── components/
│   │   ├── Background3D.tsx  # Three.js R3F Canvas scene
│   │   ├── CustomCursor.tsx  # Smooth spring cursor follower
│   │   ├── Loader.tsx        # Percentage load visual screen
│   │   ├── Navbar.tsx        # Floating sticky nav with scroll observer
│   │   ├── Hero.tsx          # Large titles & parallax portrait
│   │   ├── About.tsx         # Bio, stats, & horizontal timeline
│   │   ├── Skills.tsx        # Filtering cards (no progress bars)
│   │   ├── Projects.tsx      # Macbook CSS mockups with scroll-on-hover
│   │   ├── Github.tsx        # Open source stats and contribution grid
│   │   ├── Contact.tsx       # EmailJS form with success confetti
│   │   └── Footer.tsx        # Back-to-top & copyright controls
│   ├── utils/
│   │   └── ambientAudio.ts   # Generative Web Audio synthesizer
│   ├── App.tsx               # Main orchestrator & Lenis bootstrap
│   ├── index.css             # Tailwind v4 theme & utility stylesheet
│   └── main.tsx              # React mounting root
├── index.html                # SEO metadata & google font preconnects
├── package.json              # Dependencies (React 19, R3F, GSAP, etc.)
├── postcss.config.js         # PostCSS Tailwind v4 compiler adapter
└── vite.config.ts            # Vite bundle settings
```

---

## 🛠️ Local Development

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **NPM** installed.

### 2. Installation
Clone this workspace and run:
```bash
npm install --legacy-peer-deps
```

### 3. Run Development Server
Boot up the Vite dev server locally:
```bash
npm run dev
```

### 4. Build for Production
Compile and minify assets into the `dist/` directory:
```bash
npm run build
```

---

## 🚀 Deployment Instructions

This project compiles into a single-page static application (SPA) and can be deployed instantly:

### Deploying to Vercel
1. Install the Vercel CLI or import your repository directly on the [Vercel Dashboard](https://vercel.com).
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables (optional, for EmailJS):
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

### Deploying to Netlify
1. Connect your repository on the [Netlify Dashboard](https://netlify.com).
2. Use build command `npm run build` and publish directory `dist`.
3. Set your custom domain name.
