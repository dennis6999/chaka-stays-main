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
      <div className="bg-card rounded-2xl md:rounded-[1.25rem] overflow-hidden shadow-md md:shadow-sm hover:shadow-2xl transition-all duration-500 ease-out h-full border border-border/50 hover:border-border/0 md:hover:-translate-y-2 flex flex-col relative w-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] md:aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0 bg-neutral-200 animate-pulse" /> {/* Loading state placeholder */}
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

          {featured && (
            <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md text-primary font-semibold tracking-wide border-0 px-3 py-1 shadow-sm">
              Featured
            </Badge>
          )}

          <div className="absolute top-4 right-4">
            <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-foreground px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold border border-white/20 shadow-sm">
              <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
              {rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 flex flex-col flex-grow bg-white dark:bg-[#1A1F1C] relative z-10">
          <div className="flex justify-between items-start mb-1">
            <span className="text-primary text-[10px] md:text-xs uppercase tracking-widest font-bold block">
              {type}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-1">
            {name}
          </h3>

          <div className="flex items-center text-muted-foreground text-sm mb-4 font-normal">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary/60" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground/80 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary/40" /> {guests} <span className="hidden sm:inline">Guests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-primary/40" /> {beds} <span className="hidden sm:inline">Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-primary/40" /> {baths} <span className="hidden sm:inline">Baths</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border/40 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Price per night</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-bold text-primary font-serif">KES {price.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
