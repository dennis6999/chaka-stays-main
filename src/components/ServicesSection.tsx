
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
    <section className="py-16 bg-white">
      <div className="chaka-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-3">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a range of services to make your stay comfortable and memorable,
            from room service to local recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-neutral/30 p-6 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <service.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
