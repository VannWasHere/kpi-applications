import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { searchEmployees } from '../data/api'

type EmployeeComboboxProps = {
  value?: string
  onValueChange: (employeeId: string) => void
  excludeIds?: string[]
  placeholder?: string
  className?: string
}

export function EmployeeCombobox({
  value,
  onValueChange,
  excludeIds = [],
  placeholder = 'Search employee...',
  className,
}: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<string>()

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-search', search, excludeIds],
    queryFn: () =>
      searchEmployees(search, { excludeIds, activeOnly: true, limit: 20 }),
    enabled: open,
    staleTime: 5000,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className='truncate'>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className='ms-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Type name or ID...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            className='max-h-60 overscroll-contain'
            onWheel={(e) => {
              // The parent Dialog locks page scroll (react-remove-scroll),
              // which also swallows wheel events in this portaled popover.
              // Manually scroll the list so the mouse wheel works.
              e.currentTarget.scrollTop += e.deltaY
            }}
          >
            {isLoading && (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            )}
            {!isLoading && (employees ?? []).length === 0 && (
              <CommandEmpty>No employee found.</CommandEmpty>
            )}
            <CommandGroup>
              {(employees ?? []).map((emp) => (
                <CommandItem
                  key={emp.id}
                  value={emp.id}
                  onSelect={() => {
                    onValueChange(emp.id)
                    setSelectedLabel(`${emp.fullName} (${emp.employeeCode})`)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === emp.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div>
                    <p className='text-sm'>{emp.fullName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {emp.employeeCode} · {emp.email}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
