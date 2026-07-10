import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/lib/route-guards'
import { MyKpis } from '@/features/my-kpis'

export const Route = createFileRoute('/_authenticated/my-kpis/')({
  beforeLoad: () => {
    requireRole(['karyawan'])
  },
  component: MyKpis,
})
