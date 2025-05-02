
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
    <section className="py-16 bg-dark text-white">
      <div className="chaka-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">What Our Guests Say</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it - hear from travelers who have experienced
            our hospitality firsthand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-dark/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-accent transition-colors"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? 'text-accent fill-accent' : 'text-gray-500'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-300 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
