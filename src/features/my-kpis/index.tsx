import { useState } from 'react'
import { AlertCircle, ClipboardList } from 'lucide-react'
import { useCurrentEmployee } from '@/features/employees/data/hooks'
import { useMyAssignments } from '@/features/kpis/data/hooks'
import { type MyKpiAssignment } from '@/features/kpis/data/schema'
import { useAuthStore } from '@/stores/auth-store'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import { KpiProgressCard } from './components/kpi-progress-card'
import { UpdateProgressDialog } from './components/update-progress-dialog'

export function MyKpis() {
  const profile = useAuthStore((state) => state.auth.profile)
  const { data: employee, isLoading: isLoadingEmployee } = useCurrentEmployee(
    profile?.id
  )
  const {
    data: assignments,
    isLoading: isLoadingAssignments,
    isError,
    error,
  } = useMyAssignments(employee?.id)
  const [activeAssignment, setActiveAssignment] =
    useState<MyKpiAssignment | null>(null)

  const isLoading = isLoadingEmployee || isLoadingAssignments

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
          <h2 className='text-2xl font-bold tracking-tight'>My KPIs</h2>
          <p className='text-muted-foreground'>
            Track and update your assigned Key Performance Indicators.
          </p>
        </div>

        {isLoading && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <Skeleton className='h-40 w-full' />
            <Skeleton className='h-40 w-full' />
            <Skeleton className='h-40 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <AlertCircle className='size-8 text-destructive' />
            <p className='font-medium'>Failed to load your KPIs</p>
            <p className='text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && !employee && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <ClipboardList className='size-8 text-muted-foreground' />
            <p className='font-medium'>No employee record linked</p>
            <p className='text-sm text-muted-foreground'>
              Contact your administrator to link your account to an employee
              record.
            </p>
          </div>
        )}

        {!isLoading && !isError && employee && (assignments ?? []).length === 0 && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <ClipboardList className='size-8 text-muted-foreground' />
            <p className='font-medium'>No KPIs assigned yet</p>
            <p className='text-sm text-muted-foreground'>
              Your assigned KPIs will show up here once your admin assigns
              them.
            </p>
          </div>
        )}

        {!isLoading && !isError && employee && (assignments ?? []).length > 0 && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {assignments!.map((assignment) => (
              <KpiProgressCard
                key={assignment.id}
                assignment={assignment}
                onUpdateClick={setActiveAssignment}
              />
            ))}
          </div>
        )}
      </Main>

      {employee && (
        <UpdateProgressDialog
          employeeId={employee.id}
          assignment={activeAssignment}
          open={!!activeAssignment}
          onOpenChange={(open) => {
            if (!open) setActiveAssignment(null)
          }}
        />
      )}
    </>
  )
}
