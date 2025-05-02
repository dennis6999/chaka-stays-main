
import React from 'react';
import Map from './Map';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const MapSection = () => {
  return (
    <section className="py-16 bg-neutral">
      <div className="chaka-container">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="font-medium">Explore Chaka Town</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Find Your Way Around <span className="text-primary">Chaka</span></h2>
            <p className="text-lg text-gray-600 mb-8">
              Located in Nyeri County, Chaka Town offers a perfect blend of urban conveniences and rural charm. Discover accommodations near popular spots like Chaka Ranch and the Railway Station.
            </p>
            <Button asChild className="bg-secondary hover:bg-secondary/90">
              <Link to="/properties">
                Browse Nearby Properties
              </Link>
            </Button>
          </div>
          <div className="flex-1">
            <Map location="Chaka Ranch, Nyeri" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
