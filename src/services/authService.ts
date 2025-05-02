import axios from 'axios';

// Update the API URL to match your XAMPP setup
const API_URL = 'http://localhost/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Types
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

// Auth service
const authService = {
  // Register a new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/register.php`, data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/login.php`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    try {
      const response = await axios.get(`${API_URL}/profile.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error: any) {
      console.error('Profile error:', error);
      throw error;
    }
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