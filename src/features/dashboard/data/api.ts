import { supabase } from '@/lib/supabase'

export type AdminDashboardStats = {
    totalEmployees: number
    activeKpis: number
    completedKpis: number
    averageScore: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [employeesRes, activeKpisRes, completedKpisRes, evaluationsRes] =
        await Promise.all([
            supabase.from('employees').select('id', { count: 'exact', head: true }),
            supabase
                .from('kpis')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'active'),
            supabase
                .from('kpis')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'completed'),
            supabase.from('evaluations').select('kpi_score'),
        ])

    if (employeesRes.error) throw employeesRes.error
    if (activeKpisRes.error) throw activeKpisRes.error
    if (completedKpisRes.error) throw completedKpisRes.error
    if (evaluationsRes.error) throw evaluationsRes.error

    const scores = (evaluationsRes.data ?? []).map((e) => e.kpi_score)
    const averageScore =
        scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
            : 0

    return {
        totalEmployees: employeesRes.count ?? 0,
        activeKpis: activeKpisRes.count ?? 0,
        completedKpis: completedKpisRes.count ?? 0,
        averageScore,
    }
}

export type DepartmentPerformance = {
    departmentName: string
    averageScore: number
}

export async function getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    const { data, error } = await supabase
        .from('evaluations')
        .select('kpi_score, employees(department_id, departments(name))')

    if (error) throw error

    const grouped = new Map<string, number[]>()
    for (const row of data ?? []) {
        const employee = row.employees as unknown as {
            department_id: string | null
            departments: { name: string } | null
        } | null
        const name = employee?.departments?.name ?? 'Unassigned'
        const scores = grouped.get(name) ?? []
        scores.push(row.kpi_score)
        grouped.set(name, scores)
    }

    return Array.from(grouped.entries()).map(([departmentName, scores]) => ({
        departmentName,
        averageScore:
            Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
    }))
}

export type EmployeePerformance = {
    employeeName: string
    score: number
}

export async function getTopEmployeePerformance(
    limit = 10
): Promise<EmployeePerformance[]> {
    const { data, error } = await supabase
        .from('evaluations')
        .select('kpi_score, employees(full_name)')
        .order('kpi_score', { ascending: false })
        .limit(limit)

    if (error) throw error

    return (data ?? []).map((row) => ({
        employeeName:
            (row.employees as unknown as { full_name: string } | null)?.full_name ??
            'Unknown',
        score: row.kpi_score,
    }))
}

export type ActivityLogEntry = {
    id: string
    description: string
    createdAt: string
}

export async function getRecentActivity(limit = 8): Promise<ActivityLogEntry[]> {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('id, description, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return (data ?? []).map((row) => ({
        id: row.id,
        description: row.description,
        createdAt: row.created_at,
    }))
}

export type RecentEvaluation = {
    id: string
    employeeName: string
    period: string
    kpiScore: number
    rating: string
    recordedAt: string
}

export async function getRecentEvaluations(limit = 8): Promise<RecentEvaluation[]> {
    const { data, error } = await supabase
        .from('evaluation_history')
        .select('id, period, kpi_score, rating, recorded_at, employees(full_name)')
        .order('recorded_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return (data ?? []).map((row) => ({
        id: row.id,
        employeeName:
            (row.employees as unknown as { full_name: string } | null)?.full_name ??
            'Unknown',
        period: row.period,
        kpiScore: row.kpi_score,
        rating: row.rating,
        recordedAt: row.recorded_at,
    }))
}

export type EmployeeDashboardStats = {
    assignedKpis: number
    completedKpis: number
    currentScore: number
    rating: string
}

export async function getEmployeeDashboardStats(
    employeeId: string
): Promise<EmployeeDashboardStats> {
    const [assignmentsRes, latestEvaluationRes] = await Promise.all([
        supabase
            .from('employee_kpis')
            .select('status')
            .eq('employee_id', employeeId),
        supabase
            .from('evaluations')
            .select('kpi_score, rating')
            .eq('employee_id', employeeId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ])

    if (assignmentsRes.error) throw assignmentsRes.error
    if (latestEvaluationRes.error) throw latestEvaluationRes.error

    const assignments = assignmentsRes.data ?? []
    const completedKpis = assignments.filter((a) => a.status === 'completed').length

    return {
        assignedKpis: assignments.length,
        completedKpis,
        currentScore: latestEvaluationRes.data?.kpi_score ?? 0,
        rating: latestEvaluationRes.data?.rating ?? 'Poor',
    }
}

export type EvaluationHistoryPoint = {
    period: string
    kpiScore: number
}

export async function getEmployeeScoreHistory(
    employeeId: string
): Promise<EvaluationHistoryPoint[]> {
    const { data, error } = await supabase
        .from('evaluations')
        .select('period, kpi_score')
        .eq('employee_id', employeeId)
        .order('period', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row) => ({
        period: row.period,
        kpiScore: row.kpi_score,
    }))
}

export type UpcomingKpi = {
    id: string
    title: string
    dueDate: string
    progressPercent: number
}

export async function getUpcomingKpis(employeeId: string): Promise<UpcomingKpi[]> {
    const { data, error } = await supabase
        .from('employee_kpis')
        .select('id, progress_percent, kpis(id, title, due_date)')
        .eq('employee_id', employeeId)
        .neq('status', 'completed')
        .order('assigned_at', { ascending: false })
        .limit(5)

    if (error) throw error
    return (data ?? [])
        .map((row) => {
            const kpi = row.kpis as unknown as {
                id: string
                title: string
                due_date: string
            } | null
            if (!kpi) return null
            return {
                id: kpi.id,
                title: kpi.title,
                dueDate: kpi.due_date,
                progressPercent: row.progress_percent,
            }
        })
        .filter((v): v is UpcomingKpi => v !== null)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}
