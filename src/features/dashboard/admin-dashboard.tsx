import { format } from 'date-fns'
import { CheckCircle2, ClipboardList, TrendingUp, Users } from 'lucide-react'
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
import { DepartmentPerformanceChart } from './components/department-performance-chart'
import { EmployeePerformanceList } from './components/employee-performance-list'
import { StatCard } from './components/stat-card'
import {
  useAdminDashboardStats,
  useDepartmentPerformance,
  useRecentActivity,
  useRecentEvaluations,
  useTopEmployeePerformance,
} from './data/hooks'

export function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useAdminDashboardStats()
  const { data: departmentPerformance, isLoading: isLoadingDept } =
    useDepartmentPerformance()
  const { data: employeePerformance, isLoading: isLoadingEmp } =
    useTopEmployeePerformance()
  const { data: recentActivity, isLoading: isLoadingActivity } =
    useRecentActivity()
  const { data: recentEvaluations, isLoading: isLoadingEvaluations } =
    useRecentEvaluations()

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
          <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Total Employees'
            value={stats?.totalEmployees ?? 0}
            icon={Users}
            isLoading={isLoadingStats}
          />
          <StatCard
            title='Active KPI'
            value={stats?.activeKpis ?? 0}
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
            title='Average Score'
            value={stats?.averageScore ?? 0}
            icon={TrendingUp}
            isLoading={isLoadingStats}
          />
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Average KPI score by department</CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              {isLoadingDept ? (
                <Skeleton className='h-64 w-full' />
              ) : (
                <DepartmentPerformanceChart data={departmentPerformance ?? []} />
              )}
            </CardContent>
          </Card>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
              <CardDescription>Top scoring employees</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEmp ? (
                <Skeleton className='h-64 w-full' />
              ) : (
                <EmployeePerformanceList data={employeePerformance ?? []} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <Skeleton className='h-48 w-full' />
              ) : (recentActivity ?? []).length === 0 ? (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No recent activity.
                </p>
              ) : (
                <ul className='space-y-3'>
                  {recentActivity!.map((activity) => (
                    <li key={activity.id} className='text-sm'>
                      <p>{activity.description}</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(activity.createdAt), 'MMM d, yyyy p')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent KPI Updates</CardTitle>
              <CardDescription>Latest evaluation results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvaluations ? (
                <Skeleton className='h-48 w-full' />
              ) : (recentEvaluations ?? []).length === 0 ? (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No recent evaluations.
                </p>
              ) : (
                <ul className='space-y-3'>
                  {recentEvaluations!.map((evaluation) => (
                    <li key={evaluation.id} className='flex items-center justify-between text-sm'>
                      <div>
                        <p className='font-medium'>{evaluation.employeeName}</p>
                        <p className='text-xs text-muted-foreground'>
                          {evaluation.period} · {evaluation.rating}
                        </p>
                      </div>
                      <span className='font-medium tabular-nums'>
                        {evaluation.kpiScore}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
