import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteKpi } from '../data/hooks'
import { type Kpi } from '../data/schema'

type DataTableBulkActionsProps = {
  table: Table<Kpi>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteKpi = useDeleteKpi()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedKpis = selectedRows.map((r) => r.original)

  async function handleBulkDelete() {
    try {
      await Promise.all(selectedKpis.map((kpi) => deleteKpi.mutateAsync(kpi)))
      toast.success(
        `${selectedKpis.length} KPI${selectedKpis.length > 1 ? 's' : ''} deleted.`
      )
      table.resetRowSelection()
      setConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete KPIs.')
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='KPI'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              className='size-8'
              aria-label='Delete selected KPIs'
              title='Delete selected KPIs'
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 />
              <span className='sr-only'>Delete selected KPIs</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected KPIs</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        handleConfirm={handleBulkDelete}
        isLoading={deleteKpi.isPending}
        title={
          <span className='text-destructive'>
            Delete {selectedKpis.length} KPI{selectedKpis.length > 1 ? 's' : ''}
          </span>
        }
        desc={
          <p>
            Are you sure you want to delete the selected KPIs? This action
            cannot be undone.
          </p>
        }
        confirmText='Delete'
        destructive
      />
    </>
  )
}
