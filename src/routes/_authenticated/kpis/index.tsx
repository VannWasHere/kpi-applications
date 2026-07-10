import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/lib/route-guards'
import { Kpis } from '@/features/kpis'

const kpisSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  title: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/kpis/')({
  validateSearch: kpisSearchSchema,
  beforeLoad: () => {
    requireRole(['admin'])
  },
  component: Kpis,
})
