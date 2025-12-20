
import React from 'react';
import Map from './Map';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const MapSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="chaka-container">
        <div className="flex flex-col md:flex-row md:items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center px-4 py-2 bg-neutral/10 text-foreground rounded-full mb-6">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium text-sm">Explore Chaka Town</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
              Find Your Way Around <span className="text-primary italic">Chaka</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Located in Nyeri County, Chaka Town offers a perfect blend of urban conveniences and rural charm. Discover accommodations near popular spots like Chaka Ranch and the Railway Station.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-lg h-12 px-8">
              <Link to="/properties">
                Browse Nearby Properties
              </Link>
            </Button>
          </div>
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Map location="Chaka Ranch, Nyeri" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
