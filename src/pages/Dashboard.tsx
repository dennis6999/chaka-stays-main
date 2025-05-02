import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Calendar, Home, User, Plus, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface Booking {
  id: number;
  property_id: number;
  property_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
}

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  status: string;
  image_url: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    image_url: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [activeTab, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      if (activeTab === 'bookings' || activeTab === 'overview') {
        const response = await axios.get('/api/bookings.php', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.bookings || []);
      }
      
      if (activeTab === 'properties' || activeTab === 'overview') {
        const response = await axios.get('/api/properties.php', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProperties(response.data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch data');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      await axios.post('/api/properties.php', newProperty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Property added successfully');
      setShowAddProperty(false);
      setNewProperty({
        name: '',
        location: '',
        price: '',
        description: '',
        image_url: ''
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/auth');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Chaka Stays Dashboard</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10 border-2 border-blue-500">
              <AvatarImage src={user.picture} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={handleLogout} className="hover:bg-red-100">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Properties
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Total Bookings</span>
                    </CardTitle>
                  </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                  </CardContent>
                </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-green-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="h-5 w-5" />
                    <span>Active Properties</span>
                    </CardTitle>
                  </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-green-600">
                    {properties.filter(p => p.status === 'active').length}
                  </p>
                  </CardContent>
                </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <span>Total Revenue</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-purple-600">
                    ${bookings.reduce((sum, booking) => sum + booking.total_price, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{booking.property_name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.check_in).toLocaleDateString()} -{' '}
                          {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.total_price}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>
                
          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
                    <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                          <div>
                          <h3 className="font-semibold text-lg">{booking.property_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.check_in).toLocaleDateString()} -{' '}
                            {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                          <p className="font-semibold text-lg">${booking.total_price}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                              {booking.status}
                          </span>
                        </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
            </TabsContent>
            
            {/* Properties Tab */}
            <TabsContent value="properties">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddProperty(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            {showAddProperty && (
              <Card className="mb-6 bg-white shadow-lg">
                <CardContent className="pt-6">
                  <form onSubmit={handleAddProperty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Property Name</label>
                        <input
                          type="text"
                          value={newProperty.name}
                          onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          value={newProperty.location}
                          onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                        <input
                          type="number"
                          value={newProperty.price}
                          onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                          />
                        </div>
                            <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                          type="text"
                          value={newProperty.image_url}
                          onChange={(e) => setNewProperty({...newProperty, image_url: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                              </div>
                            </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newProperty.description}
                        onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddProperty(false)}>
                        Cancel
                              </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Add Property
                              </Button>
                            </div>
                  </form>
                </CardContent>
              </Card>
            )}
                          
            {isLoading ? (
                              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <img
                        src={property.image_url || 'https://via.placeholder.com/300x200'}
                        alt={property.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="font-semibold text-lg">${property.price}/night</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                            </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                              </div>
                    </CardContent>
                  </Card>
                ))}
                            </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24 border-4 border-blue-500">
                      <AvatarImage src={user.picture} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-semibold">{user.name}</h3>
                      <p className="text-gray-500">{user.email}</p>
                            </div>
                          </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Account Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">User Type:</span> {user.user_type}</p>
                        <p><span className="font-medium">Member Since:</span> {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        {user.phone && <p><span className="font-medium">Phone:</span> {user.phone}</p>}
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
