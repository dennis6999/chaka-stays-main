import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, BedDouble, DollarSign, MapPin, Home, Image, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

const ListProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    bedrooms: '1',
    bathrooms: '1',
    price: '',
    description: '',
    image_url: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Map id to state key if needed, or update input ids to match state keys
    // For simplicity, I'll assume input IDs match state keys or I handle them manually
    if (id === 'property-name') setFormData(prev => ({ ...prev, title: value }));
    else if (id === 'location') setFormData(prev => ({ ...prev, location: value }));
    else if (id === 'price') setFormData(prev => ({ ...prev, price: value }));
    else if (id === 'description') setFormData(prev => ({ ...prev, description: value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Uploading image...');
      const url = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to list a property');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const propertyData = {
        host_id: user.id,
        title: formData.title,
        location: formData.location,
        price_per_night: parseFloat(formData.price),
        description: formData.description,
        images: formData.image_url ? [formData.image_url] : [],
        amenities: ['Wifi', 'Parking'], // Default
        max_guests: parseInt(formData.bedrooms) * 2, // Estimate
        bedrooms: parseInt(formData.bedrooms),
        beds: parseInt(formData.bedrooms),
        baths: parseInt(formData.bathrooms)
      };

      await api.createProperty(propertyData);
      toast.success('Property listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error listing property:', error);
      toast.error('Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-neutral/30 pb-16">
        {/* Hero section */}
        <div className="bg-accent py-16">
          <div className="chaka-container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                List Your Property in Chaka Town
              </h1>
              <p className="text-xl text-white/90">
                Share your space with travelers and earn income while showcasing
                the best of Kenyan hospitality.
              </p>
            </div>
          </div>
        </div>

        <div className="chaka-container mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>Provide information about your property</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="property-name">Property Name</Label>
                        <Input
                          id="property-name"
                          placeholder="e.g. Cozy Chaka Suite"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="property-type">Property Type</Label>
                        <Select onValueChange={(value) => handleSelectChange('type', value)}>
                          <SelectTrigger id="property-type">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="room">Private Room</SelectItem>
                            <SelectItem value="cottage">Cottage</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location">Location in Chaka Town</Label>
                        <Input
                          id="location"
                          placeholder="Specific area in Chaka Town"
                          value={formData.location}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bedrooms">Bedrooms</Label>
                          <Select onValueChange={(value) => handleSelectChange('bedrooms', value)}>
                            <SelectTrigger id="bedrooms">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bathrooms">Bathrooms</Label>
                          <Select onValueChange={(value) => handleSelectChange('bathrooms', value)}>
                            <SelectTrigger id="bathrooms">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="price">Price per Night (KES)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            className="pl-10"
                            placeholder="75"
                            value={formData.price}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Property Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your property, amenities, and unique features..."
                          className="min-h-[120px]"
                          value={formData.description}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <Label>Property Images</Label>
                        <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Drag and drop images here, or click to upload</p>
                          <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB each)</p>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="file-upload"
                            onChange={handleImageUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Select Files
                          </Button>
                          {formData.image_url && (
                            <div className="text-xs text-green-600 truncate mt-2">
                              Image uploaded successfully!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Property'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Listing Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <DollarSign className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Earn extra income by sharing your space with travelers</p>
                      </li>
                      <li className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Showcase your property in the heart of Chaka Town</p>
                      </li>
                      <li className="flex items-start">
                        <Home className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Full control over your availability and house rules</p>
                      </li>
                      <li className="flex items-start">
                        <Image className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Professional photography tips to highlight your space</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hosting Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-neutral/70 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <BedDouble className="h-4 w-4 mr-2 text-secondary" />
                          Prepare Your Space
                        </h4>
                        <p className="text-sm text-gray-600">
                          Clean, tidy spaces with basic amenities get better reviews and more bookings.
                        </p>
                      </div>
                      <div className="bg-neutral/70 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Image className="h-4 w-4 mr-2 text-secondary" />
                          Quality Photos
                        </h4>
                        <p className="text-sm text-gray-600">
                          Take bright, clear photos of all areas. Show the property's best features.
                        </p>
                      </div>
                      <div className="bg-neutral/70 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-secondary" />
                          Highlight Location
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mention nearby attractions like Chaka Ranch and local amenities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListProperty;
