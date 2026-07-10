import { Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKpisContext } from './kpis-provider'

export function KpisPrimaryButtons() {
  const { setOpen } = useKpisContext()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Create KPI</span> <Target size={18} />
    </Button>
  )
}
