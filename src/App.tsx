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
