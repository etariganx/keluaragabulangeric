// ============================================
// AUTHENTICATION CONTEXT
// ============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  User, 
  PermissionCheck, 
  AuthContextType,
  RegisterRequest 
} from '@/types';
import { UserRole } from '@/types';
import { authService } from '@/services/supabase';
import { supabase } from '@/services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn({ email, password });
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register new account
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.signUp(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  // Check permissions based on role
  const checkPermission = useCallback((memberId?: string): PermissionCheck => {
    if (!user) {
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
      };
    }

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const isAdmin = user.role === UserRole.ADMIN;
    const isParent = user.role === UserRole.PARENT;
    const isOwner = memberId ? user.family_member_id === memberId : false;

    return {
      canView: true,
      canCreate: isSuperAdmin || isAdmin || isParent,
      canEdit: isSuperAdmin || isAdmin || isParent || isOwner,
      canDelete: isSuperAdmin || isAdmin,
      canManageUsers: isSuperAdmin || isAdmin,
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loginWithGoogle,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(redirectUrl: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = redirectUrl;
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  return { isReady, isLoading };
}

// Hook for role-based access
export function useRequireRole(allowedRoles: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      } else if (user && !allowedRoles.includes(user.role)) {
        window.location.href = '/unauthorized';
      } else {
        setHasAccess(true);
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles]);

  return { hasAccess, isLoading };
}
