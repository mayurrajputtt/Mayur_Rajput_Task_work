import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Shampoo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 500;

    // Create Scene
    const scene = new THREE.Scene();

    // Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera slightly lower and looking up for a premium angle
    camera.position.set(0, 0.5, 7.5);

    // Create Renderer with transparency and antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    containerRef.current.appendChild(renderer.domElement);

    // --- PROCEDURAL BRANDED TEXTURE ---
    const createBottleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Premium Deep Purple base gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#5b21b6');
      grad.addColorStop(0.25, '#7c3aed');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(0.75, '#7c3aed');
      grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle noise/brushed effect to the texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      for (let i = 0; i < 500; i++) {
        const h = Math.random() * canvas.height;
        ctx.fillRect(0, h, canvas.width, 1 + Math.random() * 2);
      }

      // Draw text elements
      // Center of wrapping front side is at around 0.5 (180 degrees)
      const centerX = canvas.width * 0.5;

      // 1. Label "NATURALLY DERIVED HAIRCARE"
      ctx.fillStyle = '#d2f53c'; // Neon lime-green
      ctx.font = '800 24px "Outfit", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '4px';
      ctx.fillText('NATURALLY DERIVED • HAIRCARE', centerX, 300);

      // 2. Bold "bolly" branding
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 170px "Outfit", "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '-2px';
      ctx.fillText('bolly', centerX, 440);

      // 3. Product Sub-line
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 48px "Outfit", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('Clarify', centerX, 550);

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 42px "Outfit", sans-serif';
      ctx.fillText('Shampoo', centerX, 600);

      // 4. Details list
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '300 24px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('For Dull & Flaky Scalps • Deep Cleanse', centerX, 680);
      ctx.fillText('Fortified with Pro-Vitamin B5', centerX, 715);

      // 5. Volume indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '600 26px "Outfit", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('350ml e 11.8 fl. oz.', centerX, 810);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.x = 1;
      return texture;
    };

    const texture = createBottleTexture();

    // --- BOTTLE MODEL ASSEMBLY ---
    const bottleGroup = new THREE.Group();

    // Materials
    const bottleMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.08,
      bumpScale: 0.05,
    });

    const whitePlasticMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6f6f9,
      roughness: 0.3,
      metalness: 0.05,
    });

    const silverMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.2,
      metalness: 0.8,
    });

    // 1. Bottle Body (Wide cylinder with smooth round bevel effect)
    const bodyGeom = new THREE.CylinderGeometry(1.5, 1.5, 2.7, 64, 1, false);
    const bodyMesh = new THREE.Mesh(bodyGeom, bottleMaterial);
    bodyMesh.position.y = 0;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // 2. Rounded Top Shoulder
    const topCapGeom = new THREE.CylinderGeometry(1.3, 1.5, 0.2, 64);
    const topCapMesh = new THREE.Mesh(topCapGeom, bottleMaterial);
    topCapMesh.position.y = 1.45;
    bottleGroup.add(topCapMesh);

    // 3. Rounded Bottom Cap
    const bottomCapGeom = new THREE.CylinderGeometry(1.5, 1.3, 0.2, 64);
    const bottomCapMesh = new THREE.Mesh(bottomCapGeom, bottleMaterial);
    bottomCapMesh.position.y = -1.45;
    bottleGroup.add(bottomCapMesh);

    // 4. White Screw Collar/Cap
    const capGeom = new THREE.CylinderGeometry(0.55, 0.58, 0.35, 32);
    const capMesh = new THREE.Mesh(capGeom, whitePlasticMaterial);
    capMesh.position.y = 1.7;
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

    // 5. Metal Pump Rod (Thin piston)
    const stemGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
    const stemMesh = new THREE.Mesh(stemGeom, silverMetalMaterial);
    stemMesh.position.y = 2.0;
    stemMesh.castShadow = true;
    bottleGroup.add(stemMesh);

    // 6. White Pump Head/Actuator (Extruded curved shape for realism)
    const pumpHeadGroup = new THREE.Group();
    
    // Core base of pump head
    const pumpBaseGeom = new THREE.CylinderGeometry(0.35, 0.32, 0.4, 32);
    const pumpBaseMesh = new THREE.Mesh(pumpBaseGeom, whitePlasticMaterial);
    pumpBaseMesh.position.y = 2.25;
    pumpHeadGroup.add(pumpBaseMesh);

    // Long curved spout (pointing to the left)
    const spoutShape = new THREE.Shape();
    spoutShape.moveTo(0, 0.2);
    spoutShape.lineTo(-1.3, 0.1); // tapered tip
    spoutShape.quadraticCurveTo(-1.4, 0.05, -1.4, 0); // round nozzle tip
    spoutShape.quadraticCurveTo(-1.4, -0.05, -1.3, -0.1);
    spoutShape.lineTo(0, -0.15);
    spoutShape.lineTo(0, 0.2);

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    };

    const spoutGeom = new THREE.ExtrudeGeometry(spoutShape, extrudeSettings);
    // Center the extruded geometry slightly on Z axis
    spoutGeom.center();
    const spoutMesh = new THREE.Mesh(spoutGeom, whitePlasticMaterial);
    spoutMesh.position.set(-0.6, 2.3, 0);
    spoutMesh.rotation.z = 0.05; // slight elegant downward angle
    spoutMesh.castShadow = true;
    pumpHeadGroup.add(spoutMesh);

    bottleGroup.add(pumpHeadGroup);

    // Rotate bottle slightly to face the main branding beautifully
    bottleGroup.rotation.y = Math.PI * 0.95;
    bottleGroup.position.y = -0.3; // align center visually
    scene.add(bottleGroup);

    // --- STUDIO LIGHTING SETUP ---
    // 1. Ambient Light for basic brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // 2. Key Light (Soft, strong, white from front-left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(-5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // 3. Fill Light (Warm, soft light from front-right)
    const fillLight = new THREE.DirectionalLight(0xe8e5ff, 0.9);
    fillLight.position.set(5, 3, 4);
    scene.add(fillLight);

    // 4. Back/Rim Light (Gives that crisp high-end edge illumination)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // 5. Floor Shadow Plane (creates a beautiful, realistic soft contact shadow under the bottle)
    const shadowPlaneGeom = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.1;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // --- CONTROLS SETUP ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevent zooming as requested
    controls.enablePan = false;  // Prevent panning as requested
    controls.minPolarAngle = Math.PI * 0.35; // lock vertical rotation slightly for design discipline
    controls.maxPolarAngle = Math.PI * 0.65;

    // --- ANIMATION / RENDER LOOP ---
    const clock = new THREE.Clock();
    let isUserInteracting = false;
    let interactionTimer: NodeJS.Timeout;

    // Detect user interaction to pause auto-rotation gracefully
    controls.addEventListener('start', () => {
      isUserInteracting = true;
      setIsGrabbing(true);
      if (interactionTimer) clearTimeout(interactionTimer);
    });

    controls.addEventListener('end', () => {
      setIsGrabbing(false);
      // Wait 3.5 seconds of idle time before resuming auto-rotation
      interactionTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 3500);
    });

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle floating animation
      bottleGroup.position.y = -0.3 + Math.sin(elapsedTime * 1.5) * 0.12;
      
      // Auto-rotation when idle
      if (!isUserInteracting) {
        bottleGroup.rotation.y += 0.008;
      }

      // Rotate spout slightly differently for subtle dynamic depth if desired (or keep static)
      controls.update();
      renderer.render(scene, camera);
    };

    // Start loading state end transition
    setLoading(false);
    animate();

    // --- RESPONSIVE RESIZE HANDLING ---
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight || 500;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Clear resources on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
      bottleGeomDispose(bodyGeom);
      bottleGeomDispose(topCapGeom);
      bottleGeomDispose(bottomCapGeom);
      bottleGeomDispose(capGeom);
      bottleGeomDispose(stemGeom);
      bottleGeomDispose(pumpBaseGeom);
      bottleGeomDispose(spoutGeom);
      bottleGeomDispose(shadowPlaneGeom);
      
      bottleMaterial.dispose();
      whitePlasticMaterial.dispose();
      silverMetalMaterial.dispose();
      shadowPlaneMat.dispose();
      if (texture) texture.dispose();
    };

    function bottleGeomDispose(geom: THREE.BufferGeometry) {
      geom.dispose();
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] md:min-h-[500px] flex items-center justify-center">
      {/* Interactive 3D Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full max-w-full cursor-grab active:cursor-grabbing transition-opacity duration-700 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ cursor: isGrabbing ? 'grabbing' : 'grab' }}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-mono text-brand-purple/70 tracking-widest">LOADING 3D BOTTLE...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 rounded-2xl text-center border border-red-100">
          <p className="text-red-500 font-medium mb-2">Could not render 3D canvas</p>
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Interactive Floating Drag Guide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-brand-purple/10 pointer-events-none flex items-center gap-2 animate-bounce">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-purple animate-ping" />
        <span className="text-[10px] md:text-xs font-medium text-brand-purple tracking-wider uppercase font-sans">
          Drag to spin • Real 3D Model
        </span>
      </div>
    </div>
  );
}
