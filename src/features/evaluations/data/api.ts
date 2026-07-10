import { supabase } from '@/lib/supabase'
import type { EvaluationHistoryEntry, PerformanceRating } from './schema'

type HistoryRow = {
    id: string
    employee_id: string
    period: string
    kpi_score: number
    rating: PerformanceRating
    comments: string | null
    status: string
    recorded_at: string
    employees: { full_name: string; employee_code: string } | null
}

function mapHistory(row: HistoryRow): EvaluationHistoryEntry {
    return {
        id: row.id,
        employeeId: row.employee_id,
        employeeName: row.employees?.full_name ?? 'Unknown',
        employeeCode: row.employees?.employee_code ?? '—',
        period: row.period,
        kpiScore: row.kpi_score,
        rating: row.rating,
        comments: row.comments,
        status: row.status,
        recordedAt: row.recorded_at,
    }
}

export type EvaluationHistoryFilters = {
    employeeId?: string
    year?: string
    month?: string
}

export async function listEvaluationHistory(
    filters: EvaluationHistoryFilters = {}
): Promise<EvaluationHistoryEntry[]> {
    let query = supabase
        .from('evaluation_history')
        .select(
            'id, employee_id, period, kpi_score, rating, comments, status, recorded_at, employees(full_name, employee_code)'
        )
        .order('recorded_at', { ascending: false })

    if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId)
    }
    if (filters.year && filters.month) {
        query = query.eq('period', `${filters.year}-${filters.month}`)
    } else if (filters.year) {
        query = query.like('period', `${filters.year}-%`)
    }

    const { data, error } = await query
    if (error) throw error
    return ((data ?? []) as unknown as HistoryRow[]).map(mapHistory)
}
