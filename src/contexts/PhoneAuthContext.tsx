
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  phone_number: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

interface PhoneAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (phoneNumber: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
}

const PhoneAuthContext = createContext<PhoneAuthContextType | undefined>(undefined);

interface PhoneAuthProviderProps {
  children: ReactNode;
}

export const PhoneAuthProvider: React.FC<PhoneAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('phoneAuthUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('phoneAuthUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('phoneAuthUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('phoneAuthUser');
    }
  }, [user]);

  const login = async (phoneNumber: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length < 10) {
        return { success: false, error: 'Please enter a valid phone number' };
      }

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', cleanPhone)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Database error:', fetchError);
        return { success: false, error: 'Database error occurred' };
      }

      if (existingUser) {
        // User exists, log them in
        setUser(existingUser);
        return { success: true };
      } else {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            phone_number: cleanPhone,
            display_name: displayName || `User ${cleanPhone.slice(-4)}`
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return { success: false, error: 'Failed to create user account' };
        }

        setUser(newUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateDisplayName = async (displayName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data: updatedUser, error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating display name:', error);
        return { success: false, error: 'Failed to update display name' };
      }

      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const contextValue: PhoneAuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateDisplayName
  };

  return (
    <PhoneAuthContext.Provider value={contextValue}>
      {children}
    </PhoneAuthContext.Provider>
  );
};

export const usePhoneAuth = (): PhoneAuthContextType => {
  const context = useContext(PhoneAuthContext);
  if (context === undefined) {
    throw new Error('usePhoneAuth must be used within a PhoneAuthProvider');
  }
  return context;
};
