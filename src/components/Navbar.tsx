import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User, Home, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from './NotificationDropdown';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Premium Navbar Styles
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled || !isHome
    ? 'glass-nav py-4 shadow-sm'
    : 'bg-transparent py-6'
    }`;

  const linkBaseClasses = "text-sm font-medium tracking-wide transition-all duration-300 relative group";

  // Link colors adapt to background
  const linkColorClasses = isScrolled || !isHome
    ? 'text-foreground/80 hover:text-primary'
    : 'text-white/90 hover:text-white';

  const logoColorClass = isScrolled || !isHome ? 'text-foreground' : 'text-white';
  const logoAccentClass = isScrolled || !isHome ? 'text-primary' : 'text-white/80';
  const iconColorClass = isScrolled || !isHome ? 'text-primary' : 'text-white';
  const mobileMenuIconClass = isScrolled || !isHome ? 'text-foreground' : 'text-white';

  return (
    <nav className={navbarClasses}>
      <div className="chaka-container">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group relative z-50">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isScrolled || !isHome ? 'bg-primary/10' : 'bg-white/10 backdrop-blur-sm'}`}>
              <Home className={`w-6 h-6 transition-colors duration-300 ${iconColorClass}`} />
            </div>
            <span className={`text-2xl font-serif font-bold tracking-tight transition-colors duration-300 ${logoColorClass}`}>
              Chaka<span className={logoAccentClass}>Stays</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${linkBaseClasses} ${linkColorClasses}`}>
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-70"></span>
            </Link>
            <Link to="/properties" className={`${linkBaseClasses} ${linkColorClasses}`}>
              <span>Stay</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-70"></span>
            </Link>
            <Link to="/about" className={`${linkBaseClasses} ${linkColorClasses}`}>
              <span>Our Story</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-70"></span>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <NotificationDropdown iconClassName={iconColorClass} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0 overflow-hidden hover:scale-105 duration-300">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback className="bg-primary text-white font-serif">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-card border-none mt-2 p-2" align="end" forceMount>
                    {user.is_admin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary font-bold">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95 duration-300">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="md:hidden flex items-center gap-2 z-50">
            {user && <NotificationDropdown iconClassName={mobileMenuIconClass} />}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-transparent transition-colors duration-300 ${mobileMenuIconClass}`}
                >
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm-[350px] flex flex-col pt-0 border-l border-zinc-200/50 bg-white/80 backdrop-blur-xl p-0 text-zinc-950 shadow-2xl">

                {/* Mobile Menu Header */}
                <div className="p-6 pb-2 pt-8">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-2xl font-serif font-bold tracking-tight text-zinc-950">
                      Chaka<span className="text-primary">Stays</span>
                    </span>
                    {/* Close button is handled by Sheet primitive, but we can add brand element here */}
                  </div>

                  {/* User Profile Card (Mobile) */}
                  {user ? (
                    <div className="bg-white/60 rounded-2xl p-4 border border-zinc-100 shadow-sm mb-6 flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback className="bg-primary text-white font-serif text-lg">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-medium text-zinc-950 truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <SheetClose asChild>
                        <Link to="/auth">
                          <Button className="w-full text-lg h-12 bg-primary text-white hover:bg-primary/90 font-bold rounded-full shadow-lg shadow-primary/20">
                            Sign In / Sign Up
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>

                <div className="flex flex-col px-6 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-2">Explore</p>

                  {[
                    { to: '/', label: 'Home', delay: 'delay-100' },
                    { to: '/properties', label: 'Stays', delay: 'delay-200' },
                    { to: '/about', label: 'Our Story', delay: 'delay-300' }
                  ].map((link, i) => (
                    <SheetClose key={link.to} asChild>
                      <Link
                        to={link.to}
                        className={`text-3xl font-serif font-bold text-zinc-800 hover:text-primary transition-all py-3 px-2 rounded-xl hover:bg-zinc-50 animate-in slide-in-from-right-10 fade-in duration-500 fill-mode-both ${link.delay}`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="h-px bg-zinc-100 my-6" />

                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-2">Account</p>

                  {user ? (
                    <div className="space-y-1">
                      {user.is_admin && (
                        <SheetClose asChild>
                          <Link to="/admin" className="flex items-center text-lg font-medium text-zinc-600 hover:text-primary hover:bg-zinc-50 p-3 rounded-lg transition-colors">
                            <User className="mr-3 h-5 w-5" /> Admin Panel
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link to="/dashboard" className="flex items-center text-lg font-medium text-zinc-600 hover:text-primary hover:bg-zinc-50 p-3 rounded-lg transition-colors">
                          <User className="mr-3 h-5 w-5" /> Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button onClick={handleLogout} className="w-full flex items-center text-lg font-medium text-red-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-lg transition-colors">
                          <LogOut className="mr-3 h-5 w-5" /> Log out
                        </button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="px-2 text-muted-foreground text-sm italic">
                      Log in to access your dashboard and bookings.
                    </div>
                  )}

                  <div className="mt-8">
                    <SheetClose asChild>
                      <Link to={user ? "/dashboard" : "/auth"}>
                        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-5 text-center relative overflow-hidden group shadow-lg shadow-primary/20">
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="text-xl font-bold text-white mb-1 relative z-10">Host your home</h4>
                          <p className="text-white/90 text-sm relative z-10">Earn income by sharing your space</p>
                        </div>
                      </Link>
                    </SheetClose>
                  </div>
                </div>

                <div className="p-6 text-center border-t border-zinc-100">
                  <p className="text-xs text-muted-foreground">© 2024 Chaka Stays. All rights reserved.</p>
                </div>

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
