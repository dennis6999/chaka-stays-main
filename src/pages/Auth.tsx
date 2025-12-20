import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';



const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await login(formData.email, formData.password);

      if (error) {
        throw error;
      }

      toast({
        title: 'Welcome back',
        description: 'You have been signed in successfully.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Sign in failed. Please try again.');
      toast({
        title: 'Authentication Error',
        description: error.message || 'Sign in failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex w-full">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A2F25] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2670&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F25] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A2F25]/40 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tight">Chaka Stays</Link>
          <div className="space-y-6 max-w-lg mb-20">
            <h1 className="text-5xl font-serif font-medium leading-tight">Return to your <br /><span className="italic text-secondary">sanctuary</span>.</h1>
            <p className="text-lg text-white/80 font-light leading-relaxed">
              Experience the finest nature retreats in Kenya. Login to manage your bookings and curate your next escape.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="w-full max-w-sm space-y-10 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Welcome Back</h2>
            <p className="text-muted-foreground font-light">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-12 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary/80 hover:text-primary hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-12 bg-white/50 border-input/60 focus:border-primary focus:ring-primary/10 transition-all font-light"
                />
              </div>
            </div>

            {error && <div className="p-4 text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg">{error}</div>}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] hover:shadow-primary/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>


          </form>

          <p className="text-center text-sm text-muted-foreground font-light">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline underline-offset-4 decoration-primary/50">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div >

  );
};

export default Auth;