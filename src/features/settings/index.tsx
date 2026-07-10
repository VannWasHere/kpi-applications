import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { changeOwnPassword, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PasswordInput } from '@/components/password-input'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required.'),
  email: z.email({ error: (iss) => (iss.input === '' ? 'Email is required.' : undefined) }),
})

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Please enter a new password.')
      .min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function Settings() {
  const profile = useAuthStore((state) => state.auth.profile)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName ?? '',
      email: profile?.email ?? '',
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setIsSavingProfile(true)
    try {
      const emailChanged = values.email !== profile?.email

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: values.fullName, email: values.email })
        .eq('id', profile!.id)
      if (profileError) throw profileError

      // Update auth email if changed
      if (emailChanged) {
        const { error: authError } = await supabase.auth.updateUser({
          email: values.email,
        })
        if (authError) throw authError
      }

      if (emailChanged) {
        toast.warning('Email changed. You will be signed out. Please sign in again with your new email.')
        setTimeout(async () => {
          await signOut()
          window.location.href = '/sign-in'
        }, 2000)
      } else {
        toast.success('Profile updated successfully.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setIsSavingPassword(true)
    try {
      await changeOwnPassword(values.newPassword)
      passwordForm.reset()
      toast.warning('Password changed. You will be signed out. Please sign in again with your new password.')
      setTimeout(async () => {
        await signOut()
        window.location.href = '/sign-in'
      }, 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
          <p className='text-muted-foreground'>
            Manage your personal information and password.
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className='grid gap-4 sm:max-w-md'
              >
                <FormField
                  control={profileForm.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Your name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='name@company.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert>
                  <AlertDescription>
                    Changing your email will sign you out. You'll need to sign in again with the new email.
                  </AlertDescription>
                </Alert>
                <Button type='submit' className='w-fit' disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className='animate-spin' />}
                  Save changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Set a new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className='grid gap-4 sm:max-w-md'
              >
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='••••••••' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='••••••••' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert>
                  <AlertDescription>
                    Changing your password will sign you out. You'll need to sign in again with the new password.
                  </AlertDescription>
                </Alert>
                <Button type='submit' className='w-fit' disabled={isSavingPassword}>
                  {isSavingPassword && <Loader2 className='animate-spin' />}
                  Change password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
