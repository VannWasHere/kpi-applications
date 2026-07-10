import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { listEvaluationHistory, type EvaluationHistoryFilters } from './api'

export function useEvaluationHistory(filters: EvaluationHistoryFilters) {
    return useQuery({
        queryKey: [...queryKeys.evaluations.all, filters],
        queryFn: () => listEvaluationHistory(filters),
    })
}
