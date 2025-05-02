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
import { CalendarIcon, Check, Home, MapPin, Star, Users, Utensils, Wifi, Plus, Minus, Coffee, ShoppingBag, Heart, Share2, MessageSquare, Map, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

// Sample data for a specific property
const propertyData = {
  id: 1,
  name: "Cozy Family Suite",
  description: "Experience authentic Kenyan hospitality in this comfortable family suite located in the heart of Chaka Town. This well-appointed accommodation features modern amenities while preserving the traditional charm of the region.",
  longDescription: "This beautiful family suite offers the perfect blend of comfort and local charm. The spacious bedroom features quality bedding and traditional décor, while the fully equipped kitchen allows you to prepare your own meals. Enjoy the cozy living area with comfortable seating and entertainment options. The property is conveniently located within walking distance to local markets, restaurants, and attractions in Chaka Town, including the famous Chaka Ranch near the Railway Station.",
  location: "Chaka Town, Nyeri County, Kenya",
  price: 85,
  rating: 4.8,
  reviewCount: 24,
  images: [
    "/lovable-uploads/31753fbf-d888-4d91-b12d-9754e8c01794.png",
    "/lovable-uploads/37cb5f82-cc77-4f57-b3f3-3d4108ae1642.png",
    "/lovable-uploads/f32e2236-eedd-4fcd-a373-1e1c9522c2b6.png"
  ],
  type: "Apartment",
  guests: 4,
  bedrooms: 2,
  beds: 3,
  baths: 1,
  host: {
    name: "Jane Kamau",
    joined: "January 2020",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.9,
    responseRate: 99,
  },
  amenities: [
    "Fully equipped kitchen",
    "Free WiFi",
    "TV with cable",
    "Washing machine",
    "Fresh linens and towels",
    "24/7 support",
    "Free parking",
    "Air conditioning"
  ],
  services: [
    "Daily cleaning (optional)",
    "Laundry service",
    "Airport pickup",
    "Breakfast (additional fee)",
    "Local tours arrangement"
  ],
  propertyReviews: [
    {
      id: 1,
      user: "Michael K.",
      date: "March 2023",
      content: "Excellent accommodation with all the comforts of home. The host was very welcoming and the location is perfect for exploring Chaka Town. Would definitely stay again!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      user: "Sarah W.",
      date: "February 2023",
      content: "Very clean and comfortable. The kitchen was well equipped and the bed was so comfortable! Great value for money.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      id: 3,
      user: "John D.",
      date: "January 2023",
      content: "Perfect stay for our family. The kids loved it and we appreciated all the thoughtful touches. The host went above and beyond to make us feel welcome. We really enjoyed visiting Chaka Ranch during our stay!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    }
  ]
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(undefined);
  const [guests, setGuests] = React.useState(2);
  const [activeImage, setActiveImage] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  
  const property = propertyData;
  
  const handleBookNow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    try {
      setIsBooking(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.post('/api/bookings.php', {
        property_id: property.id,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guests: guests
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.booking) {
        toast.success('Booking created successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to create booking');
        if (error.response?.status === 401) {
          navigate('/auth');
        }
      } else {
        toast.error('Failed to create booking');
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-neutral/30 pb-16">
        {/* Hero Section with Image Gallery */}
        <div className="relative h-[60vh] md:h-[70vh] bg-gray-200 overflow-hidden">
          <div className="absolute inset-0">
              <img 
              src={property.images[activeImage]} 
                alt={property.name} 
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
              />
            </div>
          
          {/* Image Gallery Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeImage === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                />
            ))}
              </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="secondary" 
              size="icon" 
              className="bg-white/90 hover:bg-white"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="bg-white/90 hover:bg-white"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
        
        <div className="chaka-container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Property Details */}
            <div className="lg:w-2/3">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-dark">{property.name}</h1>
                  <div className="flex flex-wrap items-center mt-2 gap-2">
                    <div className="flex items-center text-sm bg-neutral/10 px-3 py-1 rounded-full">
                      <MapPin className="h-4 w-4 text-primary mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center text-sm bg-neutral/10 px-3 py-1 rounded-full">
                      <Users className="h-4 w-4 text-primary mr-1" />
                      <span>{property.guests} guests</span>
                    </div>
                    <div className="flex items-center text-sm bg-neutral/10 px-3 py-1 rounded-full">
                      <Home className="h-4 w-4 text-primary mr-1" />
                      <span>{property.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <Star className="h-5 w-5 text-accent fill-accent mr-1" />
                  <span className="font-semibold text-lg">{property.rating}</span>
                  <span className="text-gray-500 ml-1">({property.reviewCount} reviews)</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="prose max-w-none">
                <p className="text-lg mb-4">{property.description}</p>
                <p>{property.longDescription}</p>
              </div>
              
              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary">{property.beds}</div>
                  <div className="text-sm text-gray-600">Beds</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary">{property.baths}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-primary">{property.guests}</div>
                  <div className="text-sm text-gray-600">Max Guests</div>
                </div>
              </div>
              
              <Tabs defaultValue="amenities" className="mt-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="amenities" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                        <Check className="h-5 w-5 text-secondary flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="services" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.services.map((service, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-neutral/20">
                      <div className="flex items-center mb-4">
                        <Utensils className="h-6 w-6 text-primary mr-3" />
                          <h3 className="font-semibold text-lg">{service}</h3>
                      </div>
                      <p className="text-gray-600">
                          Enjoy this premium service during your stay. Contact the host for more details.
                      </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    {property.propertyReviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <img 
                              src={review.avatar} 
                              alt={review.user} 
                            className="w-12 h-12 rounded-full"
                            />
                            <div>
                            <div className="font-semibold">{review.user}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Star className="h-5 w-5 text-accent fill-accent mr-1" />
                            <span className="font-semibold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Location Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Map view coming soon</p>
                      </div>
                    </div>
                  </div>
                      <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{property.location}</span>
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral/5 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Nearby Attractions</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Chaka Ranch (2.5 km)</li>
                          <li>• Railway Station (1.2 km)</li>
                          <li>• Local Markets (0.8 km)</li>
                          <li>• Restaurants (0.5 km)</li>
                        </ul>
                        </div>
                      <div className="bg-neutral/5 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Getting Around</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Public transport available nearby</li>
                          <li>• Free parking on premises</li>
                          <li>• Easy access to main roads</li>
                          <li>• Walking distance to amenities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Host Information */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Your Host</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                  <img 
                    src={property.host.image} 
                    alt={property.host.name} 
                      className="w-16 h-16 rounded-full"
                  />
                  <div>
                      <div className="font-semibold text-lg">{property.host.name}</div>
                      <div className="text-sm text-gray-500">Joined {property.host.joined}</div>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                        <span className="text-sm">{property.host.rating} ({property.host.responseRate}% response rate)</span>
                      </div>
                    </div>
                    <Button className="ml-auto">Contact Host</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Section */}
            <div className="lg:w-1/3">
              <div className="sticky top-4">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                      <span className="text-2xl font-bold">${property.price}</span>
                    <span className="text-gray-500"> / night</span>
                  </div>
                  <div className="flex items-center">
                      <Star className="h-5 w-5 text-accent fill-accent mr-1" />
                      <span className="font-semibold">{property.rating}</span>
                      <span className="text-gray-500 ml-1">({property.reviewCount})</span>
                  </div>
                </div>
                
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Check-in</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? format(checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                      <div>
                        <Label>Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? format(checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Guests</Label>
                      <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guests" />
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
                      className="w-full" 
                      size="lg"
                      onClick={handleBookNow}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        'Book Now'
                      )}
                    </Button>
                    
                    <div className="text-center text-sm text-gray-500">
                      You won't be charged yet
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
