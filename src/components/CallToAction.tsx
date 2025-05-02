
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Home, User } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-accent text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/diagonal-waves.png')",
          backgroundSize: "400px"
        }} 
      />
      
      <div className="chaka-container text-center relative z-10">
        <div className="mb-6 flex justify-center">
          <div className="px-5 py-2 bg-primary/80 rounded-full inline-flex items-center">
            <MapPin className="h-5 w-5 text-white mr-2" />
            <span className="font-medium">Discover Chaka Town</span>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Experience the Heart of <span className="text-secondary">Kenya</span>
        </h2>
        
        <p className="text-xl max-w-2xl mx-auto mb-10 text-white/90">
          Book your perfect accommodation in vibrant Chaka Town. Convenient access to local attractions 
          including the famous Chaka Ranch near the Railway Station.
        </p>
        
        <div className="flex justify-center mb-10">
          <a 
            href="https://maps.app.goo.gl/kQNXn3mcfVRnNKwH8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-colors"
          >
            <MapPin className="h-5 w-5 text-secondary mr-3" />
            <span className="font-medium">Visit Chaka Ranch on Google Maps</span>
          </a>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <Home className="h-10 w-10 text-secondary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-3">List Your Property</h3>
            <p className="mb-5 text-white/80">Become a host and share your space with travelers from around the world.</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white w-full">
              <Link to="/list-property">Start Hosting</Link>
            </Button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <User className="h-10 w-10 text-secondary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-3">Explore Properties</h3>
            <p className="mb-5 text-white/80">Find your perfect stay in Chaka Town with our curated selection of properties.</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white w-full">
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
