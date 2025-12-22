import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api, Property } from '@/services/api';
import { Loader2, Filter, SlidersHorizontal, MapPin, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter State ---
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minGuests, setMinGuests] = useState<number>(0);
  const [sortOption, setSortOption] = useState('recommended');

  const [maxPriceInData, setMaxPriceInData] = useState(20000);

  // --- Derived Data for Filter Options ---
  const { locations, types, amenities, maxPrice } = useMemo(() => {
    const locs = new Set<string>();
    const typs = new Set<string>();
    const amens = new Set<string>();
    let maxP = 0;

    properties.forEach(p => {
      if (p.location) locs.add(p.location);
      if (p.property_type) typs.add(p.property_type);
      if (p.price_per_night > maxP) maxP = p.price_per_night;
      p.amenities?.forEach(a => amens.add(a));
    });

    return {
      locations: Array.from(locs).sort(),
      types: Array.from(typs).sort(),
      amenities: Array.from(amens).sort().slice(0, 10),
      maxPrice: Math.ceil(maxP / 1000) * 1000 || 20000
    };
  }, [properties]);

  useEffect(() => {
    if (maxPrice > 0 && maxPriceInData !== maxPrice) {
      setMaxPriceInData(maxPrice);
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);


  useEffect(() => {
    fetchProperties();
  }, []);

  // Initialize filters from URL
  useEffect(() => {
    const locParam = searchParams.get('location');
    const guestsParam = searchParams.get('guests');

    if (locParam && locParam !== 'all') {
      setSelectedLocations([locParam]);
    }
    if (guestsParam) {
      setMinGuests(parseInt(guestsParam) || 0);
    }
  }, [searchParams]);

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

  // --- Filtering Logic (Realtime) ---
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const price = Number(p.price_per_night) || 0;
      const guests = Number(p.max_guests) || 0;

      if (price < priceRange[0] || price > priceRange[1]) return false;

      if (selectedLocations.length > 0) {
        const matchesLocation = selectedLocations.some(loc =>
          p.location && p.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      if (selectedTypes.length > 0) {
        if (!p.property_type || !selectedTypes.includes(p.property_type)) return false;
      }

      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity =>
          p.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      if (guests < minGuests) return false;

      return true;
    }).sort((a, b) => {
      const priceA = Number(a.price_per_night) || 0;
      const priceB = Number(b.price_per_night) || 0;
      switch (sortOption) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
  }, [properties, priceRange, selectedLocations, selectedTypes, selectedAmenities, minGuests, sortOption]);

  // --- Handlers ---
  const toggleFilter = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, maxPriceInData]);
    setSelectedLocations([]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setMinGuests(0);
    setSortOption('recommended');
    toast.info("Filters cleared");
  };

  const getCount = (key: string, value: string) => {
    if (key === 'type') return properties.filter(p => p.property_type === value).length;
    if (key === 'location') return properties.filter(p => p.location === value).length;
    if (key === 'amenity') return properties.filter(p => p.amenities?.includes(value)).length;
    return 0;
  };

  // Filter Content for Sheet/Drawer
  const FilterContent = () => (
    <div className="space-y-6 pb-20">
      <div>
        <h3 className="text-sm font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[0, maxPriceInData]}
          max={maxPriceInData}
          step={500}
          value={priceRange}
          onValueChange={setPriceRange}
          className="my-6"
        />
        <div className="flex items-center justify-between text-sm">
          <div className="border px-2 py-1 rounded bg-background">KES {priceRange[0]}</div>
          <div className="text-muted-foreground">-</div>
          <div className="border px-2 py-1 rounded bg-background">KES {priceRange[1]}</div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <Accordion type="single" collapsible defaultValue="types">
        <AccordionItem value="types" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold">Property Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {types.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal flex-1 cursor-pointer flex justify-between">
                    <span>{type}</span>
                    <span className="text-muted-foreground text-xs">({getCount('type', type)})</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="h-px bg-border" />

      <Accordion type="single" collapsible defaultValue="amenities">
        <AccordionItem value="amenities" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold">Amenities</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {amenities.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleFilter(selectedAmenities, setSelectedAmenities, amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal flex-1 cursor-pointer flex justify-between">
                    <span>{amenity}</span>
                    <span className="text-muted-foreground text-xs">({getCount('amenity', amenity)})</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-sm font-semibold mb-3">Guests</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <Button
              key={num}
              variant={minGuests === num ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setMinGuests(minGuests === num ? 0 : num)}
            >
              {num}+
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero / Header */}
      <div className="relative h-[30vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="chaka-container relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white tracking-tight drop-shadow-lg">
            Find Your Sanctuary
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto font-light">
            Discover handpicked homes and cabins for your next adventure.
          </p>
        </div>
      </div>

      <div className="chaka-container px-4 sm:px-6 py-8 flex-grow">

        {/* Top Filter Bar - Replaces Sidebar */}
        <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-xl border-b border-border/40 -mx-6 px-6 py-4 mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between transition-all duration-300 shadow-sm">

          {/* Left: Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {/* Main Filters Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 h-10 px-4">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {(selectedTypes.length > 0 || selectedAmenities.length > 0 || selectedLocations.length > 0 || minGuests > 0) && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-white text-[10px] border-0">
                      {selectedTypes.length + selectedAmenities.length + selectedLocations.length + (minGuests > 0 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
                  <SheetDescription>Refine your search to find the perfect stay.</SheetDescription>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent />
                </div>
                <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={clearAllFilters}>Clear</Button>
                    <SheetClose asChild>
                      <Button className="flex-1">Show Properties</Button>
                    </SheetClose>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Quick Type Filters (Optional/Extra) */}
            {types.slice(0, 3).map(type => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                className={`rounded-full h-9 px-4 text-xs ${selectedTypes.includes(type) ? '' : 'border-dashed'}`}
                onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Right: Sort and Count */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <p className="text-sm text-muted-foreground hidden md:block whitespace-nowrap">
              {filteredProperties.length} stays
            </p>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px] rounded-full border-primary/20 bg-transparent h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTypes.length > 0 || selectedAmenities.length > 0 || selectedLocations.length > 0 || minGuests > 0) && (
          <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2">
            {selectedLocations.map(loc => (
              <Badge key={loc} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <MapPin className="w-3 h-3 mr-1" /> {loc}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-foreground" onClick={() => toggleFilter(selectedLocations, setSelectedLocations, loc)} />
              </Badge>
            ))}
            {selectedTypes.map(type => (
              <Badge key={type} variant="secondary" className="px-3 py-1 text-sm">
                {type}
                <X className="w-3 h-3 ml-1 cursor-pointer hover:text-foreground" onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)} />
              </Badge>
            ))}
            {/* ... other badges ... purely visual indicators */}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7">Clear all</Button>
          </div>
        )}

        {/* --- THE GRID: Exact Match to Homepage --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] rounded-xl bg-neutral/10 animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                name={property.title}
                image={property.images?.[0] || 'https://via.placeholder.com/300'}
                type={property.property_type || 'Stay'}
                guests={property.max_guests}
                price={property.price_per_night}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
            <div className="h-16 w-16 bg-neutral/10 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No matches found</h3>
            <Button onClick={clearAllFilters} variant="link">Clear all filters</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
