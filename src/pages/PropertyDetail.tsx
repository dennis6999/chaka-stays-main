import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Check, Home, MapPin, Star, Users, Utensils, Wifi, Plus, Minus, Coffee, ShoppingBag, Heart, Share2, MessageSquare, Map, Loader2, BedDouble, Bath } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { api, Property, Review } from '@/services/api';
import ReviewForm from '@/components/ReviewForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(undefined);
  const [guests, setGuests] = React.useState(2);
  const [activeImage, setActiveImage] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [reviews, setReviews] = React.useState<Review[]>([]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const data = await api.getReviews(id);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  React.useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // Fetch property first (Critical)
        const propertyData = await api.getProperty(id);
        setProperty(propertyData);

        // Fetch reviews independently (Non-critical)
        // We don't await this inside the same try block to avoid blocking the page
        fetchReviews();
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleBookNow = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (!property) return;

    if (user.id === property.host_id) {
      toast.error("You cannot book your own property");
      return;
    }

    try {
      setIsBooking(true);

      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = property.price_per_night * nights; // Add cleaning fee logic later

      await api.createBooking({
        property_id: property.id,
        guest_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice
      });

      toast.success('Booking created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pb-16 pt-24">
        <div className="chaka-container">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm font-medium">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-secondary fill-secondary mr-1" />
                <span className="text-foreground">{property.rating}</span>
                <span className="mx-1">·</span>
                <span className="underline decoration-muted-foreground/50">{property.review_count} reviews</span>
              </div>
              <span className="hidden sm:inline">·</span>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                {property.location}
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" className="hover:bg-neutral/10" onClick={() => setIsLiked(!isLiked)}>
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-destructive text-destructive' : ''}`} /> Save
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-neutral/10">
                  <Share2 className="h-5 w-5 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="gap-2 rounded-2xl overflow-hidden shadow-sm h-[50vh] md:h-[60vh] mb-12 flex">
            <div className={`relative h-full flex ${property.images.length > 1 ? 'w-1/2' : 'w-full'}`}>
              <img
                src={property.images[0] || "https://images.unsplash.com/photo-1512918760383-ed5341cf3e3b?auto=format&fit=crop&w=1600&q=80"}
                alt="Main view"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {property.images.length > 1 && (
              <div className="grid grid-rows-2 gap-2 h-full w-1/2">
                <div className="relative h-full overflow-hidden">
                  <img
                    src={property.images[1]}
                    alt="Interior"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-full overflow-hidden">
                  <img
                    src={property.images[2] || property.images[0]}
                    alt="Details"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <Button variant="secondary" className="absolute bottom-4 right-4 text-xs bg-white text-black hover:bg-neutral">
                    View all photos
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative pb-24 lg:pb-0">
            {/* Left Content */}
            <div className="lg:w-2/3 space-y-10">

              {/* Quick Summary */}
              <div className="flex flex-wrap gap-6 py-8 border-b border-border">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="font-medium text-secondary-foreground">{property.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                  <Home className="h-5 w-5 text-secondary" />
                  <span className="font-medium text-secondary-foreground">{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                  <BedDouble className="h-5 w-5 text-secondary" />
                  <span className="font-medium text-secondary-foreground">{property.beds} beds</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                  <Bath className="h-5 w-5 text-secondary" />
                  <span className="font-medium text-secondary-foreground">{property.baths} baths</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-4 py-4 border-b border-border">
                <img
                  src={property.host?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt={property.host?.full_name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-lg">Hosted by {property.host?.full_name || 'Host'}</div>
                  <div className="text-sm text-muted-foreground">Joined {new Date(property.created_at).getFullYear()}</div>
                </div>
              </div>

              {/* Description */}
              <div className="py-2 space-y-4">
                <h3 className="font-serif text-2xl font-semibold">About this space</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="py-6 border-t border-border">
                <h3 className="font-serif text-2xl font-semibold mb-6">What this place offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="p-2 bg-neutral/10 rounded-full">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base text-foreground/80">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="py-8 border-t border-border">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-primary fill-primary" />
                <h3 className="font-serif text-2xl font-semibold">
                  {reviews.length > 0 ? `${property.rating} · ${reviews.length} reviews` : 'No reviews (yet)'}
                </h3>
              </div>

              {/* Review Form */}
              {user && user.id !== property.host_id && (
                <div className="mb-8">
                  <ReviewForm
                    propertyId={property.id}
                    userId={user.id}
                    onReviewSubmitted={fetchReviews}
                  />
                </div>
              )}

              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.user?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg"}
                        alt={review.user?.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{review.user?.full_name || 'Guest'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-neutral'}`}
                        />
                      ))}
                    </div>
                    <p className="text-foreground/80 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Desktop Booking Sidebar */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-24">
              <div className="glass-card rounded-xl shadow-xl overflow-hidden p-6 border border-white/20">
                <div className="flex justify-between items-baseline mb-6">
                  <div>
                    <span className="text-2xl font-bold font-serif text-primary">KES {property.price_per_night}</span>
                    <span className="text-muted-foreground"> night</span>
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <Star className="h-4 w-4 bg-secondary text-white rounded-sm p-0.5 mr-1" />
                    {property.rating} · <span className="text-muted-foreground ml-1 underline">{property.review_count} reviews</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 border rounded-tl-lg rounded-bl-none border-neutral">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Check-in</Label>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground mb-1 block md:hidden" />
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full text-left font-normal text-sm pt-1 focus:outline-none">
                            {checkIn ? format(checkIn, "dd/MM/yyyy") : "Add date"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="p-3 border rounded-tr-lg rounded-br-none border-l-0 border-neutral">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full text-left font-normal text-sm pt-1 focus:outline-none">
                            {checkOut ? format(checkOut, "dd/MM/yyyy") : "Add date"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="p-3 border rounded-b-lg border-t-0 border-neutral mt-0">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Guests</Label>
                    <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                      <SelectTrigger className="border-0 p-0 h-auto focus:ring-0">
                        <SelectValue placeholder="1 guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'guest' : 'guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={handleBookNow}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking availability...
                      </>
                    ) : (
                      'Reserve'
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground py-2">
                    You won't be charged yet
                  </div>

                  <div className="flex justify-between text-muted-foreground pt-4 border-t">
                    <span>KES {property.price_per_night} x 5 nights</span>
                    <span>KES {property.price_per_night * 5}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cleaning fee</span>
                    <span>KES 2,500</span>
                  </div>
                  <div className="flex justify-between text-foreground font-bold pt-4 border-t text-lg">
                    <span>Total before taxes</span>
                    <span>KES {property.price_per_night * 5 + 2500}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Mobile Fixed Bottom Bar */}
          {/* Mobile Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-40 flex items-center justify-between safe-area-bottom shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            <Sheet>
              <SheetTrigger asChild>
                <div className="cursor-pointer">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-serif text-primary">KES {property.price_per_night}</span>
                    <span className="text-sm text-muted-foreground">/ night</span>
                  </div>
                  <div className="text-xs text-muted-foreground underline">
                    {checkIn && checkOut ? `${Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights` : 'Select dates'}
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                <SheetHeader>
                  <SheetTitle>Select Dates</SheetTitle>
                  <SheetDescription>
                    Add your travel dates for exact pricing
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6 h-full overflow-y-auto pb-10">
                  <div className="space-y-2">
                    <Label>Check-in</Label>
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} className="rounded-md border mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out</Label>
                    <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} className="rounded-md border mx-auto" />
                  </div>
                  <Button onClick={() => document.body.click()} className="w-full mt-4">Confirm Dates</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={handleBookNow} disabled={isBooking} className="bg-primary px-8">
              {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reserve'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Required</AlertDialogTitle>
            <AlertDialogDescription>
              To ensure a secure booking experience, you need to be signed in to reserve this property.
              It only takes a moment to create an account!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <AlertDialogAction onClick={() => navigate('/signup')}>Create Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyDetail;
