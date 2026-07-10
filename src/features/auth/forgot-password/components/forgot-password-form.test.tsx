import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const mocks = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/auth', () => ({
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let continueButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /^Email$/i })
    continueButton = screen.getByRole('button', { name: /^Continue$/i })
  })

  it('renders email field and continue button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(continueButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.click(continueButton)
    await expect
      .element(screen.getByText(/^Please enter your email\.$/i))
      .toBeInTheDocument()
  })

  it('sends the reset email and resets the form on success', async () => {
    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.click(continueButton)

    await vi.waitFor(() =>
      expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.com')
    )

    // Form should reset on success
    await expect.element(emailInput).toHaveValue('')
  })
})
