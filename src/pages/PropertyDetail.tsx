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
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { CalendarIcon, Check, Home, MapPin, Star, Users, Utensils, Wifi, Plus, Minus, Coffee, ShoppingBag, Heart, Share2, MessageSquare, Map, Loader2, BedDouble, Bath, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetClose,
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
import SEO from '@/components/SEO';
import { PropertyDetailSkeleton } from '@/components/PropertyDetailSkeleton';

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
  const [galleryView, setGalleryView] = React.useState<'grid' | 'carousel'>('grid');
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = React.useState(false);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [disabledDates, setDisabledDates] = React.useState<Date[]>([]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      console.log('Fetching reviews for property:', id);
      const data = await api.getReviews(id);
      console.log('Fetched reviews:', data);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!id) return;
    try {
      const bookings = await api.getPropertyBookings(id);
      const disabled: Date[] = [];
      bookings.forEach(booking => {
        // Parse dates as local time to avoid timezone offsets shifting the day
        const [startYear, startMonth, startDay] = booking.check_in.split('-').map(Number);
        const [endYear, endMonth, endDay] = booking.check_out.split('-').map(Number);

        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        // Iterate from start to end (inclusive of start, exclusive of end)
        let current = new Date(start);
        while (current < end) {
          disabled.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });
      setDisabledDates(disabled);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const [carouselApi, setCarouselApi] = React.useState<any>();

  React.useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveImage(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    carouselApi.scrollTo(activeImage); // Sync initial state

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Keep this to allow clicking thumbnails to control carousel
  React.useEffect(() => {
    if (!carouselApi) return;
    if (carouselApi.selectedScrollSnap() !== activeImage) {
      carouselApi.scrollTo(activeImage);
    }
  }, [activeImage, carouselApi]);

  React.useEffect(() => {
    const loadProperty = async () => {
      try {
        if (!id) return;
        const data = await api.getProperty(id);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      if (!user || !id) return;
      try {
        const status = await api.getFavoriteStatus(id, user.id);
        setIsLiked(status);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    loadProperty();
    fetchReviews();
    fetchAvailability();
    checkFavoriteStatus();
  }, [id, user]);

  const checkAuth = () => {
    if (!user) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  };

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select a check-in and check-out date first.");
      setMobileBookingOpen(true);
      return;
    }

    const isAuthed = checkAuth();
    if (!isAuthed) return;

    if (!user || !property) return;

    if (user.id === property.host_id) {
      toast.error("You cannot book your own property");
      return;
    }

    if (guests > property.max_guests) {
      toast.error(`This property only accommodates up to ${property.max_guests} guests`);
      return;
    }

    try {
      setIsBooking(true);

      // 1. Check Availability
      const isAvailable = await api.checkAvailability(property.id, checkIn, checkOut);
      if (!isAvailable) {
        toast.error('These dates are no longer available. Please choose another range.');
        setIsBooking(false);
        return;
      }

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

    } catch (error: any) {
      console.error('Error creating booking:', error);

      // Friendly error handling
      if (error.message?.includes('could not choose the best candidate function')) {
        toast.error('System Update: Please refresh the page and try again (Availability Check Updated).');
      } else if (error.message?.includes('violates row-level security')) {
        toast.error('Unable to verify permissions. Please check your login status.');
      } else {
        toast.error(error.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <PropertyDetailSkeleton />;
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
      <SEO
        title={`${property.title} - Chaka Stays`}
        description={`Book ${property.title} in ${property.location}. ${property.description.substring(0, 150)}...`}
        image={property.images[0]}
      />
      <Navbar />
      <main className="flex-grow pb-16 pt-24">
        <div className="chaka-container">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">{property.title}</h1>
              {property.is_banned && (
                <Badge variant="destructive" className="self-center h-8 px-3 text-sm uppercase tracking-wide">
                  Banned
                </Badge>
              )}
            </div>
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
                <Button variant="ghost" size="sm" className="hover:bg-neutral/10" onClick={async () => {
                  if (!user) {
                    setShowLoginDialog(true);
                    return;
                  }
                  try {
                    if (isLiked) {
                      await api.removeFavorite(property.id, user.id);
                      setIsLiked(false);
                      toast.success("Removed from favorites");
                    } else {
                      await api.addFavorite(property.id, user.id);
                      setIsLiked(true);
                      toast.success("Saved to favorites");
                    }
                  } catch (error) {
                    toast.error("Failed to update favorites");
                  }
                }}>
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-destructive text-destructive' : ''}`} /> {isLiked ? 'Saved' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-neutral/10" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }}>
                  <Share2 className="h-5 w-5 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Image Carousel */}
          <div className="lg:hidden mb-8 -mx-4 sm:mx-0 relative">
            <Carousel className="w-full" setApi={setCarouselApi}>
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] sm:rounded-xl overflow-hidden">
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setActiveImage(index);
                          setGalleryView('carousel');
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Custom Pagination Dots for Mobile Inline Carousel */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {property.images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
              {property.images.length > 5 && <div className={`h-1.5 w-1.5 rounded-full bg-white/50`} />}
            </div>

            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium pointer-events-none">
              {activeImage + 1} / {property.images.length}
            </div>
          </div>

          {/* Desktop Image Grid */}
          <div className="hidden lg:flex gap-2 rounded-2xl overflow-hidden shadow-sm h-[60vh] mb-12">
            <div className={`relative h-full flex ${property.images.length > 1 ? 'w-1/2' : 'w-full'}`}>
              <img
                src={property.images[0] || "https://images.unsplash.com/photo-1512918760383-ed5341cf3e3b?auto=format&fit=crop&w=1600&q=80"}
                alt="Main view"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
                onClick={() => {
                  setActiveImage(0);
                  setGalleryView('carousel');
                }}
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
                  <Dialog onOpenChange={(open) => {
                    if (!open) setGalleryView('grid');
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="absolute bottom-4 right-4 text-xs bg-white text-black hover:bg-neutral">
                        View all photos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-0 rounded-none bg-background flex flex-col [&>button]:hidden">
                      {/* Custom Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        {galleryView === 'carousel' ? (
                          <Button variant="ghost" onClick={() => setGalleryView('grid')} className="gap-2 pl-0 hover:bg-transparent">
                            <ArrowLeft className="h-5 w-5" /> Gallery
                          </Button>
                        ) : (
                          <h2 className="text-lg font-semibold">Photo Gallery</h2>
                        )}

                        <div className="flex items-center gap-4">
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral/10">
                              <X className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                        </div>
                      </div>

                      {galleryView === 'grid' ? (
                        <div className="overflow-y-auto p-4 md:p-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                            {property.images.map((image, index) => (
                              <div
                                key={index}
                                className={`relative cursor-pointer group overflow-hidden rounded-lg aspect-[4/3]`}
                                onClick={() => {
                                  setActiveImage(index);
                                  setGalleryView('carousel');
                                }}
                              >
                                <img
                                  src={image}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-1 overflow-hidden bg-black/95">
                          {/* Main Carousel Area */}
                          <div className="flex-1 flex flex-col relative justify-center">
                            <Carousel
                              className="w-full h-full flex items-center"
                              setApi={(api) => {
                                if (!api) return;
                                setCarouselApi(api);
                                api.scrollTo(activeImage, true);
                                api.on("select", () => {
                                  setActiveImage(api.selectedScrollSnap());
                                });
                              }}
                            >
                              <CarouselContent className="h-full">
                                {property.images.map((img, index) => (
                                  <CarouselItem key={index} className="h-full flex items-center justify-center pt-4 pb-20 lg:pb-4">
                                    <div className="relative w-full h-full flex items-center justify-center p-4">
                                      <img
                                        src={img}
                                        alt={`Full view ${index + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white border-none hidden md:flex" />
                              <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white border-none hidden md:flex" />
                            </Carousel>

                            {/* Mobile Info Overlay (since sidebar is hidden on mobile) */}
                            <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white pb-8">
                              <h3 className="font-semibold text-lg">{property.title}</h3>
                              <p className="text-sm opacity-80">{activeImage + 1} / {property.images.length}</p>
                            </div>
                          </div>

                          {/* Thumbnails Strip (Desktop Only) */}
                          <div className="hidden lg:flex h-20 bg-black/80 items-center justify-center gap-2 overflow-x-auto px-4 py-2 absolute bottom-0 left-0 right-80 z-20">
                            {property.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImage(idx)} // This logic needs to update carousel api if we had access, but for now it updates state which might not sync reverse. 
                                // Actually, let's keep it simple. Ideally we'd use the API to scroll. 
                                // For now, clicking thumbnails in this new setup might depend on the setApi above re-scrolling when activeImage changes.
                                // But `setApi` only runs once. We need a useEffect to scroll when activeImage changes or just rely on the Carousel internal state.
                                className={`relative h-14 w-20 flex-shrink-0 rounded-md overflow-hidden transition-all ${activeImage === idx ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-80'}`}
                              >
                                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>

                          {/* Right Sidebar - Info */}
                          <div className="w-80 border-l border-border bg-background hidden lg:flex flex-col p-6 overflow-y-auto">
                            <div className="space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-serif font-bold text-xl">{property.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" /> {property.location}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
                                    {property.rating}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm">Very Good</div>
                                    <div className="text-xs text-muted-foreground">{property.review_count} reviews</div>
                                  </div>
                                </div>
                              </div>



                              <div className="pt-6 border-t border-border mt-auto">
                                <div className="flex justify-between items-baseline mb-4">
                                  <span className="text-xs text-muted-foreground">Price starts at</span>
                                  <span className="text-xl font-bold text-primary">KES {property.price_per_night.toLocaleString()}</span>
                                </div>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => {
                                      // Scroll to booking section if dates aren't selected
                                      if (!checkIn || !checkOut) {
                                        document.querySelector('.lg\\:w-1\\/3')?.scrollIntoView({ behavior: 'smooth' });
                                        // Or specifically focus the date picker if possible, but scroll is good enough for now
                                      } else {
                                        handleBookNow();
                                      }
                                    }}
                                    className="w-full h-12 text-lg"
                                  >
                                    Reserve now
                                  </Button>
                                </DialogTrigger>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
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
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarImage src={property.host?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {property.host?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HO'}
                  </AvatarFallback>
                </Avatar>
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
              {user && user.id !== property.host_id && !reviews.some(r => r.user_id === user?.id) && (
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
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={review.user?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {review.user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
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
                      <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                          <button className="w-full text-left font-normal text-sm pt-1 focus:outline-none">
                            {checkIn ? format(checkIn, "dd/MM/yyyy") : "Add date"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={(date) => {
                              setCheckIn(date);
                              setCheckInOpen(false);
                              // Reset checkout if it's before new check-in
                              if (checkOut && date && checkOut <= date) {
                                setCheckOut(undefined);
                              }
                            }}
                            disabled={(date) => {
                              // Disable past dates
                              if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                              // Disable booked dates
                              return disabledDates.some(d => d.toDateString() === date.toDateString());
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="p-3 border rounded-tr-lg rounded-br-none border-l-0 border-neutral">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Check-out</Label>
                      <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className={`w-full text-left font-normal text-sm pt-1 focus:outline-none ${!checkIn ? 'text-muted-foreground cursor-not-allowed' : ''}`}
                            disabled={!checkIn}
                          >
                            {checkOut ? format(checkOut, "dd/MM/yyyy") : (checkIn ? "Add date" : "Select check-in first")}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={(date) => {
                              setCheckOut(date);
                              setCheckOutOpen(false);
                            }}
                            disabled={(date) => {
                              // Disable past dates OR dates before checkIn
                              if (checkIn && date <= checkIn) return true;
                              if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                              // Disable booked dates
                              return disabledDates.some(d => d.toDateString() === date.toDateString());
                            }}
                            initialFocus
                          />
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
                        {[...Array(property.max_guests)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {(i + 1) === 1 ? 'guest' : 'guests'}
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

                  {checkIn && checkOut && (
                    <>
                      <div className="flex justify-between text-muted-foreground pt-4 border-t">
                        <span>KES {property.price_per_night} x {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                        <span>KES {(property.price_per_night * Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cleaning fee</span>
                        <span>KES 2,500</span>
                      </div>
                      <div className="flex justify-between text-foreground font-bold pt-4 border-t text-lg">
                        <span>Total before taxes</span>
                        <span>KES {(property.price_per_night * Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 2500).toLocaleString()}</span>
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* Mobile Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-40 flex items-center justify-between safe-area-bottom shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            <Sheet open={mobileBookingOpen} onOpenChange={setMobileBookingOpen}>
              <SheetTrigger asChild>
                <div className="cursor-pointer">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-serif text-primary">KES {property.price_per_night}</span>
                    <span className="text-sm text-muted-foreground">/ night</span>
                  </div>
                  <div className={`text-xs underline font-medium ${!checkIn || !checkOut ? 'text-primary animate-pulse decoration-2' : 'text-muted-foreground'}`}>
                    {checkIn && checkOut ? `${Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights` : 'Select dates'}
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] flex flex-col rounded-t-xl sm:max-w-none">
                <SheetHeader className="mb-2">
                  <SheetTitle>Select Dates</SheetTitle>
                  <SheetDescription>
                    Add your travel dates for exact pricing
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pb-12 px-1">
                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Check-in Date</Label>
                      <div className="border rounded-lg p-2 bg-card flex justify-center">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date);
                            // Reset checkout if it's before new check-in
                            if (checkOut && date && checkOut <= date) {
                              setCheckOut(undefined);
                            }
                          }}
                          disabled={(date) => {
                            if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                            return disabledDates.some(d => d.toDateString() === date.toDateString());
                          }}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Check-out Date</Label>
                      <div className="border rounded-lg p-2 bg-card flex justify-center">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => {
                            if (checkIn && date <= checkIn) return true;
                            if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                            return disabledDates.some(d => d.toDateString() === date.toDateString());
                          }}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button className="w-full mt-2 h-12 text-base shadow-lg bg-primary text-primary-foreground mb-8">Confirm Dates</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={handleBookNow} disabled={isBooking} className="bg-primary px-8 shadow-lg shadow-primary/25">
              {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : (!checkIn || !checkOut ? 'Check Availability' : 'Reserve')}
            </Button>
          </div>
        </div>
      </main >
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
    </div >
  );
};

export default PropertyDetail;
