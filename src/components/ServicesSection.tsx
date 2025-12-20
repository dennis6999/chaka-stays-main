
import React from 'react';
import { Utensils, Coffee, Loader2, ShoppingBag, Wifi, Car } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Room Service',
    description: 'Order food and drinks directly to your room for a convenient and comfortable experience.',
    icon: Utensils
  },
  {
    id: 2,
    title: 'Breakfast',
    description: 'Start your day with a delicious breakfast featuring local and international dishes.',
    icon: Coffee
  },
  {
    id: 3,
    title: 'Laundry Service',
    description: 'Keep your clothes fresh and clean with our efficient laundry service.',
    icon: Loader2
  },
  {
    id: 4,
    title: 'Shopping Assistance',
    description: 'We can help with grocery shopping or finding local goods and souvenirs.',
    icon: ShoppingBag
  },
  {
    id: 5,
    title: 'Free Wi-Fi',
    description: 'Stay connected with reliable high-speed internet access throughout your stay.',
    icon: Wifi
  },
  {
    id: 6,
    title: 'Local Transport',
    description: 'Arrange for local transportation to explore Chaka Town and surrounding areas.',
    icon: Car
  }
];

const ServicesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="chaka-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Curated Details</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every aspect of your stay is thoughtfully considered to ensure an experience of absolute comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card border border-border p-8 rounded-xl hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-14 w-14 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                <service.icon size={28} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
