import { useState } from 'react';
import { ShoppingBag, ArrowUpRight, Menu, X, Sparkles, Layers, BookOpen, HeartHandshake } from 'lucide-react';
import Shampoo3D from './components/Shampoo3D';
import WordPressAssets from './components/WordPressAssets';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-brand-cream bg-noise text-brand-dark flex flex-col justify-between font-sans selection:bg-brand-purple/20 relative overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between relative z-50">
        
        {/* Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <span className="text-3xl font-display font-extrabold tracking-tighter text-brand-dark group-hover:text-brand-purple transition-colors duration-300">
            bolly
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-lime group-hover:scale-125 transition-transform duration-300"></span>
        </div>

        {/* Centered Rounded Navigation Container */}
        <nav className="hidden md:flex items-center bg-brand-purple-light hover:bg-brand-purple px-6 py-2.5 rounded-full shadow-lg border border-white/10 transition-all duration-300">
          <ul className="flex items-center gap-8 text-[13px] font-bold tracking-wider text-white uppercase">
            <li className="hover:text-brand-lime cursor-pointer transition-colors flex items-center gap-0.5">
              Shop <span className="text-[10px] text-brand-lime font-black">+</span>
            </li>
            <li className="hover:text-brand-lime cursor-pointer transition-colors">About</li>
            <li className="hover:text-brand-lime cursor-pointer transition-colors">Blog</li>
            <li className="hover:text-brand-lime cursor-pointer transition-colors">Contact</li>
          </ul>
        </nav>

        {/* Cart Container (Right Side) */}
        <div className="flex items-center gap-4">
          <div 
            onClick={handleAddToCart}
            className="flex items-center gap-3 cursor-pointer group hover:scale-105 transition-all duration-300"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/80 group-hover:text-brand-purple transition-colors">
              Cart
            </span>
            <div className="relative w-10 h-10 rounded-full bg-brand-lime hover:bg-brand-lime-dark flex items-center justify-center shadow-md transition-colors duration-300">
              <ShoppingBag className="w-4 h-4 text-brand-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-purple text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-brand-cream">
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-brand-purple/10 text-brand-dark transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-sm bg-brand-cream h-full p-8 shadow-2xl flex flex-col justify-between border-l border-brand-purple/10">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-extrabold tracking-tighter">bolly</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-dark transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ul className="space-y-6 text-xl font-bold uppercase tracking-widest text-brand-dark/80">
                <li onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-purple cursor-pointer flex items-center gap-1">
                  Shop <span className="text-sm text-brand-purple font-black">+</span>
                </li>
                <li onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-purple cursor-pointer">About</li>
                <li onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-purple cursor-pointer">Blog</li>
                <li onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-purple cursor-pointer">Contact</li>
              </ul>
            </div>

            <div className="bg-brand-purple/5 p-6 rounded-2xl border border-brand-purple/10 text-center space-y-4">
              <p className="text-xs font-semibold text-brand-purple tracking-widest uppercase">NATURAL SCALPA CARE</p>
              <h4 className="font-serif italic text-lg text-brand-dark/80">"Healthy hair begins at the roots"</h4>
              <button 
                onClick={() => { setMobileMenuOpen(false); handleAddToCart(); }}
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold tracking-widest py-3.5 rounded-full uppercase transition-colors duration-300"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN HERO SECTION */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-grow">
        
        {/* COLUMN 1: LEFT SIDE (Heading & Badge) */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1 lg:pr-4">
          
          {/* Badge */}
          <div className="flex items-center gap-1 bg-brand-purple/5 border border-brand-purple/10 self-start px-1.5 py-1 rounded-full">
            <span className="text-[10px] md:text-11px font-extrabold uppercase tracking-widest text-brand-dark/60 pl-2.5">
              FROM ROOT
            </span>
            <span className="bg-brand-purple text-white text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-brand-lime" /> TO SHINE
            </span>
          </div>

          {/* Heading Stack */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black leading-[0.85] tracking-tighter text-brand-dark flex flex-col uppercase select-none">
            <span className="block transform hover:translate-x-2 transition-transform duration-300">KNOCK</span>
            <span className="block text-stroke text-brand-dark font-black transform hover:-translate-x-2 transition-transform duration-300">OUT</span>
            <span className="block text-brand-purple transform hover:scale-105 origin-left transition-transform duration-300">FLAKES</span>
          </h1>

          {/* Small Body text */}
          <p className="text-sm md:text-base text-brand-dark/70 font-medium max-w-sm leading-relaxed">
            Unleash clinical strength flake elimination packed with botanical organic oils. Purify your scalp, amplify your shine.
          </p>

          {/* Ingredient Highlights */}
          <div className="flex items-center gap-6 pt-2 text-xs font-bold uppercase tracking-wider text-brand-dark/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-purple" /> Tea Tree Oil
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-lime" /> Keratin Boost
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER (Interactive 3D Bottle) */}
        <div className="lg:col-span-4 relative flex items-center justify-center min-h-[420px] md:min-h-[500px] order-1 lg:order-2">
          {/* Glowing Atmospheric Backdrops */}
          <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-brand-purple/10 blur-[100px] pointer-events-none" />
          <div className="absolute w-48 h-48 rounded-full bg-brand-lime/10 blur-[80px] pointer-events-none -bottom-8" />
          
          {/* Decorative Immersive Background Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[400px] md:h-[400px] border border-brand-purple/10 rounded-full -z-10 opacity-60 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[550px] md:h-[550px] border border-brand-purple/5 rounded-full -z-10 opacity-40 pointer-events-none" />
          
          {/* Interactive Three.js Mount Point */}
          <Shampoo3D />
        </div>

        {/* COLUMN 3: RIGHT SIDE (Quote & Button) */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-8 text-left order-3 lg:order-3 lg:pl-4">
          
          <div className="space-y-4 max-w-xs">
            {/* Serif italicized quote */}
            <h3 className="font-serif italic text-2xl md:text-3xl text-brand-dark/90 leading-snug">
              "Journey into the wonderful world of shampoo"
            </h3>
            
            {/* Context support paragraph */}
            <p className="text-xs text-brand-dark/60 leading-relaxed font-medium">
              We focus on scalp health first. By removing impurities and styling residues, we prepare your follicles to receive full micro-nutrient benefits.
            </p>
          </div>

          {/* Custom Action Button Grid */}
          <div 
            onClick={handleAddToCart}
            className="flex items-center self-start group cursor-pointer"
          >
            <button className="bg-brand-dark hover:bg-brand-purple text-white font-extrabold text-[11px] md:text-xs tracking-widest uppercase px-8 py-4.5 rounded-l-full transition-all duration-300 shadow-lg flex items-center gap-2">
              ADD TO BAG
            </button>
            <div className="bg-brand-lime text-brand-dark p-4 rounded-full -ml-3.5 z-10 shadow-lg group-hover:scale-110 group-hover:bg-brand-lime group-hover:text-brand-dark transform group-hover:rotate-45 transition-all duration-300 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-brand-purple/10 pt-6">
            <div>
              <p className="text-xl md:text-2xl font-display font-black text-brand-purple">98%</p>
              <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Flake Reduction</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-display font-black text-brand-purple">24H</p>
              <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Moisture Retention</p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER & DEVELOPER CONTROLLER */}
      <footer className="w-full bg-white/50 backdrop-blur-md border-t border-brand-purple/5 py-4 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright details */}
          <p className="text-xs text-brand-dark/50 font-semibold tracking-wider uppercase">
            © 2026 BOLLY COSMETICS CO. ALL RIGHTS RESERVED.
          </p>

          {/* Floating toggle for the developer assignment code assets panel */}
          <button
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="flex items-center gap-2 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-sm border border-brand-purple/10"
          >
            <Layers className="w-4 h-4" />
            {showDevPanel ? 'Collapse WordPress Code' : 'View WordPress Source Code'}
          </button>
        </div>

        {/* Expandable Asset Block with smooth transition */}
        <div className={`transition-all duration-700 overflow-hidden ${
          showDevPanel ? 'max-h-[3000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}>
          <WordPressAssets />
        </div>
      </footer>

    </div>
  );
}
