import { useState } from 'react';
import { Copy, Check, FileCode, FolderTree, Code, Layers, FileSpreadsheet, Sparkles } from 'lucide-react';

export default function WordPressAssets() {
  const [activeTab, setActiveTab] = useState<'guide' | 'functions' | 'html' | 'css' | 'js' | 'three'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const folderStructure = `wp-content/themes/your-child-theme/
├── functions.php              <-- Add enqueuing script here
├── style.css                  <-- Add custom landing page styles
└── js/
    ├── three-init.js          <-- Three.js scene initializer
    └── loader.js              <-- Page fade-in and interaction controller

wp-content/uploads/
└── 3d-models/
    └── bolly-shampoo.glb     <-- Upload your GLB/GLTF bottle model here`;

  const functionsPhp = `<?php
/**
 * Bolly Shampoo 3D Landing Page - Asset Enqueuer
 * Place this in your child theme's functions.php file.
 */

function enqueue_bolly_shampoo_assets() {
    // Only load on the specific landing page for performance optimization
    if ( is_page( 'bolly-shampoo-landing' ) || is_front_page() ) {
        
        // Enqueue latest Three.js from official CDN
        wp_enqueue_script(
            'three-js', 
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 
            array(), 
            '128', 
            true
        );

        // Enqueue GLTFLoader
        wp_enqueue_script(
            'three-gltf-loader', 
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', 
            array('three-js'), 
            '128', 
            true
        );

        // Enqueue OrbitControls
        wp_enqueue_script(
            'three-orbit-controls', 
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', 
            array('three-js'), 
            '128', 
            true
        );

        // Enqueue custom 3D initializer
        wp_enqueue_script(
            'bolly-three-init', 
            get_stylesheet_directory_uri() . '/js/three-init.js', 
            array('three-js', 'three-gltf-loader', 'three-orbit-controls'), 
            '1.0.0', 
            true
        );

        // Pass theme directory or custom upload paths dynamically to JS
        wp_localize_script('bolly-three-init', 'bollySettings', array(
            'modelUrl' => wp_get_attachment_url(get_theme_mod('bolly_glb_attachment_id')) ?: content_url('/uploads/3d-models/bolly-shampoo.glb'),
            'themeUrl' => get_stylesheet_directory_uri()
        ));

        // Enqueue page interactions & animations script
        wp_enqueue_script(
            'bolly-loader', 
            get_stylesheet_directory_uri() . '/js/loader.js', 
            array(), 
            '1.0.0', 
            true
        );

        // Enqueue custom styles
        wp_enqueue_style(
            'bolly-custom-styles', 
            get_stylesheet_directory_uri() . '/style.css', 
            array(), 
            '1.0.0'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_bolly_shampoo_assets' );
`;

  const htmlWidget = `<!-- Bolly Shampoo Landing Page HTML structure for Elementor Custom HTML Widget -->
<div class="bolly-landing bg-noise font-sans min-h-screen flex flex-col justify-between text-brand-dark">
  
  <!-- Main Hero Grid -->
  <main class="hero-container max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-grow">
    
    <!-- LEFT SIDE: Big Bold Message -->
    <div class="lg:col-span-4 flex flex-col justify-center text-left space-y-6 animate-fade-in-left">
      <div class="badge-wrapper flex items-center gap-2">
        <span class="text-[11px] font-extrabold uppercase tracking-widest text-brand-dark/70">FROM ROOT</span>
        <span class="bg-brand-purple text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">TO SHINE</span>
      </div>
      
      <h1 class="hero-heading text-6xl md:text-7xl lg:text-8xl font-display font-black leading-none tracking-tighter flex flex-col">
        <span>KNOCK</span>
        <span class="outline-text">OUT</span>
        <span>FLAKES</span>
      </h1>
      
      <p class="text-sm md:text-base text-brand-dark/60 font-medium max-w-xs leading-relaxed">
        Eliminate residue while treating your scalp to maximum nourishment and luxurious gloss.
      </p>
    </div>

    <!-- CENTER: Interactive 3D Shampoo Bottle container -->
    <div class="lg:col-span-4 relative flex items-center justify-center min-h-[450px] md:min-h-[550px] animate-fade-in-center">
      <!-- ThreeJS Canvas Mount Point -->
      <div id="threejs-canvas-container" class="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"></div>
      
      <!-- Interactive drag helper -->
      <div class="drag-guide absolute bottom-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-brand-purple/10 flex items-center gap-2 pointer-events-none">
        <span class="ping-dot"></span>
        <span class="text-[10px] uppercase font-bold tracking-widest text-brand-purple">DRAG TO SPIN • 3D INTERACTIVE</span>
      </div>
      
      <!-- Fallback Loading Indicator -->
      <div id="three-loader" class="absolute flex flex-col items-center justify-center">
        <div class="spinner border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-[10px] font-mono tracking-widest text-brand-purple">MOUNTING 3D SHAMPOO MODEL...</p>
      </div>
    </div>

    <!-- RIGHT SIDE: Exploring brand values -->
    <div class="lg:col-span-4 flex flex-col justify-center space-y-8 animate-fade-in-right">
      <div class="max-w-xs space-y-4">
        <p class="text-serif text-xl md:text-2xl font-semibold leading-snug italic text-brand-dark/80">
          "Journey into the wonderful world of shampoo"
        </p>
        <p class="text-xs text-brand-dark/50 leading-relaxed font-medium">
          Formulated with active scalp clarifying micro-crystals and calming organic botanicals to cleanse deeply without stripping your natural shine.
        </p>
      </div>

      <!-- Action Button -->
      <div class="btn-group flex items-center">
        <button class="explore-btn bg-brand-dark hover:bg-brand-purple text-white font-extrabold text-xs tracking-widest uppercase px-8 py-4 rounded-l-full transition-all duration-300">
          EXPLORE MORE
        </button>
        <div class="arrow-container bg-brand-lime text-brand-dark p-4 rounded-full -ml-3 z-10 shadow-md hover:scale-115 cursor-pointer transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transform rotate-45">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      </div>
    </div>
    
  </main>
</div>
`;

  const customCss = `/*
 * Custom CSS stylesheet for Bolly Shampoo Landing Page
 * Append these styles in Elementor Page Settings -> Advanced -> Custom CSS
 */

:root {
  --brand-purple: #6140d3;
  --brand-purple-light: #8258fa;
  --brand-lime: #d2f53c;
  --brand-cream: #faf9f6;
  --brand-dark: #121214;
}

/* Base resets & layouts */
.bolly-landing {
  background-color: var(--brand-cream);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.bg-noise {
  background-image: radial-gradient(circle at 50% 50%, rgba(97, 64, 211, 0.08) 0%, rgba(250, 249, 246, 0) 70%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
}

/* Headings & Typography */
.font-display {
  font-family: 'Anton', 'Archivo Black', sans-serif;
}

.text-serif {
  font-family: 'Playfair Display', Georgia, serif;
}

.hero-heading {
  font-size: clamp(3.5rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.04em;
  color: var(--brand-dark);
}

.outline-text {
  color: transparent;
  -webkit-text-stroke: 1px var(--brand-dark);
}

/* Interactive Drag Guide indicator */
.drag-guide {
  animation: bounce 2s infinite;
  box-shadow: 0 4px 12px rgba(97, 64, 211, 0.05);
}

.ping-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--brand-purple);
  position: relative;
}

.ping-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--brand-purple);
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Spinner loading animation */
.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Custom button hover triggers */
.explore-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 20px rgba(97, 64, 211, 0.2);
}

.arrow-container:hover {
  transform: rotate(45deg) scale(1.15);
  background-color: var(--brand-lime);
}

/* Keyframe animations */
@keyframes bounce {
  0%, 100% { transform: translateY(0) translateX(-50%); }
  50% { transform: translateY(-8px) translateX(-50%); }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Entrance Animations */
.animate-fade-in-left {
  opacity: 0;
  transform: translateX(-30px);
  animation: slideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-right {
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.2s;
}

.animate-fade-in-center {
  opacity: 0;
  transform: scale(0.95);
  animation: scaleIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.1s;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive constraints */
@media (max-width: 1024px) {
  .hero-container {
    text-align: center;
    grid-template-columns: 1fr !important;
    gap: 4rem;
  }
  .hero-container > div {
    align-items: center;
    text-align: center;
  }
  .hero-heading {
    text-align: center;
  }
  .btn-group {
    justify-content: center;
  }
}
`;

  const threeInitJs = `/**
 * Custom 3D Shampoo Bottle Scene initializer using Three.js
 * Saves into: wp-content/themes/your-child-theme/js/three-init.js
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('threejs-canvas-container');
    const loaderElement = document.getElementById('three-loader');
    if (!container) return;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.5);

    // 3. WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(-5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8e5ff, 0.9);
    fillLight.position.set(5, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // Shadow Plane under bottle for contact depth
    const shadowGeom = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.1;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 5. Build Group
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // --- PROCEDURAL HIGH RES BRANDING TEXTURE ---
    function buildProceduralTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Dark rich purple bottle base with subtle linear gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, '#4b2bc4');
        grad.addColorStop(0.25, '#6140d3');
        grad.addColorStop(0.5, '#7b5af0');
        grad.addColorStop(0.75, '#6140d3');
        grad.addColorStop(1, '#3a1ba1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Brush noise highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        for (let i = 0; i < 600; i++) {
            const h = Math.random() * canvas.height;
            ctx.fillRect(0, h, canvas.width, 1 + Math.random() * 2);
        }

        const centerX = canvas.width / 2;

        // Label Header
        ctx.fillStyle = '#d2f53c';
        ctx.font = '800 24px "Outfit", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '4px';
        ctx.fillText('NATURALLY DERIVED • HAIRCARE', centerX, 300);

        // Logo
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 170px "Outfit", sans-serif';
        ctx.fillText('bolly', centerX, 440);

        // Subtitles
        ctx.fillStyle = '#ffffff';
        ctx.font = '300 48px "Outfit", sans-serif';
        ctx.fillText('Clarify', centerX, 550);
        ctx.font = '500 42px "Outfit", sans-serif';
        ctx.fillText('Shampoo', centerX, 600);

        // Fineprint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '300 24px sans-serif';
        ctx.fillText('For Dull & Flaky Scalps • Deep Cleanse', centerX, 680);
        ctx.fillText('Fortified with Pro-Vitamin B5', centerX, 715);

        // Liquid Volume
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '600 26px "Outfit", sans-serif';
        ctx.fillText('350ml e 11.8 fl. oz.', centerX, 810);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        return tex;
    }

    const brandingTexture = buildProceduralTexture();

    // OPTIONAL: GLTF Model Loading Fallback
    // If you upload the bolly-shampoo.glb model to your WordPress site:
    const useGltfModel = false; // Toggle to true to load local GLB

    if (useGltfModel && typeof GLTFLoader !== 'undefined' && window.bollySettings) {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(window.bollySettings.modelUrl, function(gltf) {
            const model = gltf.scene;
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    // Auto-apply materials if needed
                }
            });
            // Scale and center loaded model
            model.scale.set(1.5, 1.5, 1.5);
            model.position.y = -1;
            bottleGroup.add(model);
            if (loaderElement) loaderElement.style.opacity = '0';
        }, undefined, function(err) {
            console.warn("Failed loading GLTF, falling back to procedural 3D bottle.", err);
            generateProceduralModel();
        });
    } else {
        // Fallback or default high-fidelity procedural geometry
        generateProceduralModel();
    }

    function generateProceduralModel() {
        const purpleMat = new THREE.MeshStandardMaterial({
            map: brandingTexture,
            roughness: 0.18,
            metalness: 0.08
        });

        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xf6f6f9,
            roughness: 0.35,
            metalness: 0.05
        });

        const silverMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.15,
            metalness: 0.8
        });

        // Main Bottle Cylinders
        const bodyGeom = new THREE.CylinderGeometry(1.5, 1.5, 2.7, 64);
        const bodyMesh = new THREE.Mesh(bodyGeom, purpleMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        bottleGroup.add(bodyMesh);

        const topCap = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.2, 64), purpleMat);
        topCap.position.y = 1.45;
        bottleGroup.add(topCap);

        const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 0.2, 64), purpleMat);
        bottomCap.position.y = -1.45;
        bottleGroup.add(bottomCap);

        // White Pump Collar
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.35, 32), whiteMat);
        collar.position.y = 1.7;
        collar.castShadow = true;
        bottleGroup.add(collar);

        // Metal Stalk
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16), silverMat);
        stalk.position.y = 2.0;
        stalk.castShadow = true;
        bottleGroup.add(stalk);

        // White Actuator Spout
        const spoutBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.4, 32), whiteMat);
        spoutBase.position.y = 2.25;
        bottleGroup.add(spoutBase);

        // Curved nozzle
        const nozzleGeom = new THREE.BoxGeometry(1.3, 0.16, 0.3);
        const nozzleMesh = new THREE.Mesh(nozzleGeom, whiteMat);
        nozzleMesh.position.set(-0.6, 2.3, 0);
        nozzleMesh.rotation.z = 0.05;
        nozzleMesh.castShadow = true;
        bottleGroup.add(nozzleMesh);

        // Set initial orientation
        bottleGroup.rotation.y = Math.PI * 0.95;
        bottleGroup.position.y = -0.3;

        if (loaderElement) {
            loaderElement.style.transition = 'opacity 0.5s ease';
            loaderElement.style.opacity = '0';
            setTimeout(() => loaderElement.remove(), 500);
        }
    }

    // 6. Camera Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.35;
    controls.maxPolarAngle = Math.PI * 0.65;

    // 7. Interaction States & Auto rotation
    const clock = new THREE.Clock();
    let isInteracting = false;
    let timerID;

    controls.addEventListener('start', () => {
        isInteracting = true;
        if (timerID) clearTimeout(timerID);
    });

    controls.addEventListener('end', () => {
        timerID = setTimeout(() => {
            isInteracting = false;
        }, 3500);
    });

    // 8. Animation Loop
    function render() {
        requestAnimationFrame(render);
        
        const elapsed = clock.getElapsedTime();
        
        // Soft floating bobbing
        bottleGroup.position.y = -0.3 + Math.sin(elapsed * 1.5) * 0.12;
        
        // Auto rotate when idle
        if (!isInteracting) {
            bottleGroup.rotation.y += 0.008;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    render();

    // 9. Resize handler
    window.addEventListener('resize', function() {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight || 500;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
});
`;

  const loaderJs = `/**
 * Custom loader.js for adding rich UI transitions, scroll animations, 
 * and mouse-move effects to your WordPress elementor landing page.
 * Saves into: wp-content/themes/your-child-theme/js/loader.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elegant reveal animations for text headings
    const elementsToAnimate = document.querySelectorAll('.animate-fade-in-left, .animate-fade-in-right, .animate-fade-in-center');
    
    // Stagger item display initially
    elementsToAnimate.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = el.classList.contains('animate-fade-in-left') ? 'translateX(-30px)' : 
                            el.classList.contains('animate-fade-in-right') ? 'translateX(30px)' : 'scale(0.95)';
    });

    // Page Entrance Trigger
    setTimeout(() => {
        elementsToAnimate.forEach((el) => {
            el.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translate(0) scale(1)';
        });
    }, 150);

    // Track mouse coordinates for interactive page depth effect (parallax)
    const heroSection = document.querySelector('.bolly-landing');
    if (heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Normalize coordinates between -0.5 and 0.5
            const mouseX = (e.clientX / width) - 0.5;
            const mouseY = (e.clientY / height) - 0.5;
            
            // Move subtle gradient glow based on mouse coordinates
            const radialBg = document.querySelector('.bg-noise');
            if (radialBg) {
                const shiftX = mouseX * 25; // max 25px offset
                const shiftY = mouseY * 25;
                radialBg.style.backgroundPosition = \`calc(50% + \${shiftX}px) calc(50% + \${shiftY}px)\`;
            }
        });
    }

    // Connect Explore Button to anchor actions
    const exploreBtn = document.querySelector('.explore-btn');
    const arrowBtn = document.querySelector('.arrow-container');
    
    function triggerAction() {
        // Scroll elegantly down or open details modal
        alert("Thank you for your interest! Explore More would redirect the user to your Elementor Shop or Product Detail Page.");
    }

    if (exploreBtn) exploreBtn.addEventListener('click', triggerAction);
    if (arrowBtn) arrowBtn.addEventListener('click', triggerAction);
});
`;

  return (
    <div className="bg-brand-dark text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 max-w-5xl mx-auto my-12 font-sans overflow-hidden">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-brand-purple text-xs font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 text-white">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" /> WordPress Asset Suite
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 text-white">
            <FileCode className="w-7 h-7 text-brand-lime" /> Production-Ready Source Code
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            This module delivers ready-to-paste assets for enqueuing, styling, and rendering the 3D container directly in an **Elementor HTML Widget**.
          </p>
        </div>
        
        {/* Tab Controls (Sub-Selector) */}
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guide' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'functions' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            functions.php
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'html' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Elementor HTML
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'css' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            style.css
          </button>
          <button
            onClick={() => setActiveTab('three')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'three' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            three-init.js
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'js' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            loader.js
          </button>
        </div>
      </div>

      {/* Content Renderer */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Setup Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-brand-lime flex items-center gap-2 mb-3">
                <FolderTree className="w-5 h-5" /> Target Child Theme Folder Structure
              </h3>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                We strongly recommend placing custom scripts inside a secure **child theme** subdirectory to prevent theme updates from overwriting your custom 3D model enqueuing code.
              </p>
              <pre className="bg-black/40 text-brand-lime font-mono text-xs p-4 rounded-xl overflow-x-auto border border-white/5 leading-relaxed">
                {folderStructure}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-lime font-extrabold text-xs tracking-widest uppercase">STEP 1</span>
                <h4 className="font-bold text-sm mt-1 mb-1.5 text-white">Paste Theme Functions</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Copy the code in the **functions.php** tab and paste it into the footer of your child theme's <code className="text-brand-purple-light font-mono">functions.php</code> file.
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-lime font-extrabold text-xs tracking-widest uppercase">STEP 2</span>
                <h4 className="font-bold text-sm mt-1 mb-1.5 text-white">Create Asset Files</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Create <code className="text-brand-purple-light font-mono">js/three-init.js</code> and <code className="text-brand-purple-light font-mono">js/loader.js</code> in your child theme, pasting their corresponding tabs' codes.
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-brand-lime font-extrabold text-xs tracking-widest uppercase">STEP 3</span>
                <h4 className="font-bold text-sm mt-1 mb-1.5 text-white">Build Elementor Page</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Add an **Elementor HTML Widget** to your layout, paste the **Elementor HTML** content, and apply the custom styling in Page Settings CSS!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Functions.php Tab */}
        {activeTab === 'functions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">wp-content/themes/your-child-theme/functions.php</span>
              <button
                onClick={() => handleCopy(functionsPhp, 'functions')}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'functions' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 font-mono text-[11px] md:text-xs p-5 rounded-xl overflow-x-auto border border-white/5 max-h-[400px] leading-relaxed">
              <code>{functionsPhp}</code>
            </pre>
          </div>
        )}

        {/* HTML Widget Tab */}
        {activeTab === 'html' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">Elementor HTML Widget Custom Content</span>
              <button
                onClick={() => handleCopy(htmlWidget, 'html')}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'html' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 font-mono text-[11px] md:text-xs p-5 rounded-xl overflow-x-auto border border-white/5 max-h-[400px] leading-relaxed">
              <code>{htmlWidget}</code>
            </pre>
          </div>
        )}

        {/* CSS Tab */}
        {activeTab === 'css' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">wp-content/themes/your-child-theme/style.css (or Elementor Custom CSS)</span>
              <button
                onClick={() => handleCopy(customCss, 'css')}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'css' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 font-mono text-[11px] md:text-xs p-5 rounded-xl overflow-x-auto border border-white/5 max-h-[400px] leading-relaxed">
              <code>{customCss}</code>
            </pre>
          </div>
        )}

        {/* Three Init Tab */}
        {activeTab === 'three' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">wp-content/themes/your-child-theme/js/three-init.js</span>
              <button
                onClick={() => handleCopy(threeInitJs, 'three')}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'three' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 font-mono text-[11px] md:text-xs p-5 rounded-xl overflow-x-auto border border-white/5 max-h-[400px] leading-relaxed">
              <code>{threeInitJs}</code>
            </pre>
          </div>
        )}

        {/* JS Loader Tab */}
        {activeTab === 'js' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">wp-content/themes/your-child-theme/js/loader.js</span>
              <button
                onClick={() => handleCopy(loaderJs, 'js')}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'js' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 font-mono text-[11px] md:text-xs p-5 rounded-xl overflow-x-auto border border-white/5 max-h-[400px] leading-relaxed">
              <code>{loaderJs}</code>
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
