
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Jane Doe",
    location: "Nairobi, Kenya",
    rating: 5,
    comment: "The perfect blend of local charm and comfort. The staff made me feel like family, and the room service was exceptional. Will definitely return!",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "John Smith",
    location: "London, UK",
    rating: 4,
    comment: "A wonderful place to experience authentic Kenyan hospitality. The room was clean, spacious and the homemade meals were delicious.",
    image: "https://randomuser.me/api/portraits/men/42.jpg"
  },
  {
    id: 3,
    name: "Maria Garcia",
    location: "Madrid, Spain",
    rating: 5,
    comment: "My stay at Chaka was incredible. The property owners were so helpful with local recommendations and the amenities were perfect for our family.",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="chaka-container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Guest Experiences</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Stories from travelers who found their sanctuary with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-14 w-14 rounded-full mr-4 object-cover border-2 border-white/20"
                />
                <div>
                  <h4 className="font-serif font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? 'text-secondary fill-secondary' : 'text-white/20'
                      }`}
                  />
                ))}
              </div>

              <p className="text-white/90 italic leading-relaxed">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
