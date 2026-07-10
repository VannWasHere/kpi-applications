import { type EmployeePerformance } from '../data/api'

type EmployeePerformanceListProps = {
  data: EmployeePerformance[]
}

export function EmployeePerformanceList({ data }: EmployeePerformanceListProps) {
  if (data.length === 0) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        No evaluation data yet.
      </p>
    )
  }

  const max = Math.max(...data.map((d) => d.score), 1)

  return (
    <ul className='space-y-3'>
      {data.map((item) => (
        <li key={item.employeeName} className='flex items-center justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='mb-1 truncate text-xs text-muted-foreground'>
              {item.employeeName}
            </div>
            <div className='h-2.5 w-full rounded-full bg-muted'>
              <div
                className='h-2.5 rounded-full bg-primary'
                style={{ width: `${Math.round((item.score / max) * 100)}%` }}
              />
            </div>
          </div>
          <div className='ps-2 text-xs font-medium tabular-nums'>{item.score}</div>
        </li>
      ))}
    </ul>
  )
}
