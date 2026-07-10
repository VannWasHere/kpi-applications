import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/lib/route-guards'
import { Employees } from '@/features/employees'

const employeesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
  role: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/employees/')({
  validateSearch: employeesSearchSchema,
  beforeLoad: () => {
    requireRole(['admin'])
  },
  component: Employees,
})
