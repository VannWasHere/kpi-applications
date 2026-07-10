import { createFileRoute } from '@tanstack/react-router'
import { Evaluations } from '@/features/evaluations'

export const Route = createFileRoute('/_authenticated/evaluations/')({
  component: Evaluations,
})
