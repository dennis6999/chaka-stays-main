
import React from 'react';
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
import { Upload, BedDouble, DollarSign, MapPin, Home, Image } from 'lucide-react';

const ListProperty = () => {
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
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="property-name">Property Name</Label>
                        <Input id="property-name" placeholder="e.g. Cozy Chaka Suite" />
                      </div>
                      
                      <div>
                        <Label htmlFor="property-type">Property Type</Label>
                        <Select>
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
                        <Input id="location" placeholder="Specific area in Chaka Town" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bedrooms">Bedrooms</Label>
                          <Select>
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
                          <Select>
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
                        <Label htmlFor="price">Price per Night (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input id="price" type="number" min="0" className="pl-10" placeholder="75" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Property Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Describe your property, amenities, and unique features..."
                          className="min-h-[120px]"
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
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Select Files
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Submit Property
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
