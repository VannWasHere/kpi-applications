import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle, Target } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import { useKpis } from './data/hooks'
import { KpisDialogs } from './components/kpis-dialogs'
import { KpisPrimaryButtons } from './components/kpis-primary-buttons'
import { KpisProvider } from './components/kpis-provider'
import { KpisTable } from './components/kpis-table'

const route = getRouteApi('/_authenticated/kpis/')

export function Kpis() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isLoading, isError, error } = useKpis()

  return (
    <KpisProvider>
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
              KPI Management
            </h2>
            <p className='text-muted-foreground'>
              Create, assign, and track Key Performance Indicators.
            </p>
          </div>
          <KpisPrimaryButtons />
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
            <p className='font-medium'>Failed to load KPIs</p>
            <p className='text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border py-16 text-center'>
            <Target className='size-8 text-muted-foreground' />
            <p className='font-medium'>No KPIs yet</p>
            <p className='text-sm text-muted-foreground'>
              Create your first KPI to start tracking performance.
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <KpisTable data={data} search={search} navigate={navigate} />
        )}
      </Main>

      <KpisDialogs />
    </KpisProvider>
  )
}
