import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { type DepartmentPerformance } from '../data/api'

type DepartmentPerformanceChartProps = {
  data: DepartmentPerformance[]
}

export function DepartmentPerformanceChart({ data }: DepartmentPerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
        No evaluation data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart data={data}>
        <XAxis
          dataKey='departmentName'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
        />
        <Bar dataKey='averageScore' fill='currentColor' radius={[4, 4, 0, 0]} className='fill-primary' />
      </BarChart>
    </ResponsiveContainer>
  )
}
