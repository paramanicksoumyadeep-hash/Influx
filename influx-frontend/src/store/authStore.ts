import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'INFLUENCER' | 'BRAND';
  profile: any;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'influx-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
