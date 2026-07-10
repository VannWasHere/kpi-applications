import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEmployees } from '@/features/employees/data/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SelectDropdown } from '@/components/select-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { parseSupabaseError } from '@/lib/supabase-error'
import { type Kpi } from '../data/schema'
import { useAssignKpi, useKpiAssignments, useUnassignKpi } from '../data/hooks'

type KpisAssignDialogProps = {
  currentRow: Kpi
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KpisAssignDialog({
  currentRow,
  open,
  onOpenChange,
}: KpisAssignDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>()
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees()
  const { data: assignments, isLoading: isLoadingAssignments } =
    useKpiAssignments(currentRow.id)
  const assignKpi = useAssignKpi()
  const unassignKpi = useUnassignKpi(currentRow.id)

  const assignedIds = new Set((assignments ?? []).map((a) => a.employeeId))
  const availableEmployees = (employees ?? []).filter(
    (e) => !assignedIds.has(e.id)
  )

  async function handleAssign() {
    if (!selectedEmployeeId) return
    try {
      await assignKpi.mutateAsync({
        kpiId: currentRow.id,
        employeeIds: [selectedEmployeeId],
      })
      setSelectedEmployeeId(undefined)
      toast.success('Employee assigned to KPI.')
    } catch (err) {
      toast.error(parseSupabaseError(err).message)
    }
  }

  async function handleUnassign(assignmentId: string) {
    try {
      await unassignKpi.mutateAsync(assignmentId)
      toast.success('Assignment removed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove assignment.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Assign KPI</DialogTitle>
          <DialogDescription>
            Choose employees to assign <strong>{currentRow.title}</strong> to.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-end gap-2'>
          <div className='flex-1'>
            <SelectDropdown
              defaultValue={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              isControlled
              isPending={isLoadingEmployees}
              placeholder='Select an employee'
              items={availableEmployees.map((e) => ({
                label: `${e.fullName} (${e.employeeCode})`,
                value: e.id,
              }))}
            />
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedEmployeeId || assignKpi.isPending}
          >
            {assignKpi.isPending && <Loader2 className='animate-spin' />}
            Assign
          </Button>
        </div>

        <Separator />

        <div className='max-h-64 space-y-2 overflow-y-auto'>
          <p className='text-sm font-medium text-muted-foreground'>
            Currently assigned
          </p>
          {isLoadingAssignments && (
            <div className='space-y-2'>
              <Skeleton className='h-9 w-full' />
              <Skeleton className='h-9 w-full' />
            </div>
          )}
          {!isLoadingAssignments && (assignments ?? []).length === 0 && (
            <p className='py-4 text-center text-sm text-muted-foreground'>
              No employees assigned yet.
            </p>
          )}
          {(assignments ?? []).map((assignment) => (
            <div
              key={assignment.id}
              className='flex items-center justify-between rounded-md border px-3 py-2'
            >
              <div>
                <p className='text-sm font-medium'>{assignment.employeeName}</p>
                <p className='text-xs text-muted-foreground'>
                  {assignment.employeeCode}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='capitalize'>
                  {assignment.progressPercent}%
                </Badge>
                <Button
                  size='icon'
                  variant='ghost'
                  className='size-7'
                  onClick={() => handleUnassign(assignment.id)}
                  disabled={unassignKpi.isPending}
                  aria-label={`Remove ${assignment.employeeName}`}
                >
                  <X className='size-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
