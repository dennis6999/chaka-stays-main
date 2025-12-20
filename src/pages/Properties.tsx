import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { api, Property } from '@/services/api';
import { Loader2, Filter, X, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

const Properties = () => {
  // State for Filters
  const [priceRange, setPriceRange] = useState([0, 20000]); // Max price updated to 20k
  const [selectedType, setSelectedType] = useState('all');
  const [guestCount, setGuestCount] = useState('any');
  const [sortOption, setSortOption] = useState('recommended');

  // Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await api.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering and Sorting Logic
  const filteredAndSortedProperties = useMemo(() => {
    let result = [...properties];

    // 1. Filter by Type
    if (selectedType !== 'all') {
      result = result.filter(
        (p) => p.property_type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // 2. Filter by Price
    result = result.filter(
      (p) => p.price_per_night >= priceRange[0] && p.price_per_night <= priceRange[1]
    );

    // 3. Filter by Guests
    if (guestCount !== 'any') {
      const minGuests = parseInt(guestCount.split('-')[0] || guestCount.replace('+', ''));
      result = result.filter((p) => p.max_guests >= minGuests);
    }

    // 4. Sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case 'price-high':
        result.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        // Default sort
        break;
    }

    return result;
  }, [properties, selectedType, priceRange, guestCount, sortOption]);

  const clearFilters = () => {
    setPriceRange([0, 20000]);
    setSelectedType('all');
    setGuestCount('any');
    setSortOption('recommended');
    toast.info('Filters cleared');
  };

  // Reusable Filter Content
  const FilterContent = ({ isMobile = false }) => (
    <div className={`space-y-8 ${isMobile ? 'mt-6' : ''}`}>
      {/* Property Type Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80">Property Type</h3>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full">
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

      {/* Price Range Filter */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground/80">Price Range</h3>
          <span className="text-xs text-muted-foreground">(KES)</span>
        </div>
        <Slider
          defaultValue={[0, 20000]}
          max={20000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm font-medium">
          <div className="px-3 py-1 rounded-md bg-neutral/10 text-neutral-600 border border-neutral/20">
            {priceRange[0]}
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="px-3 py-1 rounded-md bg-neutral/10 text-neutral-600 border border-neutral/20">
            {priceRange[1]}
          </div>
        </div>
      </div>

      {/* Guest Count Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/80">Guest Count</h3>
        <Select value={guestCount} onValueChange={setGuestCount}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Guests</SelectItem>
            <SelectItem value="1-2">1-2 Guests</SelectItem>
            <SelectItem value="3-4">3-4 Guests</SelectItem>
            <SelectItem value="5-6">5-6 Guests</SelectItem>
            <SelectItem value="7+">7+ Guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isMobile && (
        <div className="pt-2">
          <Button className="w-full bg-primary hover:bg-primary/90 shadow-md">
            Update Results
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral/30">
      <Navbar />
      <main className="flex-grow pb-24">
        {/* Header Section */}
        <div className="bg-dark py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-0"></div> {/* Darker Overlay for text pop */}
          <div className="chaka-container relative z-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Find Your Perfect <br className="hidden md:block" /> Stay in Chaka Town
            </h1>
            <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl max-w-4xl mx-auto md:mx-0">
              <SearchForm />
            </div>
          </div>
        </div>

        <div className="chaka-container mt-8 md:mt-12">
          {/* Mobile Filter & Sort Bar */}
          <div className="lg:hidden flex gap-4 mb-6 sticky top-20 z-30 pt-4 pb-2 bg-neutral/30 backdrop-blur-lg -mx-6 px-6 border-b border-neutral/10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-serif text-left">Filters</SheetTitle>
                  <SheetDescription className="text-left">
                    Refine your search to find the perfect stay.
                  </SheetDescription>
                </SheetHeader>
                <FilterContent isMobile={true} />
                <SheetFooter className="mt-8 border-t pt-4">
                  <SheetClose asChild>
                    <Button type="submit" className="w-full">Show {filteredAndSortedProperties.length} Properties</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="flex-1 bg-white/80 backdrop-blur-sm border-primary/20">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Filters Sidebar - Sticky */}
            <aside className="hidden lg:block lg:w-1/4 sticky top-24 transition-all duration-300 z-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif font-semibold flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-primary" /> Filters
                  </h2>
                  {(selectedType !== 'all' || guestCount !== 'any' || priceRange[0] > 0 || priceRange[1] < 20000) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
                      Clear all
                    </Button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Properties Grid */}
            <div className="w-full lg:w-3/4">
              {/* Desktop Toolbar */}
              <div className="hidden lg:flex justify-between items-center mb-6 gap-4 bg-white/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <h2 className="text-lg font-medium text-muted-foreground">
                  Showing <span className="text-foreground font-bold">{filteredAndSortedProperties.length}</span> properties
                </h2>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[200px] bg-white">
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
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground animate-pulse">Finding the best stays for you...</p>
                </div>
              ) : (
                <>
                  {filteredAndSortedProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-border text-center px-4">
                      <div className="h-16 w-16 bg-neutral/10 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                        <Filter className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No properties matches your filters</h3>
                      <p className="text-muted-foreground max-w-md mb-6">
                        Try adjusting your search criteria. Removing some filters usually helps!
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in pb-10">
                      {filteredAndSortedProperties.map((property) => (
                        <div key={property.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                          <PropertyCard
                            {...property}
                            name={property.title}
                            image={property.images?.[0] || 'https://via.placeholder.com/300'}
                            type={property.property_type || 'Stay'}
                            guests={property.max_guests}
                            price={property.price_per_night}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {filteredAndSortedProperties.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md p-1 rounded-lg border shadow-sm">
                    <Button variant="ghost" className="h-9 w-9 p-0" disabled>&larr;</Button>
                    <Button variant="secondary" className="h-9 w-9 p-0 font-medium">1</Button>
                    <Button variant="ghost" className="h-9 w-9 p-0">2</Button>
                    <Button variant="ghost" className="h-9 w-9 p-0">3</Button>
                    <Button variant="ghost" className="h-9 w-9 p-0">&rarr;</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;
