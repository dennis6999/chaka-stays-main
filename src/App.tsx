import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import ListProperty from "./pages/ListProperty";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isEnvMissing, setIsEnvMissing] = React.useState(false);

  React.useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.error("CRITICAL: VITE_SUPABASE_URL is missing!");
      setIsEnvMissing(true);
    }
  }, []);

  if (isEnvMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-destructive/10 p-4">
        <div className="bg-destructive text-destructive-foreground p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="mb-4">The application cannot connect to the database.</p>
          <div className="bg-black/20 p-4 rounded text-sm font-mono overflow-auto">
            Error: Missing VITE_SUPABASE_URL environment variable.
          </div>
          <p className="mt-4 text-sm opacity-90">Please check your Netlify Site Settings &gt; Environment Variables.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/list-property" element={<ListProperty />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
