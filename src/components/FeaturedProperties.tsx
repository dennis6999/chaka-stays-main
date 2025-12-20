import React from 'react';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

import { api, Property } from '@/services/api';
import { Loader2 } from 'lucide-react';
// ... other imports

const FeaturedProperties = () => {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.getFeaturedProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch featured properties", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="chaka-container px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-primary font-medium tracking-wider text-sm uppercase mb-2 block">Curated Selection</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Featured Stays</h2>
            <p className="text-muted-foreground text-lg">Discover our most sought-after accommodations, handpicked for their unique character and exceptional comfort.</p>
          </div>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-all rounded-full px-6">
            <Link to="/properties">View All Properties</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                name={property.title}
                location={property.location}
                price={property.price_per_night}
                rating={property.rating}
                image={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                type="Stay" // Default type
                guests={property.max_guests}
                bedrooms={property.bedrooms}
                beds={property.beds}
                baths={property.baths}
                featured={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
