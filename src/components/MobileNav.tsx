import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

const MobileNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

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
            path: user ? '/dashboard' : '/auth', // Redirect to dashboard favorites or auth
            // Ideally we'd deep link to favorites tab, but dashboard is fine
        },
        {
            icon: User,
            label: user ? 'Profile' : 'Log In',
            path: user ? '/dashboard' : '/auth',
        }
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-full px-6 py-4 flex justify-between items-center transition-all duration-300">
                {navItems.map((item) => {
                    const active = isActive(item.path);
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
                            {/* Optional: Label (hidden for cleaner look, or visible if requested) -> keeping clean for "slickness" */}
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
