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
import { AdminDashboardSkeleton } from '@/components/AdminDashboardSkeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

interface UserProfile {
    id: string;
    email?: string;
    full_name?: string;
    is_admin?: boolean;
    created_at: string;
    role?: string;
}

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, properties: 0, bookings: 0, revenue: 0 });
    const [usersList, setUsersList] = useState<UserProfile[]>([]);
    const [propertiesList, setPropertiesList] = useState<Property[]>([]);
    const [activeView, setActiveView] = useState<'overview' | 'users' | 'properties'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'delete' | 'ban' | 'unban' | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<{ id: string, title: string } | null>(null);

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
        } catch (error: unknown) {
            console.error("Admin Load Error", error);
            const msg = (error as Error)?.message || "Unknown error";
            toast.error(`Failed to load admin data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Open Dialog handlers
    const confirmDelete = (id: string, title: string) => {
        setSelectedProperty({ id, title });
        setActionType('delete');
        setDialogOpen(true);
    };

    const confirmBanStatus = (id: string, currentStatus: boolean, title: string) => {
        setSelectedProperty({ id, title });
        setActionType(currentStatus ? 'unban' : 'ban');
        setDialogOpen(true);
    };

    // Execute logic
    const handleExecuteAction = async () => {
        if (!selectedProperty || !actionType) return;

        const { id, title } = selectedProperty;

        try {
            if (actionType === 'delete') {
                await api.deleteProperty(id);
                setPropertiesList(prev => prev.filter(p => p.id !== id));
                toast.success("Property permanently deleted");
                refreshStats();
            } else if (actionType === 'ban') {
                await api.toggleBanProperty(id, true);
                setPropertiesList(prev => prev.map(p => p.id === id ? { ...p, is_banned: true } : p));
                toast.success("Property BANNED successfully");
            } else if (actionType === 'unban') {
                await api.toggleBanProperty(id, false);
                setPropertiesList(prev => prev.map(p => p.id === id ? { ...p, is_banned: false } : p));
                toast.success("Property Unbanned successfully");
            }
        } catch (error: unknown) {
            console.error("Action failed", error);
            const msg = (error as Error)?.message || "Unknown error";
            toast.error(`Action failed: ${msg}`);
        } finally {
            setDialogOpen(false);
            setSelectedProperty(null);
            setActionType(null);
        }
    };

    const refreshStats = async () => {
        const adminStats = await api.getAdminStats();
        setStats(adminStats);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // --- Components ---

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300">
            <div className="p-6 flex items-center gap-3 text-white border-b border-white/10">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                <span className="font-serif font-bold text-xl tracking-wide">Chaka Admin</span>
            </div>

            <div className="flex-1 py-6 space-y-1 px-3">
                <button
                    onClick={() => { setActiveView('overview'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-white/5'}`}
                >
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Overview</span>
                </button>
                <button
                    onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-white/5'}`}
                >
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Users Management</span>
                </button>
                <button
                    onClick={() => { setActiveView('properties'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'properties' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-white/5'}`}
                >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Properties</span>
                </button>
            </div>

            <div className="p-4 border-t border-white/10 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" onClick={() => navigate('/')}>
                    <TrendingUp className="h-4 w-4 mr-2" /> View Live Site
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
            </div>
        </div>
    );

    interface StatCardProps {
        title: string;
        value: string | number;
        icon: React.ElementType;
        colorClass: string;
        trend?: string;
    }

    const StatCard = ({ title, value, icon: Icon, colorClass, trend }: StatCardProps) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral/10 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            {trend && <div className="text-xs text-green-600 mt-2 font-medium">{trend}</div>}
        </div>
    );

    if (isLoading) {
        return <AdminDashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="bg-white border-none shadow-2xl rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">
                            {actionType === 'delete' && <span className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" /> Permanently Delete Property?</span>}
                            {actionType === 'ban' && <span className="flex items-center gap-2 text-amber-600"><Ban className="h-5 w-5" /> Ban Property?</span>}
                            {actionType === 'unban' && <span className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Unban Property?</span>}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 pt-2 text-base">
                            {actionType === 'delete' && `Are you sure you want to delete "${selectedProperty?.title}"? This action CANNOT be undone and will remove all associated data.`}
                            {actionType === 'ban' && `This will hide "${selectedProperty?.title}" from the public site immediately. You can unban it later.`}
                            {actionType === 'unban' && `This will make "${selectedProperty?.title}" visible to the public again.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="border-slate-200 hover:bg-slate-50 text-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleExecuteAction}
                            className={`
                                ${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
                                ${actionType === 'ban' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
                                ${actionType === 'unban' ? 'bg-green-600 hover:bg-green-700' : ''}
                            `}
                        >
                            Confirm {actionType === 'delete' ? 'Delete' : actionType === 'ban' ? 'Ban' : 'Unban'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50 shadow-xl">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    <span className="font-bold">Admin</span>
                </div>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger><Menu className="h-6 w-6" /></SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 bg-slate-900 w-64 text-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {activeView === 'overview' && 'Dashboard Overview'}
                                {activeView === 'users' && 'User Management'}
                                {activeView === 'properties' && 'Property Listings'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name || 'Admin'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border shadow-sm text-slate-500">
                                v1.2.0-stable
                            </span>
                        </div>
                    </div>

                    {/* Views */}
                    {activeView === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Revenue" value={`KES ${stats.revenue.toLocaleString()}`} icon={TrendingUp} colorClass="bg-green-500 text-green-600" trend="+12.5% vs last month" />
                                <StatCard title="Active Users" value={stats.users} icon={Users} colorClass="bg-blue-500 text-blue-600" trend="+8 new this week" />
                                <StatCard title="Total Bookings" value={stats.bookings} icon={Calendar} colorClass="bg-purple-500 text-purple-600" />
                                <StatCard title="Properties" value={stats.properties} icon={Home} colorClass="bg-amber-500 text-amber-600" />
                            </div>
                        </div>
                    )}

                    {activeView === 'users' && (
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-white border-b px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle>Registered Users</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Export CSV</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">User Identity</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {usersList.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                            {u.full_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="font-medium text-slate-900">{u.full_name || 'No Name'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    {u.is_admin ?
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">Admin</Badge> :
                                                        <Badge variant="outline" className="text-slate-600">Guest</Badge>
                                                    }
                                                </td>
                                                <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span></td>
                                                <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}

                    {activeView === 'properties' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search properties..." className="pl-9 bg-slate-50 border-slate-200" />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Filter</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {propertiesList.map((property) => (
                                    <div key={property.id} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-6 transition-all ${property.is_banned ? 'border-red-200 bg-red-50/10' : 'hover:border-indigo-200'}`}>
                                        <img
                                            src={property.images?.[0]}
                                            className={`w-full md:w-48 h-32 object-cover rounded-lg ${property.is_banned ? 'grayscale opacity-70' : ''}`}
                                            alt="Property"
                                        />

                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900">{property.title}</h3>
                                                {property.is_banned && <Badge variant="destructive" className="animate-pulse">BANNED</Badge>}
                                            </div>
                                            <div className="flex items-center text-slate-500 text-sm mb-3">
                                                <MapPin className="h-3 w-3 mr-1" /> {property.location}
                                                <span className="mx-2">•</span>
                                                <span className="font-medium text-slate-900">KES {property.price_per_night}</span>
                                                <span className="text-slate-400 text-xs ml-1">/ night</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="bg-slate-100 px-2 py-1 rounded">ID: {property.id.substring(0, 8)}...</span>
                                                <span>Hosted by {property.host?.full_name || '...'}</span>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:hidden ml-auto">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => confirmBanStatus(property.id, !!property.is_banned, property.title)}>
                                                        {property.is_banned ? 'Unban Property' : 'Ban Property'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(property.id, property.title)}>
                                                        Delete Permanently
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <div className="hidden md:flex flex-col gap-2 min-w-[140px]">
                                                <Button
                                                    size="sm"
                                                    variant={property.is_banned ? "default" : "outline"}
                                                    className={property.is_banned ? "bg-green-600 hover:bg-green-700 border-none" : "hover:bg-amber-50 text-amber-700 border-amber-200"}
                                                    onClick={() => confirmBanStatus(property.id, !!property.is_banned, property.title)}
                                                >
                                                    {property.is_banned ? <><CheckCircle className="h-4 w-4 mr-2" /> Unban</> : <><Ban className="h-4 w-4 mr-2" /> Ban Property</>}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => confirmDelete(property.id, property.title)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
