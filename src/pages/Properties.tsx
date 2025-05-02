
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import SearchForm from '@/components/SearchForm';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Sample properties data
const properties = [
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
  },
  {
    id: 4,
    name: "Nyeri Guest Suite",
    location: "Chaka Town, Nyeri",
    price: 55,
    rating: 4.5,
    image: "/lovable-uploads/a2d29d9a-0fa6-46d5-896b-87ae36676fb4.png",
    type: "Room",
    guests: 2
  },
  {
    id: 5,
    name: "Spacious Family House",
    location: "Chaka Town, Nyeri",
    price: 120,
    rating: 4.9,
    image: "/lovable-uploads/d2a418bd-5f74-4691-813f-5b77087024d9.png",
    type: "Home",
    guests: 8
  },
  {
    id: 6,
    name: "Traditional Kenyan Home",
    location: "Chaka Town, Nyeri",
    price: 75,
    rating: 4.6,
    image: "/lovable-uploads/41a5ada2-d825-4a33-a5d2-d372cdda518f.png",
    type: "Home",
    guests: 4
  }
];

const Properties = () => {
  const [priceRange, setPriceRange] = React.useState([0, 200]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-neutral/50 pb-16">
        <div className="bg-dark py-12">
          <div className="chaka-container">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Find Your Perfect Stay in Chaka Town
            </h1>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <SearchForm />
            </div>
          </div>
        </div>
        
        <div className="chaka-container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Property Type</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="cottage">Cottage</SelectItem>
                        <SelectItem value="room">Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <div className="mb-6">
                      <Slider
                        defaultValue={[0, 200]}
                        max={200}
                        step={5}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Guest Count</h3>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1-2">1-2 guests</SelectItem>
                        <SelectItem value="3-4">3-4 guests</SelectItem>
                        <SelectItem value="5-6">5-6 guests</SelectItem>
                        <SelectItem value="7+">7+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Properties Grid */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {properties.length} properties found
                </h2>
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                  />
                ))}
              </div>
              
              <div className="mt-10 flex justify-center">
                <Button variant="outline" className="mx-1">1</Button>
                <Button variant="outline" className="mx-1">2</Button>
                <Button variant="outline" className="mx-1">3</Button>
                <Button variant="outline" className="mx-1">Next &rarr;</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;
