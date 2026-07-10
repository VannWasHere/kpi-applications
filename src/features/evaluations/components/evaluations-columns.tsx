import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { ratingStyles } from '../data/data'
import { type EvaluationHistoryEntry } from '../data/schema'

export function buildEvaluationsColumns(
  showEmployeeColumn: boolean
): ColumnDef<EvaluationHistoryEntry>[] {
  const columns: ColumnDef<EvaluationHistoryEntry>[] = []

  if (showEmployeeColumn) {
    columns.push({
      accessorKey: 'employeeName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Employee' />
      ),
      cell: ({ row }) => (
        <div className='ps-3'>
          <p className='font-medium'>{row.getValue('employeeName')}</p>
          <p className='text-xs text-muted-foreground'>
            {row.original.employeeCode}
          </p>
        </div>
      ),
      meta: { className: 'ps-0.5' },
      enableHiding: false,
    })
  }

  columns.push(
    {
      accessorKey: 'period',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Period' />
      ),
      cell: ({ row }) => <div>{row.getValue('period')}</div>,
    },
    {
      accessorKey: 'kpiScore',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='KPI Score' />
      ),
      cell: ({ row }) => <div>{row.getValue('kpiScore')}</div>,
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Rating' />
      ),
      cell: ({ row }) => {
        const rating = row.original.rating
        return (
          <Badge variant='outline' className={cn(ratingStyles.get(rating))}>
            {rating}
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='capitalize'>
          {row.getValue('status')}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'comments',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Comments' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-52'>
          {row.getValue('comments') || '—'}
        </LongText>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'recordedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date' />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string>('recordedAt')
        return <div>{format(new Date(value), 'MMM d, yyyy')}</div>
      },
    }
  )

  return columns
}
