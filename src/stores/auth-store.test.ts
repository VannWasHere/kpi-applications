import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleProfile = {
  id: 'user-1',
  email: 'user@example.com',
  fullName: 'Test User',
  role: 'karyawan' as const,
  avatarUrl: null,
}

const sampleSession = {
  access_token: 'token-abc',
  refresh_token: 'refresh-abc',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'user-1', email: 'user@example.com' },
} as unknown as import('@supabase/supabase-js').Session

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('starts with no session, user, or profile, and isLoading true', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.profile).toBeNull()
    expect(useAuthStore.getState().auth.isLoading).toBe(true)
  })

  it('setSession updates both session and derived user', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setSession(sampleSession)

    expect(useAuthStore.getState().auth.session).toEqual(sampleSession)
    expect(useAuthStore.getState().auth.user).toEqual(sampleSession.user)
  })

  it('setSession(null) clears both session and user', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setSession(sampleSession)

    useAuthStore.getState().auth.setSession(null)

    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('updates the profile via setProfile', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setProfile(sampleProfile)

    expect(useAuthStore.getState().auth.profile).toEqual(sampleProfile)
  })

  it('setLoading toggles isLoading', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setLoading(false)
    expect(useAuthStore.getState().auth.isLoading).toBe(false)

    useAuthStore.getState().auth.setLoading(true)
    expect(useAuthStore.getState().auth.isLoading).toBe(true)
  })

  it('reset clears session, user, and profile', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setSession(sampleSession)
    useAuthStore.getState().auth.setProfile(sampleProfile)

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.profile).toBeNull()
  })
})
