import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Search, Home } from 'lucide-react';
import SearchForm from './SearchForm';

const Hero = () => {
  return (
    <div className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex flex-col items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1580235078962-43ab08e8f04d?q=80&w=1770&auto=format&fit=crop')",
          backgroundPosition: "center",
          filter: "brightness(0.65)"
        }} 
      />
      
      {/* Colorful Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-accent/30" />
      
      {/* Content */}
      <div className="chaka-container relative z-10 px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/80 text-white rounded-full mb-4 sm:mb-6 backdrop-blur-sm shadow-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base font-medium">Chaka Town, Nyeri County, Kenya</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
            Find Your Perfect <span className="text-secondary">Chaka Stay</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl drop-shadow-md">
            Experience authentic Kenyan hospitality with comfortable, locally-hosted accommodations near Chaka Ranch and Railway Station.
          </p>

          {/* Integrated Search Form */}
          <div className="mb-6 sm:mb-8 w-full">
            <SearchForm />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
              <Link to="/properties">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                Browse Properties
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-accent/80 border-white text-white hover:bg-accent gap-2 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
              <Link to="/list-property">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                List Your Property
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral/40 to-transparent" />
    </div>
  );
};

export default Hero;
