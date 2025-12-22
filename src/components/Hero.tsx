import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import SearchForm from './SearchForm';

const Hero = () => {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like effect - Optimized for mobile */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 md:scale-105 will-change-transform"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2649&auto=format&fit=crop')", // Lush forest resort
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" /> {/* Reduced blur for performance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F25] via-black/40 to-black/30" /> {/* Stronger bottom gradient for text readability */}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-24 md:pt-40">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in leading-relaxed">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs md:text-sm font-medium tracking-wide mb-2 animate-fade-in delay-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            Original Kenyan Sanctuaries
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-tight md:leading-[1.1] tracking-tight drop-shadow-2xl text-shadow-lg">
            Unwind in <br className="hidden sm:block" />
            <span className="italic text-secondary font-light">nature's</span> embrace
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-white/90 max-w-xl mx-auto font-light leading-relaxed drop-shadow-md px-2">
            Discover handpicked stays in Chaka that blend modern luxury with the raw beauty of the wild.
          </p>

          <div className="pt-6 md:pt-8 w-full max-w-2xl mx-auto transform translate-y-0 transition-all md:hover:-translate-y-1 duration-500">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl ring-1 ring-white/10">
              <SearchForm />
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-white/70 text-[10px] md:text-sm font-light tracking-widest uppercase">
            <span>Cabin</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span>Cottage</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span>Villa</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </div>
  );
};

export default Hero;
