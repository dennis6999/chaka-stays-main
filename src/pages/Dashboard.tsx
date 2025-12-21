import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Calendar, Home, User, Plus, Edit, Trash, MapPin, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
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

import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { api, Property, Booking } from '../services/api';

const Dashboard: React.FC = () => {
  const { user, loading, logout, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState({
    bookingGrowth: 0,
    revenueGrowth: 0,
    totalRevenue: 0,
    totalSpent: 0,
    totalTrips: 0,
    totalHostingBookings: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  });

  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    image_url: '',
    max_guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cancellation Dialog State
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [activeTab, user, loading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const userBookings = await api.getUserBookings(user.id);
      setBookings(userBookings);

      // --- Traveler Analytics ---
      const myTrips = userBookings.filter(b => b.status !== 'cancelled');
      const totalSpent = myTrips.reduce((sum, b) => sum + b.total_price, 0);

      // --- Host Analytics ---
      let hostingRevenue = 0;
      let totalHostingBookings = 0;
      let hostProperties: Property[] = [];

      try {
        hostProperties = await api.getHostProperties(user.id);
        setProperties(hostProperties);

        if (hostProperties.length > 0) {
          const hostBookings = await api.getHostBookings(user.id);
          totalHostingBookings = hostBookings.length;
          hostingRevenue = hostBookings.reduce((sum, b) => sum + b.total_price, 0);
        }
      } catch (err) {
        console.error("Error fetching host data", err);
      }

      // --- Favorites ---
      try {
        const userFavorites = await api.getUserFavorites(user.id);
        setFavorites(userFavorites);
      } catch (err) {
        console.error("Error fetching favorites", err);
      }

      setAnalytics({
        bookingGrowth: 0, // Simplified for now
        revenueGrowth: 0,
        totalRevenue: hostingRevenue, // This is now REAL revenue
        totalSpent: totalSpent,
        totalTrips: myTrips.length,
        totalHostingBookings
      });

      if (activeTab === 'properties') {
        const hostProperties = await api.getHostProperties(user.id);
        setProperties(hostProperties);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const propertyData = {
        host_id: user.id,
        title: newProperty.name,
        location: newProperty.location,
        price_per_night: parseFloat(newProperty.price),
        description: newProperty.description,
        images: newProperty.image_url ? [newProperty.image_url] : [],
        amenities: newProperty.amenities,
        max_guests: newProperty.max_guests,
        bedrooms: newProperty.bedrooms,
        beds: newProperty.beds,
        baths: newProperty.baths
      };

      if (editingId) {
        const updated = await api.updateProperty(editingId, propertyData);
        setProperties(properties.map(p => p.id === editingId ? updated : p));
        toast.success('Property updated successfully');
      } else {
        const createdProperty = await api.createProperty(propertyData);
        setProperties([...properties, createdProperty]);
        toast.success('Property added successfully');
      }

      closePropertyForm();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    }
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      await api.cancelBooking(bookingToCancel);
      toast.success('Booking cancelled successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.updateProfile(user.id, profileForm);
      await refreshUser();
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      toast.info('Uploading avatar...');
      const url = await api.uploadAvatar(file);
      await api.updateProfile(user.id, { avatar_url: url });
      await refreshUser();
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const closePropertyForm = () => {
    setShowAddProperty(false);
    setEditingId(null);
    setNewProperty({
      name: '',
      location: '',
      price: '',
      description: '',
      image_url: '',
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      amenities: []
    });
  };

  const startEditing = (property: Property) => {
    setNewProperty({
      name: property.title,
      location: property.location,
      price: property.price_per_night.toString(),
      description: property.description,
      image_url: property.images?.[0] || '',
      max_guests: property.max_guests || 2,
      bedrooms: property.bedrooms || 1,
      beds: property.beds || 1,
      baths: property.baths || 1,
      amenities: property.amenities || []
    });
    setEditingId(property.id);
    setShowAddProperty(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="chaka-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleLogout} className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                Log out
              </Button>
              <Button onClick={() => {
                setShowAddProperty(true);
                setEditingId(null); // Ensure we are in create mode
                setNewProperty({
                  name: '',
                  location: '',
                  price: '',
                  description: '',
                  image_url: '',
                  max_guests: 2,
                  bedrooms: 1,
                  beds: 1,
                  baths: 1,
                  amenities: []
                });
                setActiveTab('properties');
              }} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> New Listing
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none space-x-2 md:space-x-6 overflow-x-auto flex-nowrap -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-4 py-3 font-serif font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-lg whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="rounded-none border-b-2 border-transparent px-4 py-3 font-serif font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-lg whitespace-nowrap"
              >
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="rounded-none border-b-2 border-transparent px-4 py-3 font-serif font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-lg whitespace-nowrap"
              >
                Favorites
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="rounded-none border-b-2 border-transparent px-4 py-3 font-serif font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-lg whitespace-nowrap"
              >
                My Properties
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent px-4 py-3 font-serif font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-lg whitespace-nowrap"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-fade-in">

              {/* Traveler Stats */}
              <div>
                <h3 className="text-lg font-serif font-bold mb-4">Traveler Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">My Trips</CardTitle>
                      <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold font-serif">{analytics.totalTrips}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total bookings made</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                      <div className="text-primary font-bold">KES</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold font-serif">
                        KES {analytics.totalSpent.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Lifetime spend on stays</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Host Stats - Only show if they have properties */}
              {properties.length > 0 && (
                <div>
                  <h3 className="text-lg font-serif font-bold mb-4 mt-2">Hosting Stats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                        <Home className="h-4 w-4 text-secondary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold font-serif">
                          {properties.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Properties listed</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">My Guests</CardTitle>
                        <User className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold font-serif">
                          {analytics.totalHostingBookings}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total bookings received</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <div className="text-green-600 font-bold">KES</div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold font-serif text-green-700">
                          KES {analytics.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold">Recent Activity</h3>
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="grid gap-0">
                    {bookings.slice(0, 5).map((booking, i) => (
                      <div key={booking.id} className={`flex items-center justify-between p-4 ${i !== bookings.length - 1 ? 'border-b border-border' : ''} hover:bg-neutral/5 transition-colors`}>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold">
                            {booking.properties?.title.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{booking.properties?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.check_in).toLocaleDateString()} -{' '}
                              {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">KES {booking.total_price.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-neutral/10 flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{booking.properties?.title}</h3>
                              <p className="text-sm text-muted-foreground">ID: #{booking.id}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-6 items-center">
                            <div className="text-sm">
                              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Dates</span>
                              {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Total</span>
                              <span className="font-semibold text-lg">KES {booking.total_price.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {booking.status}
                              </span>
                            </div>
                            {booking.status !== 'cancelled' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                onClick={() => handleCancelClick(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="animate-fade-in">
              {(showAddProperty || editingId) && (
                <Card className="mb-8 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>{editingId ? 'Edit Property' : 'Add New Property'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProperty} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Property Name</label>
                          <input
                            type="text"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location</label>
                          <input
                            type="text"
                            value={newProperty.location}
                            onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price (KES)</label>
                          <input
                            type="number"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max Guests</label>
                          <input
                            type="number"
                            value={newProperty.max_guests}
                            onChange={(e) => setNewProperty({ ...newProperty, max_guests: parseInt(e.target.value) || 1 })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bedrooms</label>
                          <input
                            type="number"
                            value={newProperty.bedrooms}
                            onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) || 1 })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            min="0"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Beds</label>
                          <input
                            type="number"
                            value={newProperty.beds}
                            onChange={(e) => setNewProperty({ ...newProperty, beds: parseInt(e.target.value) || 1 })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Baths</label>
                          <input
                            type="number"
                            value={newProperty.baths}
                            onChange={(e) => setNewProperty({ ...newProperty, baths: parseInt(e.target.value) || 1 })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amenities</label>
                        <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-neutral/5">
                          {['Wifi', 'Parking', 'Pool', 'Gym', 'Air Conditioning', 'Kitchen', 'TV', 'Washer', 'Garden', 'Security'].map(amenity => (
                            <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newProperty.amenities.includes(amenity)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewProperty({ ...newProperty, amenities: [...newProperty.amenities, amenity] });
                                  } else {
                                    setNewProperty({ ...newProperty, amenities: newProperty.amenities.filter(a => a !== amenity) });
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              {amenity}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Property Image</label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                toast.info('Uploading image...');
                                const url = await api.uploadImage(file);
                                setNewProperty((prev) => ({ ...prev, image_url: url }));
                                toast.success('Image uploaded successfully');
                              } catch (error: any) {
                                console.error('Upload failed:', error);
                                toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
                              }
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        {newProperty.image_url && (
                          <div className="text-xs text-green-600 truncate mt-1">
                            Image uploaded: ...{newProperty.image_url.slice(-20)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          value={newProperty.description}
                          onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={closePropertyForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingId ? 'Update Listing' : 'Save Listing'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property) => (
                    <Card key={property.id} className="group bg-card border-border overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-serif font-bold text-xl mb-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {property.location}
                        </p>

                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-lg font-bold text-primary">KES {property.price_per_night}</span>
                            <span className="text-xs text-muted-foreground">/night</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => startEditing(property)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={async () => {
                              if (confirm('Are you sure you want to delete this property?')) {
                                try {
                                  await api.deleteProperty(property.id);
                                  setProperties(properties.filter(p => p.id !== property.id));
                                  toast.success('Property deleted successfully');
                                } catch (error) {
                                  console.error('Error deleting property:', error);
                                  toast.error('Failed to delete property');
                                }
                              }
                            }}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div
                    onClick={() => setShowAddProperty(true)}
                    className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-neutral/10 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                      <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-muted-foreground group-hover:text-primary">Add New Property</h3>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="animate-fade-in">
              <div className="max-w-3xl">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative group cursor-pointer">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                          <AvatarImage src={user.avatar_url} className="object-cover" />
                          <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label htmlFor="avatar-upload" className="cursor-pointer text-white flex flex-col items-center">
                            <Edit className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">Change</span>
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                      </div>

                      <div className="text-center md:text-left space-y-2">
                        <h3 className="text-3xl font-serif font-bold">{user.name}</h3>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          <span className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                            {user.user_type === 'host' ? 'Host' : 'Guest'}
                          </span>
                          <span className="bg-neutral/10 text-muted-foreground px-3 py-1 rounded-full text-sm">
                            Member since 2024
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isEditingProfile ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center">
                              <User className="h-5 w-5 mr-2 text-primary" /> Account Details
                            </h4>
                            <div className="space-y-3 bg-neutral/5 p-4 rounded-lg">
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Full Name</span>
                                <span className="font-medium">{user.name}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Email Address</span>
                                <span className="font-medium">{user.email}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Account Type</span>
                                <span className="font-medium capitalize">{user.user_type}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center">
                              <Home className="h-5 w-5 mr-2 text-primary" /> Contact Info
                            </h4>
                            <div className="space-y-3 bg-neutral/5 p-4 rounded-lg">
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Phone Number</span>
                                <span className="font-medium">{user.phone || 'Not provided'}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Location</span>
                                <span className="font-medium">Chaka, Kenya</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button variant="outline" onClick={() => {
                            setProfileForm({ full_name: user.name || '', phone: user.phone || '' });
                            setIsEditingProfile(true);
                          }}>Edit Profile</Button>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4 border-t border-border animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                              type="text"
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold">My Favorites</h2>
                  <p className="text-muted-foreground">Properties you've saved for later</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-neutral/50">
                  <div className="bg-neutral/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-6">Start exploring and save places you love!</p>
                  <Button onClick={() => navigate('/properties')} variant="outline">Explore Properties</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone, and the dates will be made available for other guests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default Dashboard;
