import { useState } from 'react'
import { AlertCircle, History } from 'lucide-react'
import { useCurrentEmployee, useEmployees } from '@/features/employees/data/hooks'
import { useAuthStore } from '@/stores/auth-store'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  EvaluationsFilters,
  type EvaluationFiltersValue,
} from './components/evaluations-filters'
import { EvaluationsTable } from './components/evaluations-table'
import { useEvaluationHistory } from './data/hooks'

export function Evaluations() {
  const profile = useAuthStore((state) => state.auth.profile)
  const isAdmin = profile?.role === 'admin'
  const [filters, setFilters] = useState<EvaluationFiltersValue>({})

  const { data: employees } = useEmployees()
  const { data: currentEmployee } = useCurrentEmployee(
    isAdmin ? undefined : profile?.id
  )

  const effectiveFilters = isAdmin
    ? filters
    : { ...filters, employeeId: currentEmployee?.id }

  const { data, isLoading, isError, error } = useEvaluationHistory(
    isAdmin || currentEmployee ? effectiveFilters : { employeeId: '__none__' }
  )

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Evaluation History
          </h2>
          <p className='text-muted-foreground'>
            {isAdmin
              ? 'Review evaluation history for all employees.'
              : 'Review your own evaluation history.'}
          </p>
        </div>

        {isAdmin && (
          <EvaluationsFilters
            value={filters}
            onChange={setFilters}
            employees={employees ?? []}
          />
        )}

        {isLoading && (
          <div className='space-y-2'>
            <Skeleton className='h-72 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <AlertCircle className='size-8 text-destructive' />
            <p className='font-medium'>Failed to load evaluation history</p>
            <p className='text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && (data ?? []).length === 0 && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <History className='size-8 text-muted-foreground' />
            <p className='font-medium'>No evaluation history yet</p>
            <p className='text-sm text-muted-foreground'>
              Records appear here once KPI progress has been evaluated.
            </p>
          </div>
        )}

        {!isLoading && !isError && (data ?? []).length > 0 && (
          <EvaluationsTable data={data!} showEmployeeColumn={isAdmin} />
        )}
      </Main>
    </>
  )
}
