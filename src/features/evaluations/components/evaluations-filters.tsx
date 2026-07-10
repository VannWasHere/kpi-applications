import { type Employee } from '@/features/employees/data/schema'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import { getYearOptions, months } from '../data/data'

export type EvaluationFiltersValue = {
  employeeId?: string
  year?: string
  month?: string
}

type EvaluationsFiltersProps = {
  value: EvaluationFiltersValue
  onChange: (value: EvaluationFiltersValue) => void
  employees: Employee[]
}

export function EvaluationsFilters({
  value,
  onChange,
  employees,
}: EvaluationsFiltersProps) {
  const hasFilters = !!(value.employeeId || value.year || value.month)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <SelectDropdown
        defaultValue={value.employeeId}
        onValueChange={(v) => onChange({ ...value, employeeId: v })}
        isControlled
        placeholder='Filter by employee'
        className='w-48'
        items={employees.map((e) => ({
          label: `${e.fullName} (${e.employeeCode})`,
          value: e.id,
        }))}
      />
      <SelectDropdown
        defaultValue={value.year}
        onValueChange={(v) => onChange({ ...value, year: v })}
        isControlled
        placeholder='Filter by year'
        className='w-32'
        items={getYearOptions()}
      />
      <SelectDropdown
        defaultValue={value.month}
        onValueChange={(v) => onChange({ ...value, month: v })}
        isControlled
        placeholder='Filter by month'
        className='w-36'
        items={months}
      />
      {hasFilters && (
        <Button variant='ghost' onClick={() => onChange({})}>
          Reset
        </Button>
      )}
    </div>
  )
}
