import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Users, Home, Star, Heart, Globe, Award, Coffee } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/90 to-accent py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580235078962-43ab08e8f04d?q=80&w=1770&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="chaka-container relative">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Discover the Heart of <span className="text-accent">Chaka Town</span>
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Where authentic Kenyan hospitality meets modern comfort. Experience the warmth of our community through unique stays that tell a story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-white text-primary hover:bg-white/90">
                  <Link to="/properties">Explore Stays</Link>
                </Button>
                <Button asChild className="bg-accent text-white hover:bg-accent/90">
                  <Link to="/list-property">Become a Host</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mission Section */}
        <div className="py-20 bg-white">
          <div className="chaka-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="text-primary font-semibold">Our Story</span>
                </div>
                <h2 className="text-4xl font-bold text-dark">
                  More Than Just a Place to Stay
                </h2>
                <p className="text-lg text-gray-600">
                  Chaka Stays was born from a simple idea: to connect travelers with the authentic spirit of Chaka Town. We believe that the best way to experience a place is through the eyes of those who call it home.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="p-6 bg-neutral/5 rounded-xl">
                    <Heart className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Local Experience</h3>
                    <p className="text-gray-600">Immerse yourself in authentic Kenyan culture</p>
                  </div>
                  <div className="p-6 bg-neutral/5 rounded-xl">
                    <Globe className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Global Community</h3>
                    <p className="text-gray-600">Connect with travelers from around the world</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1770&auto=format&fit=crop" 
                    alt="Chaka Town Community" 
                    className="w-full h-full object-cover"
                />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-dark">5+ Years</p>
                      <p className="text-gray-600">of Trusted Hospitality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="py-20 bg-neutral/5">
          <div className="chaka-container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-dark mb-6">Our Impact</h2>
              <p className="text-lg text-gray-600">
                Join thousands of travelers who have discovered the magic of Chaka Town through our platform
                </p>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-center text-dark mb-2">50+</h3>
                <p className="text-center text-gray-600">Unique Properties</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-center text-dark mb-2">1000+</h3>
                <p className="text-center text-gray-600">Happy Guests</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Star className="h-8 w-8 text-primary" />
          </div>
                </div>
                <h3 className="text-4xl font-bold text-center text-dark mb-2">4.8</h3>
                <p className="text-center text-gray-600">Average Rating</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Coffee className="h-8 w-8 text-primary" />
              </div>
                </div>
                <h3 className="text-4xl font-bold text-center text-dark mb-2">24/7</h3>
                <p className="text-center text-gray-600">Support Available</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <div className="py-20 bg-white">
          <div className="chaka-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="text-primary font-semibold">Our Location</span>
                </div>
                <h2 className="text-4xl font-bold text-dark">
                  Experience Chaka Town
                </h2>
                <p className="text-lg text-gray-600">
                  Nestled in the heart of Nyeri County, Chaka Town offers the perfect blend of urban convenience and rural charm. Our properties are strategically located near key attractions, making it easy to explore everything the region has to offer.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-neutral/5 rounded-xl">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Prime Location</h3>
                      <p className="text-gray-600">Chaka Town, Nyeri County, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-neutral/5 rounded-xl">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Nearby Attractions</h3>
                      <p className="text-gray-600">Chaka Ranch, Railway Station, Local Markets</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1770&auto=format&fit=crop" 
                    alt="Chaka Town Location" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-dark">Central</p>
                      <p className="text-gray-600">Location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                  </div>
                  </div>

        {/* CTA Section */}
        <div className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580235078962-43ab08e8f04d?q=80&w=1770&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="chaka-container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Experience Chaka Town?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our community of travelers and hosts. Whether you're looking for a unique stay or want to share your space, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-white text-primary hover:bg-white/90">
                  <Link to="/properties">Browse Properties</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/list-property">List Your Property</Link>
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
