export type PerformanceRating =
    | 'Excellent'
    | 'Good'
    | 'Average'
    | 'Needs Improvement'
    | 'Poor'

export interface EvaluationHistoryEntry {
    id: string
    employeeId: string
    employeeName: string
    employeeCode: string
    period: string
    kpiScore: number
    rating: PerformanceRating
    comments: string | null
    status: string
    recordedAt: string
}
