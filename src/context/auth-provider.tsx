import { useEffect, useState } from 'react'
import { fetchProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

type AuthProviderProps = {
  children: React.ReactNode
}

/**
 * Bootstraps the Supabase auth session on load and keeps the auth
 * store in sync with `onAuthStateChange` events (sign in, sign out,
 * token refresh). Rendering of the app is held back with a minimal
 * splash screen until the initial session check resolves, so route
 * guards never race against an unresolved session.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [ready, setReady] = useState(false)
  const { setSession, setProfile, setLoading } = useAuthStore(
    (state) => state.auth
  )

  useEffect(() => {
    let isMounted = true

    async function syncProfile(userId: string | undefined) {
      if (!userId) {
        setProfile(null)
        return
      }
      const profile = await fetchProfile(userId)
      if (isMounted) setProfile(profile)
    }

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data.session)
      await syncProfile(data.session?.user.id)
      if (!isMounted) return
      setLoading(false)
      setReady(true)
    }

    void init()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        void syncProfile(session?.user.id)
      }
    )

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) {
    return (
      <div className='flex h-svh w-full items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary' />
      </div>
    )
  }

  return children
}
