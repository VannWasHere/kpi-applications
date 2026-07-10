import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle, Users } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import { useEmployees } from './data/hooks'
import { EmployeesDialogs } from './components/employees-dialogs'
import { EmployeesPrimaryButtons } from './components/employees-primary-buttons'
import { EmployeesProvider } from './components/employees-provider'
import { EmployeesTable } from './components/employees-table'

const route = getRouteApi('/_authenticated/employees/')

export function Employees() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isLoading, isError, error } = useEmployees()

  return (
    <EmployeesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Employee Management
            </h2>
            <p className='text-muted-foreground'>
              Manage employee records, roles, and account access.
            </p>
          </div>
          <EmployeesPrimaryButtons />
        </div>

        {isLoading && (
          <div className='space-y-2'>
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-72 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <AlertCircle className='size-8 text-destructive' />
            <p className='font-medium'>Failed to load employees</p>
            <p className='text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <Users className='size-8 text-muted-foreground' />
            <p className='font-medium'>No employees yet</p>
            <p className='text-sm text-muted-foreground'>
              Get started by adding your first employee.
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <EmployeesTable data={data} search={search} navigate={navigate} />
        )}
      </Main>

      <EmployeesDialogs />
    </EmployeesProvider>
  )
}
