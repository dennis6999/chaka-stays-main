// Configure axios defaults - not needed for mock but keeping for compatibility
import axios from 'axios';

// Mock Auth Service
export interface User {
  id: number;
  user_type: 'guest' | 'owner';
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  user_type: 'guest' | 'owner';
  email: string;
  password: string;
  phone: string;
  full_name?: string;
  business_name?: string;
  owner_name?: string;
  business_email?: string;
  business_phone?: string;
}

// Mock delays to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const authService = {
  // Register a new user
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    // Create mock user
    const mockUser: User = {
      id: Math.floor(Math.random() * 1000),
      user_type: data.user_type,
      email: data.email,
      name: data.full_name || data.owner_name || 'New User'
    };

    const token = 'mock-jwt-token-' + Date.now();

    // Store session
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mockUser));

    return {
      message: 'Registration successful',
      token,
      user: mockUser
    };
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(800);

    // Accept any login for demo purposes
    const mockUser: User = {
      id: 1,
      user_type: 'guest',
      email: email,
      name: 'Demo User'
    };

    const token = 'mock-jwt-token-' + Date.now();

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mockUser));

    return {
      message: 'Login successful',
      token,
      user: mockUser
    };
  },

  // Get user profile
  async getProfile(): Promise<User> {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No session found');
    return JSON.parse(userStr);
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService; 