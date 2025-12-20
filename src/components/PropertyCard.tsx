import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Home, BedDouble, Bath } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  type: string;
  guests: number;
  bedrooms?: number;
  beds?: number;
  baths?: number;
  featured?: boolean;
}

const PropertyCard = ({
  id,
  name,
  location,
  price,
  rating,
  image,
  type,
  guests,
  bedrooms = 1,
  beds = 1,
  baths = 1,
  featured = false,
}: PropertyCardProps) => {
  return (
    <Link to={`/property/${id}`} className="block h-full group perspective-1000">
      <div className="bg-card rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-out h-full border border-border/50 hover:border-border/0 hover:-translate-y-2 flex flex-col relative w-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0 bg-neutral-200 animate-pulse" /> {/* Loading state placeholder */}
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {featured && (
            <Badge className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-primary font-medium tracking-wide border-0 px-3 py-1 shadow-lg">
              Featured
            </Badge>
          )}

          <div className="absolute top-4 right-4">
            <div className="bg-black/20 backdrop-blur-md text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium border border-white/10">
              <Star className="h-3 w-3 text-secondary fill-secondary" />
              {rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow bg-white dark:bg-[#1A1F1C] relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-secondary text-xs uppercase tracking-wider font-semibold block">
              {type}
            </span>
          </div>

          <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-1">
            {name}
          </h3>

          <div className="flex items-center text-muted-foreground text-sm mb-4 font-light">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 bg-neutral/5 px-2 py-1 rounded-md">
              <Users className="h-3.5 w-3.5 text-primary/70" /> {guests} Guests
            </div>
            <div className="flex items-center gap-1.5 bg-neutral/5 px-2 py-1 rounded-md">
              <BedDouble className="h-3.5 w-3.5 text-primary/70" /> {beds} Beds
            </div>
            <div className="flex items-center gap-1.5 bg-neutral/5 px-2 py-1 rounded-md">
              <Bath className="h-3.5 w-3.5 text-primary/70" /> {baths} Baths
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-light">Nightly rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary font-serif">KES {price}</span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
