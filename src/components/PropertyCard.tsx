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
    <Link to={`/property/${id}`} className="block h-full group">
      <div className="flex flex-col h-full bg-transparent">
        {/* Image - Modern full-width rounded look */}
        <div className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-[1.5rem] bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient Overlay for text contrast if needed, but keeping clean for now */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl sm:rounded-[1.5rem]" />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {featured && (
              <Badge className="bg-white/95 backdrop-blur-sm text-primary text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider border-0 shadow-sm">
                Featured
              </Badge>
            )}

            <div className={`ml-auto bg-white/95 backdrop-blur-sm text-foreground px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm ${!featured ? 'ml-auto' : ''}`}>
              <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
              {rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Content - Minimalist */}
        <div className="pt-4 px-1 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 mr-2">
              {name}
            </h3>
            <div className="flex flex-col items-end text-right">
              <span className="text-lg font-bold text-primary font-serif">KES {price.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground font-medium">/ night</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm font-normal truncate mb-3 flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary/60" />
            {location}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground/80 font-medium">
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {guests} Guests</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" /> {beds} Beds</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" /> {baths} Baths</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
