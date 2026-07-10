import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteEmployee } from '../data/hooks'
import { type Employee } from '../data/schema'

type DataTableBulkActionsProps = {
  table: Table<Employee>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteEmployee = useDeleteEmployee()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedEmployees = selectedRows.map((r) => r.original)

  async function handleBulkDelete() {
    try {
      await Promise.all(
        selectedEmployees.map((employee) => deleteEmployee.mutateAsync(employee))
      )
      toast.success(
        `${selectedEmployees.length} employee${selectedEmployees.length > 1 ? 's' : ''} deleted.`
      )
      table.resetRowSelection()
      setConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete employees.')
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='employee'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              className='size-8'
              aria-label='Delete selected employees'
              title='Delete selected employees'
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 />
              <span className='sr-only'>Delete selected employees</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected employees</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        handleConfirm={handleBulkDelete}
        isLoading={deleteEmployee.isPending}
        title={
          <span className='text-destructive'>
            Delete {selectedEmployees.length} employee
            {selectedEmployees.length > 1 ? 's' : ''}
          </span>
        }
        desc={
          <p>
            Are you sure you want to delete the selected employees? This
            action cannot be undone.
          </p>
        }
        confirmText='Delete'
        destructive
      />
    </>
  )
}
