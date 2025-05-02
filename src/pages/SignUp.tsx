import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Home, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { DEV_SERVER_URL, getCurrentOrigin } from '@/config/google';
import axios from 'axios';

const SignUp: React.FC = () => {
  const [userType, setUserType] = useState<'guest' | 'owner'>('guest');
  const [isLoading, setIsLoading] = useState(false);
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
    setUserType(value as 'guest' | 'owner');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration attempt with:', { userType, ...formData });
    setIsLoading(true);

    try {
      const data = {
        user_type: userType,
        ...formData
      };
      console.log('Calling register function with data:', data);
      const response = await register(data);
      console.log('Registration response:', response);
      
      toast({
        title: 'Success',
        description: 'Your account has been created successfully.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error response:', error.response);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Registration failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        console.log('Google sign up successful:', response);

        // Get user info from Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );
        console.log('Google user info:', userInfo.data);

        // Send the token to your backend
        const backendResponse = await axios.post('http://localhost/api/google-auth.php', {
          token: response.access_token,
          user_info: userInfo.data,
          user_type: userType,
          origin: getCurrentOrigin()
        });

        console.log('Backend response:', backendResponse.data);

        // Store the JWT token
        localStorage.setItem('token', backendResponse.data.token);

        toast({
          title: 'Success',
          description: 'Your account has been created with Google successfully.',
        });
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Google sign up error:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Google sign up failed. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google sign up error:', error);
      toast({
        title: 'Error',
        description: 'Google sign up failed. Please try again.',
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-neutral/30 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <Tabs value={userType} className="w-full" onValueChange={handleUserTypeChange}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="guest">
                    <User className="w-4 h-4 mr-2" />
                    Guest
                  </TabsTrigger>
                  <TabsTrigger value="owner">
                    <Home className="w-4 h-4 mr-2" />
                    Property Owner
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name" 
                        name="full_name" 
                        type="text" 
                        placeholder="Enter your full name" 
                        value={formData.full_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="Create a password" 
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="owner">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input 
                        id="business_name" 
                        name="business_name" 
                        type="text" 
                        placeholder="Enter your business name" 
                        value={formData.business_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner_name">Owner Name</Label>
                      <Input 
                        id="owner_name" 
                        name="owner_name" 
                        type="text" 
                        placeholder="Enter owner's full name" 
                        value={formData.owner_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_email">Business Email</Label>
                      <Input 
                        id="business_email" 
                        name="business_email" 
                        type="email" 
                        placeholder="Enter business email" 
                        value={formData.business_email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_phone">Business Phone</Label>
                      <Input 
                        id="business_phone" 
                        name="business_phone" 
                        type="tel" 
                        placeholder="Enter business phone" 
                        value={formData.business_phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={() => handleGoogleSignUp()}
                disabled={isLoading}
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="h-5 w-5 mr-2"
                />
                Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp; 