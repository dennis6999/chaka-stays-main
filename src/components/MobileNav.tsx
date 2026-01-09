import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

const MobileNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Enhanced active check
    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) {
            // Special handling for dashboard tabs if query params exist logic could be added here
            // For now, simpler exact match for dashboard main sections prevents duplicate highlights
            if (path.includes('?')) {
                return location.search.includes(path.split('?')[1]);
            }
            return true;
        }
        return false;
    };

    const navItems = [
        {
            icon: Home,
            label: 'Home',
            path: '/',
        },
        {
            icon: Search,
            label: 'Stays',
            path: '/properties',
        },
        {
            icon: Heart,
            label: 'Saved',
            path: user ? '/dashboard?tab=favorites' : '/auth',
        },
        {
            icon: User,
            label: user ? 'Profile' : 'Log In',
            path: user ? '/dashboard?tab=bookings' : '/auth',
        }
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-full px-6 py-4 flex justify-between items-center transition-all duration-300">
                {navItems.map((item) => {
                    const active = location.pathname + location.search === item.path || (item.path === '/' && location.pathname === '/') || (item.path === '/properties' && location.pathname.startsWith('/properties')) || (item.path.includes('dashboard') && location.pathname === '/dashboard' && location.search.includes(item.path.split('?')[1]));

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={cn(
                                "relative group flex flex-col items-center justify-center transition-all duration-300",
                                active ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                active ? "bg-primary/10" : "bg-transparent group-active:scale-90"
                            )}>
                                <item.icon className={cn("h-6 w-6 transition-all duration-300", active && "fill-primary/20")} />
                            </div>
                            {active && (
                                <span className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full animate-fade-in" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
