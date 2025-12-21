import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Extend the Supabase User type or define a wrapper if needed
// For now, we'll use a custom interface that maps Supabase user to our app's needs
interface AppUser {
  id: string; // Supabase uses UUID strings
  email?: string;
  name?: string;
  avatar_url?: string;
  user_type?: 'guest' | 'host';
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (data: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Only set loading to true if we don't already have the user data for this ID
        // This prevents flickering on token refreshes
        if (user?.id !== session.user.id) {
          setLoading(true);
          fetchProfile(session.user);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to metadata if profile doesn't exist yet
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
          user_type: authUser.user_metadata?.role || 'guest',
        });
      } else {
        setUser({
          id: data.id,
          email: authUser.email,
          name: data.full_name,
          avatar_url: data.avatar_url,
          user_type: data.role || 'guest',
          phone: data.phone,
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (data: any) => {
    const { email, password, full_name, user_type, phone } = data;

    // 1. Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth',
        data: {
          full_name,
          role: user_type, // Persist role in metadata as fallback
          phone,
        },
      },
    });

    if (signUpError) return { error: signUpError };

    // 2. Create/Update profile entry (Fallback if Trigger misses metadata)
    if (authData.user) {
      const updates: any = {};
      if (phone) updates.phone = phone;
      if (user_type) updates.role = user_type;

      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile metadata:', profileError);
        }
      }
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!session,
    loginWithGoogle,
    refreshUser: async () => {
      if (session?.user) {
        await fetchProfile(session.user);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 