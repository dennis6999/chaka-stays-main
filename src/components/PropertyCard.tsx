import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Home, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  type: string;
  guests: number;
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
  featured = false,
}: PropertyCardProps) => {
  return (
    <Link to={`/property/${id}`} className="block h-full">
      <div className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-[4/3]">
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {featured && (
            <Badge className="absolute top-2 right-2 bg-accent/90 text-white font-medium backdrop-blur-sm text-xs sm:text-sm">
              Featured
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-4 sm:p-5 space-y-2 sm:space-y-3 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="text-base sm:text-lg font-semibold text-dark group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
            <div className="flex items-center bg-accent/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ml-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-accent fill-accent" />
              <span className="ml-1 font-medium text-xs sm:text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="bg-neutral/50 text-[10px] sm:text-xs">
              <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              {type}
            </Badge>
            <Badge variant="secondary" className="bg-neutral/50 text-[10px] sm:text-xs">
              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              {guests} guests
            </Badge>
          </div>
          
          <div className="flex justify-between items-center pt-2 sm:pt-3 mt-auto">
            <div className="flex items-center">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-1 sm:mr-1.5" />
              <span className="font-semibold text-primary text-sm sm:text-base">
                ${price}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm ml-0.5 sm:ml-1">/night</span>
            </div>
            <Badge className="bg-primary hover:bg-primary/90 text-white transition-colors text-xs sm:text-sm">
              View Details
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
