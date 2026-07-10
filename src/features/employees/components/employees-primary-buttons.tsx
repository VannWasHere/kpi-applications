import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmployeesContext } from './employees-provider'

export function EmployeesPrimaryButtons() {
  const { setOpen } = useEmployeesContext()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Add Employee</span> <UserPlus size={18} />
    </Button>
  )
}
