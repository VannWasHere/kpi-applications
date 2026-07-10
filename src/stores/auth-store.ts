import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { AppRole } from '@/types/database'

export interface AuthProfile {
  id: string
  email: string
  fullName: string
  role: AppRole
  avatarUrl: string | null
}

interface AuthState {
  auth: {
    user: User | null
    session: Session | null
    profile: AuthProfile | null
    /** True until the initial session check on app load has finished. */
    isLoading: boolean
    setSession: (session: Session | null) => void
    setProfile: (profile: AuthProfile | null) => void
    setLoading: (isLoading: boolean) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    setSession: (session) =>
      set((state) => ({
        auth: { ...state.auth, session, user: session?.user ?? null },
      })),
    setProfile: (profile) =>
      set((state) => ({ auth: { ...state.auth, profile } })),
    setLoading: (isLoading) =>
      set((state) => ({ auth: { ...state.auth, isLoading } })),
    reset: () =>
      set((state) => ({
        auth: {
          ...state.auth,
          user: null,
          session: null,
          profile: null,
        },
      })),
  },
}))

/** Convenience helper for reading auth state outside of React components. */
export function getCurrentUserRole(): AppRole | null {
  return useAuthStore.getState().auth.profile?.role ?? null
}
