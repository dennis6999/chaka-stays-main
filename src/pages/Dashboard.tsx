import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Calendar, Home, User, Plus, Edit, Trash, MapPin, Heart, Wallet, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
// Merged into top import
import { ManageCalendarDialog } from '@/components/ManageCalendarDialog';

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
    totalHostingBookings: 0,
    monthlyStats: [] as { name: string; revenue: number; bookings: number }[]
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
    images: [] as string[],
    max_guests: '2',
    bedrooms: '1',
    beds: '1',
    baths: '1',
    amenities: [] as string[],
    property_type: 'Stays'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Calendar Dialog State
  const [calendarProperty, setCalendarProperty] = useState<{ id: string, title: string } | null>(null);

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
      let monthlyData: Record<string, { revenue: number; bookings: number }> = {};

      try {
        hostProperties = await api.getHostProperties(user.id);
        setProperties(hostProperties);

        if (hostProperties.length > 0) {
          const hostBookings = await api.getHostBookings(user.id);
          totalHostingBookings = hostBookings.length;
          hostingRevenue = hostBookings.reduce((sum, b) => sum + b.total_price, 0);

          // Calculate Monthly Stats
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          // Initialize last 6 months
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${months[d.getMonth()]}`;
            monthlyData[key] = { revenue: 0, bookings: 0 };
          }

          hostBookings.forEach(booking => {
            const date = new Date(booking.created_at);
            const monthName = months[date.getMonth()];
            // Simplified: Just matching by month name for now. Ideally match year too.
            if (monthlyData[monthName]) {
              monthlyData[monthName].revenue += booking.total_price;
              monthlyData[monthName].bookings += 1;
            }
          });
        }
      } catch (err) {
        console.error("Error fetching host data", err);
      }

      // Convert to array
      const monthlyStats = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        bookings: data.bookings
      }));

      // --- Favorites ---
      try {
        const userFavorites = await api.getUserFavorites(user.id);
        setFavorites(userFavorites);
      } catch (err) {
        console.error("Error fetching favorites", err);
      }

      setAnalytics({
        bookingGrowth: 0,
        revenueGrowth: 0,
        totalRevenue: hostingRevenue,
        totalSpent: totalSpent,
        totalTrips: myTrips.length,
        totalHostingBookings,
        monthlyStats
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
        price_per_night: parseFloat(newProperty.price) || 0,
        description: newProperty.description,
        images: newProperty.images,
        amenities: newProperty.amenities,
        max_guests: parseInt(newProperty.max_guests) || 1,
        bedrooms: parseInt(newProperty.bedrooms) || 0,
        beds: parseInt(newProperty.beds) || 1,
        baths: parseInt(newProperty.baths) || 1,
        property_type: newProperty.property_type
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
      images: [],
      max_guests: '2',
      bedrooms: '1',
      beds: '1',
      baths: '1',
      amenities: [],
      property_type: 'Stays'
    });
  };

  const startEditing = (property: Property) => {
    setNewProperty({
      name: property.title,
      location: property.location,
      price: property.price_per_night.toString(),
      description: property.description,
      images: property.images || [],
      max_guests: (property.max_guests || 2).toString(),
      bedrooms: (property.bedrooms || 1).toString(),
      beds: (property.beds || 1).toString(),
      baths: (property.baths || 1).toString(),
      amenities: property.amenities || [],
      property_type: property.property_type || 'Stays'
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
      <div className="min-h-screen bg-slate-50 pb-20">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="mb-10">
            <div className="h-48 w-full rounded-3xl overflow-hidden relative bg-slate-200">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <Skeleton className="h-10 w-96 bg-white/10 mb-2" />
                <Skeleton className="h-5 w-64 bg-white/10" />
                <div className="absolute bottom-8 right-8">
                  <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-8 border-b border-border pb-px">
              <Skeleton className="h-10 w-24 bg-slate-200" />
              <Skeleton className="h-10 w-24 bg-slate-200" />
              <Skeleton className="h-10 w-24 bg-slate-200" />
              <Skeleton className="h-10 w-24 bg-slate-200" />
            </div>

            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-8 w-48 bg-slate-200" />
                  <Skeleton className="h-4 w-32 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-32 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20 bg-slate-100" />
                        <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                      </div>
                      <Skeleton className="h-8 w-32 bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[350px]">
                  <Skeleton className="h-6 w-48 mb-6 bg-slate-100" />
                  <Skeleton className="h-64 w-full bg-slate-50 rounded-lg" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[350px]">
                  <Skeleton className="h-6 w-48 mb-6 bg-slate-100" />
                  <Skeleton className="h-64 w-full bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="chaka-container">
          {/* Header / Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 mb-10 shadow-xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-primary-foreground/80 font-medium mb-2 tracking-wide text-sm uppercase">Host Dashboard</p>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">Welcome back, {user.name?.split(' ')[0]}</h1>
                <p className="text-slate-300 mt-2 max-w-xl">Manage your properties, track your earnings, and view your trip history all in one place.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10 hover:text-white">
                  Log out
                </Button>
                <Button onClick={() => {
                  setShowAddProperty(true);
                  setEditingId(null);
                  setNewProperty({
                    name: '',
                    location: '',
                    price: '',
                    description: '',
                    images: [],
                    max_guests: '2',
                    bedrooms: '1',
                    beds: '1',
                    baths: '1',
                    amenities: [],
                    property_type: 'Stays'
                  });
                  setActiveTab('properties');
                }} className="bg-white text-slate-900 hover:bg-white/90 font-medium shadow-none border-0">
                  <Plus className="h-4 w-4 mr-2" /> List Property
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none space-x-8 overflow-x-auto flex-nowrap mb-8">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-1 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-sm uppercase tracking-wide"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="rounded-none border-b-2 border-transparent px-1 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-sm uppercase tracking-wide"
              >
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="rounded-none border-b-2 border-transparent px-1 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-sm uppercase tracking-wide"
              >
                Favorites
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="rounded-none border-b-2 border-transparent px-1 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-sm uppercase tracking-wide"
              >
                My Properties
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent px-1 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all text-sm uppercase tracking-wide"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-10 animate-fade-in">

              {/* Unified Stats Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Performance Overview</h3>
                  <span className="text-sm text-slate-500">Last updated: Just now</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Traveler Metrics */}
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-slate-500">My Trips</p>
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <div className="text-2xl font-bold text-slate-900">{analytics.totalTrips}</div>
                        <span className="text-xs text-slate-500">bookings</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-slate-500">Invested</p>
                        <Wallet className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <div className="text-2xl font-bold text-slate-900">KES {analytics.totalSpent.toLocaleString()}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Host Metrics - Conditional */}
                  {properties.length > 0 && (
                    <>
                      <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-white">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-purple-700">Total Revenue</p>
                            <DollarSign className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <div className="text-2xl font-bold text-purple-900">KES {analytics.totalRevenue.toLocaleString()}</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-slate-500">Active Listings</p>
                            <Home className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <div className="text-2xl font-bold text-slate-900">{properties.length}</div>
                            <span className="text-xs text-slate-500">properties</span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>

              {/* Charts Section - Two Column */}
              {properties.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-none shadow-sm bg-white p-6">
                    <div className="mb-6">
                      <h4 className="font-bold text-lg text-slate-900">Revenue Trends</h4>
                      <p className="text-sm text-slate-500">Monthly earnings overview</p>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(value) => `K${value / 1000}k`} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="border-none shadow-sm bg-white p-6">
                    <div className="mb-6">
                      <h4 className="font-bold text-lg text-slate-900">Occupancy Rate</h4>
                      <p className="text-sm text-slate-500">Booking consistency</p>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.monthlyStats}>
                          <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorBookings)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {/* Recent Activity Section */}
              <div className="border-none shadow-sm bg-white rounded-xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5" onClick={() => setActiveTab('bookings')}>View All</Button>
                </div>

                <div className="space-y-1">
                  {bookings.slice(0, 5).map((booking, i) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer" onClick={() => navigate('/properties')}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {booking.properties?.title.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{booking.properties?.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">KES {booking.total_price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">No recent activity</p>
                      <p className="text-sm text-slate-400 mt-1">Your recent bookings will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="animate-fade-in space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-none bg-white shadow-sm rounded-3xl">
                  <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-slate-800">No bookings yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    You haven't made any reservations. Your next adventure is just a click away!
                  </p>
                  <Button onClick={() => navigate('/properties')} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8">
                    Explore Properties
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image or Placeholder on Left (Could be added if property has images) */}
                          <div className="md:w-2 bg-slate-100 group-hover:bg-primary/20 transition-colors" />

                          <div className="flex-grow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-6 w-6 text-slate-500" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-slate-800">{booking.properties?.title}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {booking.id.split('-')[0]}...</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-6 items-center w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-2 md:mt-0">
                              <div className="text-right mr-4">
                                <p className="text-sm text-slate-500 mb-0.5">Total</p>
                                <p className="font-bold text-xl text-slate-900">KES {booking.total_price.toLocaleString()}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>

                                {booking.status !== 'cancelled' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleCancelClick(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
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
                            onChange={(e) => setNewProperty({ ...newProperty, max_guests: e.target.value })}
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
                            onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
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
                            onChange={(e) => setNewProperty({ ...newProperty, beds: e.target.value })}
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
                            onChange={(e) => setNewProperty({ ...newProperty, baths: e.target.value })}
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

                      <div className="space-y-4">
                        <label className="text-sm font-medium">Property Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {newProperty.images.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                              <img src={img} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewProperty({ ...newProperty, images: newProperty.images.filter((_, i) => i !== index) })}
                                className="absolute top-2 right-2 p-1 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square cursor-pointer hover:bg-neutral/5 transition-colors">
                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Add Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                try {
                                  toast.info('Uploading images...');
                                  const uploadPromises = Array.from(files).map(file => api.uploadImage(file));
                                  const uploadedUrls = await Promise.all(uploadPromises);

                                  setNewProperty({
                                    ...newProperty,
                                    images: [...newProperty.images, ...uploadedUrls]
                                  });
                                  toast.success('Images uploaded successfully');
                                } catch (error) {
                                  console.error('Error uploading images:', error);
                                  toast.error('Failed to upload some images');
                                }
                              }}
                            />
                          </label>
                        </div>
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
                    <Card key={property.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-2xl">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white text-slate-900 shadow-sm" onClick={() => startEditing(property)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white text-slate-900 shadow-sm" onClick={() => setCalendarProperty({ id: property.id, title: property.title })} title="Manage Calendar">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" onClick={async () => {
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
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{property.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" /> {property.location}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <span className="text-lg font-bold text-primary">KES {property.price_per_night}</span>
                            <span className="text-xs text-slate-400">/night</span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500 gap-3">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {property.max_guests}</span>
                            <span className="flex items-center gap-1">★ 4.9</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div
                    onClick={() => setShowAddProperty(true)}
                    className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center h-full min-h-[350px] cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group bg-slate-50/50"
                  >
                    <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-4 text-primary">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-600 group-hover:text-primary transition-colors">Add New Property</h3>
                    <p className="text-sm text-slate-400 mt-2 text-center px-8">Create a new listing to start hosting guests</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-none bg-white shadow-sm rounded-3xl">
                  <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <Heart className="h-10 w-10 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-slate-800">No favorites yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    Start exploring and save your dream stays here for quick access.
                  </p>
                  <Button onClick={() => navigate('/properties')} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8">
                    Explore Properties
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((property) => (
                    <Card key={property.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-2xl cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        <div className="absolute top-3 right-3 z-10">
                          <button
                            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group/btn"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await api.removeFavorite(property.id, user.id);
                                setFavorites(favorites.filter(f => f.id !== property.id));
                                toast.success('Removed from favorites');
                              } catch (error) {
                                toast.error('Failed to remove');
                              }
                            }}
                          >
                            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                          </button>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="font-bold text-lg leading-tight line-clamp-1 text-white text-shadow-sm">{property.title}</h3>
                              <p className="text-sm text-slate-200 flex items-center mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" /> {property.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-slate-900">KES {property.price_per_night}</span>
                            <span className="text-sm text-slate-500">/night</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 font-medium px-0">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                  <div className="h-32 bg-slate-900 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                  <CardContent className="space-y-8 px-8 pb-12">
                    <div className="flex flex-col md:flex-row items-end md:items-end gap-8 -mt-16 px-4">
                      <div className="relative group cursor-pointer">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-xl bg-white">
                          <AvatarImage src={user.avatar_url} className="object-cover" />
                          <AvatarFallback className="text-4xl bg-slate-100 text-slate-500">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
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
                      <div className="mb-2 text-center md:text-left">
                        <h2 className="text-3xl font-serif font-bold text-slate-900">{user.name}</h2>
                        <p className="text-slate-500">{user.email}</p>
                        <Badge variant="outline" className="mt-2 capitalize bg-slate-50 text-slate-600 border-slate-200">{user.user_type}</Badge>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-8" />

                    {!isEditingProfile ? (
                      <div className="space-y-8 px-4">
                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                          <div>
                            <Label className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2 block">Full Name</Label>
                            <p className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">{user.name || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2 block">Email Address</Label>
                            <p className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2 block">Phone Number</Label>
                            <p className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">{user.phone || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2 block">Account ID</Label>
                            <p className="font-mono text-sm text-slate-400 bg-slate-50 p-2 rounded w-fit">{user.id}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button onClick={() => {
                            setProfileForm({
                              full_name: user.name || '',
                              phone: user.phone || ''
                            });
                            setIsEditingProfile(true);
                          }} size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-full">
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateProfile} className="space-y-8 px-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="full_name" className="text-slate-700">Full Name</Label>
                            <Input
                              id="full_name"
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                              className="h-12 border-slate-200 focus-visible:ring-primary"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="h-12 border-slate-200 focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                          <Button type="button" variant="ghost" size="lg" onClick={() => setIsEditingProfile(false)} className="rounded-full">
                            Cancel
                          </Button>
                          <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">Save Changes</Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
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
              Are you sure you want to cancel this booking? This action cannot be undone.
              Refunds are processed according to the cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ManageCalendarDialog
        propertyId={calendarProperty?.id || null}
        propertyTitle={calendarProperty?.title || ''}
        isOpen={!!calendarProperty}
        onClose={() => setCalendarProperty(null)}
      />
    </div>
  );
};

export default Dashboard;
