import { EmployeeCombobox } from '@/features/employees/components/employee-combobox'
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
}

export function EvaluationsFilters({
  value,
  onChange,
}: EvaluationsFiltersProps) {
  const hasFilters = !!(value.employeeId || value.year || value.month)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='w-64'>
        <EmployeeCombobox
          value={value.employeeId}
          onValueChange={(v) => onChange({ ...value, employeeId: v })}
          placeholder='Filter by employee...'
        />
      </div>
      <SelectDropdown
        defaultValue={value.year}
        onValueChange={(v) => onChange({ ...value, year: v })}
        isControlled
        placeholder='Year'
        className='w-28'
        items={getYearOptions()}
      />
      <SelectDropdown
        defaultValue={value.month}
        onValueChange={(v) => onChange({ ...value, month: v })}
        isControlled
        placeholder='Month'
        className='w-32'
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
