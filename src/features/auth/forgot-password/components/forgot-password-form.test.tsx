import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const mocks = vi.hoisted(() => ({
  listUsers: vi.fn(),
  updateUserById: vi.fn(),
}))

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        listUsers: mocks.listUsers,
        updateUserById: mocks.updateUserById,
      },
    },
  },
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let newPasswordInput: Locator
  let confirmPasswordInput: Locator
  let resetButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    mocks.listUsers.mockResolvedValue({
      data: { users: [{ id: 'user-1', email: 'a@b.com' }] },
      error: null,
    })
    mocks.updateUserById.mockResolvedValue({ error: null })

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /^Email$/i })
    newPasswordInput = screen.getByLabelText(/^New Password$/i)
    confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/i)
    resetButton = screen.getByRole('button', { name: /^Reset Password$/i })
  })

  it('renders email, password fields and the reset button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(newPasswordInput).toBeInTheDocument()
    await expect.element(confirmPasswordInput).toBeInTheDocument()
    await expect.element(resetButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.click(resetButton)
    await expect
      .element(screen.getByText(/^Please enter your email\.$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Please enter a new password\.$/i))
      .toBeInTheDocument()
  })

  it('resets the password and clears the form on success', async () => {
    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.fill(newPasswordInput, 'newpass123')
    await userEvent.fill(confirmPasswordInput, 'newpass123')
    await userEvent.click(resetButton)

    await vi.waitFor(() =>
      expect(mocks.updateUserById).toHaveBeenCalledWith('user-1', {
        password: 'newpass123',
      })
    )

    await expect.element(emailInput).toHaveValue('')
  })
})
