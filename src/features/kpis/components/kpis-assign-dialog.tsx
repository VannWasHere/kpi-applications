import { useState } from 'react'
import { Loader2, Users, Building2, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDepartments, useEmployees } from '@/features/employees/data/hooks'
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

type AssignMode = 'individual' | 'department' | 'all'

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
  const [mode, setMode] = useState<AssignMode>('individual')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>()
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>()

  const { data: employees, isLoading: isLoadingEmployees } = useEmployees()
  const { data: departments, isLoading: isLoadingDepartments } = useDepartments()
  const { data: assignments, isLoading: isLoadingAssignments } =
    useKpiAssignments(currentRow.id)
  const assignKpi = useAssignKpi()
  const unassignKpi = useUnassignKpi(currentRow.id)

  const assignedIds = new Set((assignments ?? []).map((a) => a.employeeId))
  const availableEmployees = (employees ?? []).filter(
    (e) => !assignedIds.has(e.id) && e.status === 'active'
  )

  async function handleAssignIndividual() {
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

  async function handleAssignDepartment() {
    if (!selectedDepartmentId) return
    const deptEmployees = (employees ?? []).filter(
      (e) =>
        e.departmentId === selectedDepartmentId &&
        e.status === 'active' &&
        !assignedIds.has(e.id)
    )
    if (deptEmployees.length === 0) {
      toast.info('All active employees in this department are already assigned.')
      return
    }
    try {
      await assignKpi.mutateAsync({
        kpiId: currentRow.id,
        employeeIds: deptEmployees.map((e) => e.id),
      })
      setSelectedDepartmentId(undefined)
      toast.success(
        `${deptEmployees.length} employee${deptEmployees.length > 1 ? 's' : ''} assigned from department.`
      )
    } catch (err) {
      toast.error(parseSupabaseError(err).message)
    }
  }

  async function handleAssignAll() {
    const unassigned = (employees ?? []).filter(
      (e) => e.status === 'active' && !assignedIds.has(e.id)
    )
    if (unassigned.length === 0) {
      toast.info('All active employees are already assigned to this KPI.')
      return
    }
    try {
      await assignKpi.mutateAsync({
        kpiId: currentRow.id,
        employeeIds: unassigned.map((e) => e.id),
      })
      toast.success(
        `${unassigned.length} employee${unassigned.length > 1 ? 's' : ''} assigned.`
      )
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
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Assign KPI</DialogTitle>
          <DialogDescription>
            Assign <strong>{currentRow.title}</strong> to individual employees,
            a department, or all employees.
          </DialogDescription>
        </DialogHeader>

        {/* Mode selector */}
        <div className='flex gap-1 rounded-md border p-1'>
          <Button
            size='sm'
            variant={mode === 'individual' ? 'default' : 'ghost'}
            className='flex-1 gap-1'
            onClick={() => setMode('individual')}
          >
            <UserPlus className='size-3.5' /> Individual
          </Button>
          <Button
            size='sm'
            variant={mode === 'department' ? 'default' : 'ghost'}
            className='flex-1 gap-1'
            onClick={() => setMode('department')}
          >
            <Building2 className='size-3.5' /> Department
          </Button>
          <Button
            size='sm'
            variant={mode === 'all' ? 'default' : 'ghost'}
            className='flex-1 gap-1'
            onClick={() => setMode('all')}
          >
            <Users className='size-3.5' /> All
          </Button>
        </div>

        {/* Individual assignment */}
        {mode === 'individual' && (
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
              onClick={handleAssignIndividual}
              disabled={!selectedEmployeeId || assignKpi.isPending}
            >
              {assignKpi.isPending && <Loader2 className='animate-spin' />}
              Assign
            </Button>
          </div>
        )}

        {/* Department assignment */}
        {mode === 'department' && (
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <SelectDropdown
                defaultValue={selectedDepartmentId}
                onValueChange={setSelectedDepartmentId}
                isControlled
                isPending={isLoadingDepartments}
                placeholder='Select a department'
                items={(departments ?? []).map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
              />
            </div>
            <Button
              onClick={handleAssignDepartment}
              disabled={!selectedDepartmentId || assignKpi.isPending}
            >
              {assignKpi.isPending && <Loader2 className='animate-spin' />}
              Assign Dept
            </Button>
          </div>
        )}

        {/* All employees */}
        {mode === 'all' && (
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>
                Assign to all active employees
              </p>
              <p className='text-xs text-muted-foreground'>
                {availableEmployees.length} employee
                {availableEmployees.length !== 1 ? 's' : ''} not yet assigned
              </p>
            </div>
            <Button
              onClick={handleAssignAll}
              disabled={availableEmployees.length === 0 || assignKpi.isPending}
            >
              {assignKpi.isPending && <Loader2 className='animate-spin' />}
              Assign All
            </Button>
          </div>
        )}

        <Separator />

        {/* Currently assigned list */}
        <div className='max-h-64 space-y-2 overflow-y-auto'>
          <p className='text-sm font-medium text-muted-foreground'>
            Currently assigned ({(assignments ?? []).length})
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
