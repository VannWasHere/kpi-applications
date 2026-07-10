import { format } from 'date-fns'
import { CheckCircle2, ClipboardList, Star, TrendingUp } from 'lucide-react'
import { useCurrentEmployee } from '@/features/employees/data/hooks'
import { useAuthStore } from '@/stores/auth-store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScoreHistoryChart } from './components/score-history-chart'
import { StatCard } from './components/stat-card'
import {
  useEmployeeDashboardStats,
  useEmployeeScoreHistory,
  useUpcomingKpis,
} from './data/hooks'

export function EmployeeDashboard() {
  const profile = useAuthStore((state) => state.auth.profile)
  const { data: employee, isLoading: isLoadingEmployee } = useCurrentEmployee(
    profile?.id
  )
  const { data: stats, isLoading: isLoadingStats } = useEmployeeDashboardStats(
    employee?.id
  )
  const { data: history, isLoading: isLoadingHistory } = useEmployeeScoreHistory(
    employee?.id
  )
  const { data: upcoming, isLoading: isLoadingUpcoming } = useUpcomingKpis(
    employee?.id
  )

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Welcome back{profile?.fullName ? `, ${profile.fullName}` : ''}
          </h1>
        </div>

        {!isLoadingEmployee && !employee && (
          <Card>
            <CardContent className='py-10 text-center text-sm text-muted-foreground'>
              Your account isn't linked to an employee record yet. Contact
              your administrator.
            </CardContent>
          </Card>
        )}

        {(isLoadingEmployee || employee) && (
          <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                title='Assigned KPI'
                value={stats?.assignedKpis ?? 0}
                icon={ClipboardList}
                isLoading={isLoadingStats}
              />
              <StatCard
                title='Completed KPI'
                value={stats?.completedKpis ?? 0}
                icon={CheckCircle2}
                isLoading={isLoadingStats}
              />
              <StatCard
                title='Current Score'
                value={stats?.currentScore ?? 0}
                icon={TrendingUp}
                isLoading={isLoadingStats}
              />
              <StatCard
                title='Performance Rating'
                value={stats?.rating ?? '—'}
                icon={Star}
                isLoading={isLoadingStats}
              />
            </div>

            <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Progress History</CardTitle>
                  <CardDescription>Your KPI score over time</CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  {isLoadingHistory ? (
                    <Skeleton className='h-64 w-full' />
                  ) : (
                    <ScoreHistoryChart data={history ?? []} />
                  )}
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Upcoming KPI</CardTitle>
                  <CardDescription>Due soon</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUpcoming ? (
                    <Skeleton className='h-64 w-full' />
                  ) : (upcoming ?? []).length === 0 ? (
                    <p className='py-8 text-center text-sm text-muted-foreground'>
                      No upcoming KPIs.
                    </p>
                  ) : (
                    <ul className='space-y-3'>
                      {upcoming!.map((kpi) => (
                        <li key={kpi.id} className='flex items-center justify-between text-sm'>
                          <div>
                            <p className='font-medium'>{kpi.title}</p>
                            <p className='text-xs text-muted-foreground'>
                              Due {format(new Date(kpi.dueDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className='text-xs font-medium tabular-nums'>
                            {kpi.progressPercent}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
