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
            ) : (
              <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95 duration-300">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="md:hidden flex items-center z-50">
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
              <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col pt-12">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="text-2xl font-serif font-bold">Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-6 flex-grow">
                  <div className="space-y-4">
                    <SheetClose asChild>
                      <Link to="/" className="flex items-center text-lg font-medium hover:text-primary transition-colors py-2">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/properties" className="flex items-center text-lg font-medium hover:text-primary transition-colors py-2">
                        Stays
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/about" className="flex items-center text-lg font-medium hover:text-primary transition-colors py-2">
                        Our Story
                      </Link>
                    </SheetClose>
                  </div>

                  <div className="w-full h-px bg-border/50"></div>

                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback className="bg-primary text-white">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Link to="/dashboard" className="flex items-center text-lg font-medium hover:text-primary transition-colors py-2">
                          <User className="mr-3 h-5 w-5" /> Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <div
                          onClick={handleLogout}
                          className="flex items-center text-lg font-medium text-destructive hover:text-destructive/80 transition-colors py-2 cursor-pointer"
                        >
                          <LogOut className="mr-3 h-5 w-5" /> Logout
                        </div>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <SheetClose asChild>
                        <Button asChild className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-md">
                          <Link to="/auth">Sign In</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}

                  <div className="mt-auto">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full border-primary/20 text-primary hover:text-primary hover:bg-primary/5">
                        <Link to={user ? "/dashboard" : "/auth"}>Host a Property</Link>
                      </Button>
                    </SheetClose>
                  </div>
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
