import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import SearchForm from './SearchForm';

const Hero = () => {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2649&auto=format&fit=crop')", // Lush forest resort
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" /> {/* Subtle blur for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F25]/90 via-black/20 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium tracking-wide mb-2 animate-fade-in delay-100">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            Original Kenyan Sanctuaries
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-[1.1] tracking-tight drop-shadow-2xl text-shadow">
            Unwind in <br />
            <span className="italic text-secondary font-light">nature's</span> embrace
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg drop-shadow-black/50 px-4">
            Discover handpicked stays in Chaka that blend modern luxury with the raw beauty of the wild.
          </p>

          <div className="pt-8 w-full max-w-2xl mx-auto transform translate-y-0 transition-all hover:-translate-y-1 duration-500">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-[2rem] shadow-2xl ring-1 ring-white/10">
              <SearchForm />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-center gap-2 text-white/60 text-sm font-light tracking-widest uppercase">
            <span>Cabin</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span>Cottage</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span>Villa</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </div>
  );
};

export default Hero;
