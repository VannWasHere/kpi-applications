import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteEmployee } from '../data/hooks'
import { type Employee } from '../data/schema'

type EmployeesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Employee
}

export function EmployeesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: EmployeesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteEmployee = useDeleteEmployee()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.employeeCode) return

    try {
      await deleteEmployee.mutateAsync(currentRow)
      toast.success('Employee deleted.')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete employee.')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='employees-delete-form'
      disabled={value.trim() !== currentRow.employeeCode}
      isLoading={deleteEmployee.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Employee
        </span>
      }
      desc={
        <form
          id='employees-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            void handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.fullName}</span> (
            <span className='font-bold'>{currentRow.employeeCode}</span>)?
            This will permanently remove the employee and their KPI records.
            This cannot be undone.
          </p>

          <Label className='my-2'>
            Employee ID:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter employee ID to confirm deletion.'
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
