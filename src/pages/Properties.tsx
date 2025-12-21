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
import { Loader2, Filter, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter State ---
  const [priceRange, setPriceRange] = useState([0, 50000]);
  // Removed displayPriceRange to ensure single source of truth for realtime sync
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
      amenities: Array.from(amens).sort().slice(0, 10), // Limit to top 10 for UI for now
      maxPrice: Math.ceil(maxP / 1000) * 1000 || 20000 // Round up to nearest 1000
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
      // Try to fuzzy match location from existing properties if possible, or just add it
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
      // Safe type coercion
      const price = Number(p.price_per_night) || 0;
      const guests = Number(p.max_guests) || 0;

      // 1. Price
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // 2. Locations (Multi-select OR user search text)
      if (selectedLocations.length > 0) {
        // Check if any selected location matches the property location (substring match for flexibility)
        // If user searched "Chaka", and property is "Chaka Town", it should match.
        const matchesLocation = selectedLocations.some(loc =>
          p.location && p.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // 3. Type (Multi-select)
      if (selectedTypes.length > 0) {
        if (!p.property_type || !selectedTypes.includes(p.property_type)) return false;
      }

      // 4. Amenities (Multi-select AND - must have ALL selected)
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity =>
          p.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // 5. Guests
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

  // --- Counts for UI ---
  const getCount = (key: string, value: string) => {
    // Calculate how many properties WOULD remain if this filter was applied
    // This is simple "current count matching this criteria globally"
    // or "current count within OTHER active filters"? 
    // Industry standard: typically shows global count or count within current context.
    // Let's do Global count for simplicity and speed first.
    if (key === 'type') return properties.filter(p => p.property_type === value).length;
    if (key === 'location') return properties.filter(p => p.location === value).length;
    if (key === 'amenity') return properties.filter(p => p.amenities?.includes(value)).length;
    return 0;
  };


  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`space-y-6 ${isMobile ? 'pb-20' : ''}`}>

      {/* Price Range */}
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

      {/* Property Type */}
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
              {types.length === 0 && <p className="text-xs text-muted-foreground">No types found</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="h-px bg-border" />

      {/* Amenities */}
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

      {/* Guest Count */}
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
      {/* Hero / Header properties page */}
      <div className="relative h-[45vh] lg:h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070"
            className="w-full h-full object-cover scale-105 animate-in fade-in zoom-in-105 duration-1000"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/30" />
        </div>

        <div className="chaka-container relative z-10 text-center px-4">
          <Badge variant="outline" className="mb-4 bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-semibold animate-in slide-in-from-bottom-4 duration-700">
            Exclusive Rentals
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-white tracking-tight animate-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-lg">
            Find Your <span className="text-primary-foreground/90 italic">Sanctuary</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed font-light animate-in slide-in-from-bottom-8 duration-700 delay-200 text-shadow-sm">
            Discover handpicked homes and cabins for your next adventure in Chaka.
          </p>
        </div>
      </div>

      <div className="chaka-container py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-auto py-1 px-2">
                  Reset
                </Button>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Bar & Sort */}
            <div className="lg:hidden sticky top-20 z-30 -mx-6 px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm mb-6 flex items-center justify-between gap-3">
              {/* Mobile Filter Sheet Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 rounded-full border-primary/20 bg-white/50 hover:bg-white hover:border-primary shadow-sm h-10">
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium text-foreground">Filters</span>
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
                    <FilterSidebar isMobile />
                  </div>
                  <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={clearAllFilters}>Clear</Button>
                      <SheetClose asChild>
                        <Button className="flex-1">Show properties</Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="flex-1 h-10 rounded-full border-primary/20 bg-white/50 hover:bg-white focus:ring-0">
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

            {/* Desktop Sort Bar (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <p className="text-sm text-muted-foreground">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'result' : 'results'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Select value={sortOption} onValueChange={setSortOption}>
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
            </div>

            {/* Active Filters Display (Chips) */}
            {(selectedTypes.length > 0 || selectedAmenities.length > 0 || selectedLocations.length > 0 || minGuests > 0) && (
              <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
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
                {selectedAmenities.map(amenity => (
                  <Badge key={amenity} variant="outline" className="px-3 py-1 text-sm">
                    {amenity}
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-foreground" onClick={() => toggleFilter(selectedAmenities, setSelectedAmenities, amenity)} />
                  </Badge>
                ))}
                {minGuests > 0 && (
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {minGuests}+ Guests
                    <X className="w-3 h-3 ml-1 cursor-pointer hover:text-foreground" onClick={() => setMinGuests(0)} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7">Clear all</Button>
              </div>
            )}


            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] rounded-xl bg-neutral/10 animate-pulse" />
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
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
                {properties.length === 0 ? (
                  <>
                    <h3 className="text-xl font-bold mb-2">No properties here... yet!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      It looks like there are no properties in the system.
                      Go to the Dashboard to add one!
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-2">No matches found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      We couldn't find any properties that match your filters.
                      Try adjusting the price range or removing some filters.
                    </p>
                    <Button onClick={clearAllFilters}>Clear all filters</Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;
