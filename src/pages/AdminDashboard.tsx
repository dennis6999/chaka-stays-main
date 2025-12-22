import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, Home, Calendar, TrendingUp, ShieldAlert, LogOut,
    Trash2, Search, MapPin, Menu, Ban, CheckCircle, MoreHorizontal
} from 'lucide-react';
import { api, Property } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, properties: 0, bookings: 0, revenue: 0 });
    const [usersList, setUsersList] = useState<any[]>([]);
    const [propertiesList, setPropertiesList] = useState<Property[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setIsLoading(true);
            const [adminStats, allUsers, allProperties] = await Promise.all([
                api.getAdminStats(),
                api.getAllUsers(),
                api.getProperties()
            ]);

            setStats(adminStats);
            setUsersList(allUsers || []);
            setPropertiesList(allProperties || []);

        } catch (error: any) {
            console.error("Admin Load Error", error);
            const msg = error?.message || "Unknown error";
            toast.error(`Failed to load admin data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProperty = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

        try {
            await api.deleteProperty(id);
            setPropertiesList(prev => prev.filter(p => p.id !== id));
            toast.success("Property deleted via Admin Override");
            // Refresh stats
            const adminStats = await api.getAdminStats();
            setStats(adminStats);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete property. Check database permissions.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral/5">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Custom Admin Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        <span className="font-serif font-bold text-xl tracking-tight">Chaka Stays Admin</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-2">Super User</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden md:inline-block">
                            Logged in as {user?.email}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                            View Site
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="h-4 w-4 mr-2" /> Exit
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-neutral/10 p-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">Users ({usersList.length})</TabsTrigger>
                        <TabsTrigger value="properties">Properties ({propertiesList.length})</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                                    <Home className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.properties}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
                                    <Calendar className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.bookings}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">KES {stats.revenue.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="animate-fade-in">
                        <Card>
                            <CardHeader><CardTitle>Registered Users</CardTitle></CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Contact</th>
                                                <th className="px-6 py-3">Role</th>
                                                <th className="px-6 py-3">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {usersList.map((u) => (
                                                <tr key={u.id} className="bg-card hover:bg-muted/50">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                            {u.full_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{u.full_name || 'No Name'}</div>
                                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{u.phone || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        {u.is_admin ?
                                                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Admin</Badge> :
                                                            <Badge variant="outline">{u.role || 'Guest'}</Badge>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Properties Tab */}
                    <TabsContent value="properties" className="animate-fade-in">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>All Properties</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search properties..." className="pl-8" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {propertiesList.map((property) => (
                                        <div key={property.id} className="flex flex-col md:flex-row items-center border rounded-lg p-4 gap-4 hover:bg-muted/30 transition-colors">
                                            <img
                                                src={property.images?.[0] || 'https://via.placeholder.com/150'}
                                                alt={property.title}
                                                className="w-full md:w-32 h-20 object-cover rounded-md"
                                            />
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="font-bold font-serif">{property.title}</h4>
                                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-1">
                                                    <MapPin className="h-3 w-3" /> {property.location}
                                                </div>
                                                <div className="text-sm mt-1">
                                                    Hosted by <span className="font-medium text-foreground">{(property as any).host_id}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="font-bold text-lg">KES {property.price_per_night}</div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteProperty(property.id, property.title)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Ban / Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
