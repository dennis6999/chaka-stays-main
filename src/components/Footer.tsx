import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from './ui/button';

import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="bg-[#1A2F25] text-white/80 border-t border-white/5 font-sans">
      {/* Newsletter Section - Integrated but distinct */}
      <div className="border-b border-white/10">
        <div className="chaka-container py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center text-center lg:text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">Join our sanctuary</h3>
              <p className="text-white/70 text-base md:text-lg font-light max-w-md mx-auto lg:mx-0">
                Receive exclusive offers and stories from the heart of Kenya.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md w-full mx-auto lg:ml-auto">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-light text-sm"
                />
                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-medium px-8 transition-transform hover:scale-105 w-full sm:w-auto">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="chaka-container py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="md:col-span-4 space-y-6 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-3 group">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Chaka Stays
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed font-light text-sm md:text-base">
              Curating exceptional nature retreats in Chaka Town.
              We believe in the restorative power of nature and
              authentic Kenyan hospitality.
            </p>
            <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white hover:text-primary transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Links Section */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-10 text-center md:text-left">
            <div>
              <h4 className="font-serif font-medium text-lg text-white mb-4 md:mb-6">Discover</h4>
              <ul className="space-y-3 md:space-y-4 font-light text-sm md:text-base">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/properties" className="hover:text-white transition-colors">Stays</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to={user ? "/dashboard" : "/auth"} className="hover:text-white transition-colors">Host a Property</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-medium text-lg text-white mb-4 md:mb-6">Support</h4>
              <ul className="space-y-3 md:space-y-4 font-light text-sm md:text-base">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-serif font-medium text-lg text-white mb-4 md:mb-6">Visit</h4>
              <ul className="space-y-3 md:space-y-4 font-light text-sm md:text-base">
                <li className="flex items-start justify-center md:justify-start">
                  <MapPin className="h-5 w-5 text-white/50 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-left">Chaka Town,<br />Nyeri County, Kenya</span>
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <Mail className="h-5 w-5 text-white/50 mr-3 flex-shrink-0" />
                  <span>hello@chakastays.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 md:mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm font-light">
          <p>&copy; {new Date().getFullYear()} Chaka Stays. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
