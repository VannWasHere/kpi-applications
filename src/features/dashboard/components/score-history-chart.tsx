import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { type EvaluationHistoryPoint } from '../data/api'

type ScoreHistoryChartProps = {
  data: EvaluationHistoryPoint[]
}

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className='flex h-56 items-center justify-center text-sm text-muted-foreground'>
        No evaluation history yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={280}>
      <LineChart data={data}>
        <XAxis
          dataKey='period'
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
        <Line
          type='monotone'
          dataKey='kpiScore'
          stroke='currentColor'
          className='text-primary'
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
