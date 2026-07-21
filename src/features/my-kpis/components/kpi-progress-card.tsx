import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { type MyKpiAssignment } from '@/features/kpis/data/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusStyles: Record<MyKpiAssignment['status'], string> = {
  not_started: 'bg-neutral-300/40 border-neutral-300',
  in_progress: 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  completed:
    'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
}

const statusLabels: Record<MyKpiAssignment['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
}

type KpiProgressCardProps = {
  assignment: MyKpiAssignment
  onUpdateClick: (assignment: MyKpiAssignment) => void
}

export function KpiProgressCard({ assignment, onUpdateClick }: KpiProgressCardProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-2 space-y-0'>
        <div>
          <CardTitle className='text-base'>{assignment.kpiTitle}</CardTitle>
          <p className='text-xs text-muted-foreground'>
            {assignment.kpiCategory} · Weight {formatNumber(assignment.kpiWeight)}%
          </p>
        </div>
        <Badge
          variant='outline'
          className={cn('shrink-0 capitalize', statusStyles[assignment.status])}
        >
          {statusLabels[assignment.status]}
        </Badge>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div>
          <div className='mb-1 flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {formatNumber(assignment.currentValue)} / {formatNumber(assignment.kpiTarget)}
            </span>
            <span>{assignment.progressPercent}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary transition-all'
              style={{ width: `${Math.min(assignment.progressPercent, 100)}%` }}
            />
          </div>
        </div>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>
            Due{' '}
            {assignment.kpiDueDate
              ? format(new Date(assignment.kpiDueDate), 'MMM d, yyyy')
              : '—'}
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onUpdateClick(assignment)}
          >
            <Pencil className='size-3.5' /> Update
          </Button>
        </div>
        {assignment.notes && (
          <p className='rounded-md bg-muted/50 p-2 text-xs text-muted-foreground'>
            {assignment.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
