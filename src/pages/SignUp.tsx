import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Home, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { DEV_SERVER_URL, getCurrentOrigin } from '@/config/google';


const SignUp: React.FC = () => {
  const [userType, setUserType] = useState<'guest' | 'host'>('guest');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    full_name: '',
    business_name: '',
    owner_name: '',
    business_email: '',
    business_phone: ''
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setUserType(value as 'guest' | 'host');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        user_type: userType,
        ...formData,
        // Map host specific fields to generic auth fields if needed
        email: userType === 'host' ? formData.business_email : formData.email,
        full_name: userType === 'host' ? formData.owner_name : formData.full_name,
        phone: userType === 'host' ? formData.business_phone : formData.phone,
      };
      const { error } = await register(data);

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: 'Account created',
        description: 'Please confirm your email address.',
      });
      // Removed navigate('/dashboard') to show success screen
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex w-full">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background">
          <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Check your inbox</h2>
            <p className="text-muted-foreground font-light text-lg">
              We've sent a confirmation link to <span className="font-medium text-foreground">{formData.email || formData.business_email}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Please verify your account to complete your registration and log in.
            </p>
            <div className="pt-6">
              <Button asChild variant="outline" className="w-full h-12">
                <Link to="/auth">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Visual Side */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A2F25] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2670&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F25] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
            <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-white/90">Chaka Stays</Link>
            <div className="space-y-6 max-w-lg mb-20">
              <h1 className="text-5xl font-serif font-medium leading-tight">Almost there...</h1>
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Your journey with Chaka Stays is just one click away.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Begin Your Journey</h2>
            <p className="text-muted-foreground font-light">Create your account to start exploring or hosting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <Tabs value={userType} className="w-full" onValueChange={handleUserTypeChange}>
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="guest" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Traveler
                </TabsTrigger>
                <TabsTrigger value="host" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
                  <Home className="w-4 h-4 mr-2" />
                  Property Owner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guest" className="animate-fade-in mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+254 7..."
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                  />
                </div>
              </TabsContent>

              <TabsContent value="host" className="animate-fade-in mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    type="text"
                    placeholder="e.g. Safari Stays Ltd"
                    value={formData.business_name}
                    onChange={handleChange}
                    className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      name="owner_name"
                      type="text"
                      placeholder="Full Name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className="h-11 bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input
                      id="business_phone"
                      name="business_phone"
                      type="tel"
                      placeholder="+254 7..."
                      value={formData.business_phone}
                      onChange={handleChange}
                      className="h-11 bg-white/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_email">Business Email</Label>
                  <Input
                    id="business_email"
                    name="business_email"
                    type="email"
                    placeholder="host@business.com"
                    value={formData.business_email}
                    onChange={handleChange}
                    className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host-password">Create Password</Label>
                  <Input
                    id="host-password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

          </form>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A2F25] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2670&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F25] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-white/90">Chaka Stays</Link>
          <div className="space-y-6 max-w-lg mb-20">
            <h1 className="text-5xl font-serif font-medium leading-tight">Join our unique <br />community.</h1>
            <p className="text-lg text-white/80 font-light leading-relaxed">
              Whether you're seeking a serene escape or listing a hidden gem, Chaka Stays connects you with authentic experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;