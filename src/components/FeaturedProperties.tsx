import React from 'react';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Sample data for featured properties
const featuredProperties = [
  {
    id: 1,
    name: "Cozy Family Suite",
    location: "Chaka Town, Nyeri",
    price: 85,
    rating: 4.8,
    image: "/lovable-uploads/31753fbf-d888-4d91-b12d-9754e8c01794.png",
    type: "Apartment",
    guests: 4,
    featured: true
  },
  {
    id: 2,
    name: "Charming Garden Cottage",
    location: "Chaka Town, Nyeri",
    price: 65,
    rating: 4.7,
    image: "/lovable-uploads/37cb5f82-cc77-4f57-b3f3-3d4108ae1642.png",
    type: "Cottage",
    guests: 2,
    featured: true
  },
  {
    id: 3,
    name: "Modern Comfort Home",
    location: "Chaka Town, Nyeri",
    price: 95,
    rating: 4.9,
    image: "/lovable-uploads/f32e2236-eedd-4fcd-a373-1e1c9522c2b6.png",
    type: "Home",
    guests: 6,
    featured: true
  }
];

const FeaturedProperties = () => {
  return (
    <section className="py-12 sm:py-16 bg-neutral/50">
      <div className="chaka-container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark">Featured Properties</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Discover our most popular accommodations</p>
          </div>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link to="/properties">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
