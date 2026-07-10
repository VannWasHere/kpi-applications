import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteKpi } from '../data/hooks'
import { type Kpi } from '../data/schema'

type KpisDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Kpi
}

export function KpisDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: KpisDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteKpi = useDeleteKpi()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.title) return
    try {
      await deleteKpi.mutateAsync(currentRow)
      toast.success('KPI deleted.')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete KPI.')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='kpis-delete-form'
      disabled={value.trim() !== currentRow.title}
      isLoading={deleteKpi.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete KPI
        </span>
      }
      desc={
        <form
          id='kpis-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            void handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.title}</span>? This will
            remove it from all {currentRow.assignedCount} assigned
            employee(s). This cannot be undone.
          </p>

          <Label className='my-2'>
            KPI Title:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter KPI title to confirm deletion.'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  )
}
