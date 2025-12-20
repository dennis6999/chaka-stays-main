
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Home, User } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <div className="chaka-container text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full inline-flex items-center border border-white/10">
            <MapPin className="h-4 w-4 text-secondary mr-2" />
            <span className="font-medium text-sm tracking-wide uppercase">Discover Chaka Town</span>
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
          Experience the Heart of <span className="text-secondary italic">Kenya</span>
        </h2>

        <p className="text-xl max-w-2xl mx-auto mb-12 text-white/70 font-light leading-relaxed">
          Book your perfect accommodation in vibrant Chaka Town. Convenient access to local attractions
          including the famous Chaka Ranch near the Railway Station.
        </p>

        <div className="flex justify-center mb-16">
          <a
            href="https://maps.app.goo.gl/kQNXn3mcfVRnNKwH8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm rounded-full transition-all duration-300 group"
          >
            <MapPin className="h-5 w-5 text-secondary mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Visit Chaka Ranch on Google Maps</span>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="h-14 w-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Home className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3">List Your Property</h3>
            <p className="mb-8 text-white/60 leading-relaxed">Become a host and share your space with travelers from around the world. Join our growing community covering Chaka.</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white w-full h-12 text-lg">
              <Link to="/list-property">Start Hosting</Link>
            </Button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="h-14 w-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3">Explore Properties</h3>
            <p className="mb-8 text-white/60 leading-relaxed">Find your perfect stay in Chaka Town with our curated selection of properties. Comfort meets elegance.</p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white w-full h-12 text-lg">
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
