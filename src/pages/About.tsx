import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Users, Home, Star, Heart, Globe, Award, Coffee, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Immersive Hero Section */}
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544985338-3db4d4c553a1?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/30" />
          </div>
          <div className="chaka-container relative z-10 text-center text-white pt-20">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 drop-shadow-lg">
              Crafting Unforgettable <br className="hidden md:block" />
              <span className="text-secondary italic">Memories</span> in Chaka
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              We are defining the new standard of hospitality in Nyeri, blending modern luxury with the raw, untouched beauty of the Kenyan highlands.
            </p>
          </div>
        </div>

        {/* Our Vision & Story */}
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
          <div className="chaka-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Star className="w-3 h-3" /> Our Vision
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                  More Than Just <br /> a Place to Sleep
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
                  <p>
                    Chaka Stays began with a simple observation: while Chaka Town is a gateway to Mount Kenya and the Aberdares, finding accommodation that truly reflected the area's charm was a challenge.
                  </p>
                  <p>
                    We set out to change that. By curating a collection of unique, high-quality homes, we provide travelers with a genuine connection to the local culture, wrapped in the comfort and reliability of a world-class hotel experience.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 shadow-lg shadow-primary/25">
                    <Link to="/properties">
                      Explore Our Stays <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1770&auto=format&fit=crop"
                    alt="Chaka Landscape"
                    className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <p className="font-serif text-2xl italic">"Home is not a place, it's a feeling."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values (Glassmorphism Cards) */}
        <section className="py-20 md:py-28 bg-neutral/5">
          <div className="chaka-container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground text-lg">The principles that guide every guest experience we create.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="w-8 h-8 text-primary" />,
                  title: "Trust & Safety",
                  desc: "We rigorously vet every property and host to ensure your peace of mind from booking to checkout."
                },
                {
                  icon: <Leaf className="w-8 h-8 text-primary" />,
                  title: "Sustainability",
                  desc: "We champion eco-friendly stays that respect our beautiful highland environment and support local conservation."
                },
                {
                  icon: <Heart className="w-8 h-8 text-primary" />,
                  title: "Community First",
                  desc: "Every stay supports the local Chaka economy, empowering homeowners and local businesses."
                }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-border/50">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground/20" />
          </div>

          <div className="chaka-container relative text-center text-white">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Ready to Experience Chaka?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
              Join thousands of happy guests who have discovered their perfect sanctuary with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-white text-primary hover:bg-white/90 text-lg font-medium shadow-xl transition-transform hover:scale-105">
                <Link to="/properties">Find Your Stay</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/30 text-white hover:bg-white/10 hover:border-white text-lg font-medium backdrop-blur-sm">
                <Link to="/list-property">Become a Host</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
