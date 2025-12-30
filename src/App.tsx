import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import MobileNav from './components/MobileNav';

// ... existing imports

              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes >
            <MobileNav />
            <Analytics />
          </Router >
        </AuthProvider >
      </TooltipProvider >
    </QueryClientProvider >
  );
};

export default App;
