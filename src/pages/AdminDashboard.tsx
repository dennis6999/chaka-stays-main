import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Home, Calendar, TrendingUp, ShieldAlert, LogOut } from 'lucide-react';
import { api } from '../services/api';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, properties: 0, bookings: 0, revenue: 0 });
    const [usersList, setUsersList] = useState<any[]>([]);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/auth');
            return;
        }

        const checkAdmin = async () => {
             // In a real app, this should be checked on the server/RLS level as well
             // Currently relying on the API simply failing if RLS blocks it
             const isAdmin = await api.isAdmin(user.id);
             if (!isAdmin) {
                 toast.error("Unauthorized access");
                 navigate('/');
                 return;
             }
             fetchAdminData();
        };
        checkAdmin();

    }, [user, loading, navigate]);

    const fetchAdminData = async () => {
        try {
            setIsLoading(true);
            const adminStats = await api.getAdminStats();
            setStats(adminStats);

            const allUsers = await api.getAllUsers();
            setUsersList(allUsers || []);

        } catch (error) {
            console.error("Admin Load Error", error);
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral/5">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 px-3 py-1">
                                <ShieldAlert className="h-3 w-3 mr-1" /> Admin Panel
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-serif font-bold">Platform Overview</h1>
                        <p className="text-muted-foreground">Manage users, listings, and view global metrics.</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif">{stats.users}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                            <Home className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif">{stats.properties}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif">{stats.bookings}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif text-green-700">
                                KES {stats.revenue.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table Table */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-neutral/5">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u) => (
                                        <tr key={u.id} className="bg-white border-b hover:bg-neutral/5">
                                            <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {u.full_name?.charAt(0) || '?'}
                                                </div>
                                                {u.full_name || 'No Name'}
                                            </td>
                                            <td className="px-6 py-4">{u.phone || '-'}</td>
                                            <td className="px-6 py-4">
                                                {u.is_admin ? 
                                                    <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Admin</Badge> : 
                                                    <Badge variant="outline">User</Badge>
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
            </div>
        </div>
    );
};

import { Badge } from '@/components/ui/badge';

export default AdminDashboard;
