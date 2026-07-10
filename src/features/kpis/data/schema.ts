export type KpiStatus = 'draft' | 'active' | 'completed'
export type EmployeeKpiStatus = 'not_started' | 'in_progress' | 'completed'

export interface Kpi {
    id: string
    title: string
    description: string | null
    category: string
    weight: number
    target: number
    dueDate: string
    status: KpiStatus
    createdAt: string
    updatedAt: string
    assignedCount: number
}

export interface EmployeeKpiAssignment {
    id: string
    kpiId: string
    employeeId: string
    employeeName: string
    employeeCode: string
    currentValue: number
    progressPercent: number
    weightedScore: number
    notes: string | null
    status: EmployeeKpiStatus
    assignedAt: string
    updatedAt: string
}

/** A KPI assignment joined with its parent KPI's info — used on the employee's "My KPIs" view. */
export interface MyKpiAssignment extends EmployeeKpiAssignment {
    kpiTitle: string
    kpiCategory: string
    kpiWeight: number
    kpiTarget: number
    kpiDueDate: string
    kpiStatus: KpiStatus
}
