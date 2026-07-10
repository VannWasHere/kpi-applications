import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
} as const

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSession: vi.fn(),
  setProfile: vi.fn(),
  signInWithPassword: vi.fn(),
  fetchProfile: vi.fn(),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    setSession: mocks.setSession,
    setProfile: mocks.setProfile,
  }),
}))

vi.mock('@/lib/auth', () => ({
  signInWithPassword: mocks.signInWithPassword,
  fetchProfile: mocks.fetchProfile,
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let emailInput: Locator
    let passwordInput: Locator
    let signInButton: Locator
    let forgotPasswordLink: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      mocks.signInWithPassword.mockResolvedValue({
        session: { user: { id: 'user-1' } },
      })
      mocks.fetchProfile.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        fullName: 'Test User',
        role: 'karyawan',
        avatarUrl: null,
      })

      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', { name: /^Email$/i })
      passwordInput = screen.getByLabelText(/^Password$/i)
      signInButton = screen.getByRole('button', { name: /^Sign in$/i })
      forgotPasswordLink = screen.getByText(/^Forgot password\?$/i)
    })

    it('renders fields, submit button, and forgot password link', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
      await expect.element(forgotPasswordLink).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.emailEmpty))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
        .toBeInTheDocument()
    })

    it('authenticates and navigates to default route on success', async () => {
      await userEvent.fill(emailInput, 'a@b.com')
      await userEvent.fill(passwordInput, '1234567')

      await userEvent.click(signInButton)

      await vi.waitFor(() =>
        expect(mocks.signInWithPassword).toHaveBeenCalledWith(
          'a@b.com',
          '1234567',
          true
        )
      )
      expect(mocks.setSession).toHaveBeenCalledOnce()
      expect(mocks.setProfile).toHaveBeenCalledOnce()

      await vi.waitFor(() =>
        expect(mocks.navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      )
    })

    it('shows an error message when authentication fails', async () => {
      mocks.signInWithPassword.mockRejectedValue(new Error('Invalid login'))

      await userEvent.fill(emailInput, 'a@b.com')
      await userEvent.fill(passwordInput, '1234567')
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(/Invalid login/i))
        .toBeInTheDocument()
      expect(mocks.navigate).not.toHaveBeenCalled()
    })
  })

  it('navigates to redirectTo when provided', async () => {
    vi.clearAllMocks()
    mocks.signInWithPassword.mockResolvedValue({
      session: { user: { id: 'user-1' } },
    })
    mocks.fetchProfile.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.com',
      fullName: 'Test User',
      role: 'karyawan',
      avatarUrl: null,
    })

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo='/settings' />
    )

    await userEvent.fill(getByRole('textbox', { name: /Email/i }), 'a@b.com')
    await userEvent.fill(getByLabelText('Password'), '1234567')

    await userEvent.click(getByRole('button', { name: /Sign in/i }))

    await vi.waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })
})
