import { supabase } from '@/lib/supabase'
import type { EmployeeKpiAssignment, Kpi, MyKpiAssignment } from './schema'

type KpiRow = {
    id: string
    title: string
    description: string | null
    category: string
    weight: number
    target: number
    due_date: string
    status: 'draft' | 'active' | 'completed'
    created_at: string
    updated_at: string
    employee_kpis: { count: number }[]
}

function mapKpi(row: KpiRow): Kpi {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        weight: row.weight,
        target: row.target,
        dueDate: row.due_date,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedCount: row.employee_kpis?.[0]?.count ?? 0,
    }
}

export async function listKpis(): Promise<Kpi[]> {
    const { data, error } = await supabase
        .from('kpis')
        .select(
            'id, title, description, category, weight, target, due_date, status, created_at, updated_at, employee_kpis(count)'
        )
        .order('created_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as unknown as KpiRow[]).map(mapKpi)
}

export type KpiInput = {
    title: string
    description: string | null
    category: string
    weight: number
    target: number
    dueDate: string
    status: 'draft' | 'active' | 'completed'
}

export async function createKpi(input: KpiInput) {
    const { data: session } = await supabase.auth.getSession()
    const { data, error } = await supabase
        .from('kpis')
        .insert({
            title: input.title,
            description: input.description,
            category: input.category,
            weight: input.weight,
            target: input.target,
            due_date: input.dueDate,
            status: input.status,
            created_by: session.session?.user.id ?? null,
        })
        .select('id')
        .single()

    if (error) throw error
    return data
}

export async function updateKpi(id: string, input: KpiInput) {
    const { error } = await supabase
        .from('kpis')
        .update({
            title: input.title,
            description: input.description,
            category: input.category,
            weight: input.weight,
            target: input.target,
            due_date: input.dueDate,
            status: input.status,
        })
        .eq('id', id)

    if (error) throw error
}

export async function deleteKpi(id: string) {
    const { error } = await supabase.from('kpis').delete().eq('id', id)
    if (error) throw error
}

type AssignmentRow = {
    id: string
    kpi_id: string
    employee_id: string
    current_value: number
    progress_percent: number
    weighted_score: number
    notes: string | null
    status: 'not_started' | 'in_progress' | 'completed'
    assigned_at: string
    updated_at: string
    employees: { full_name: string; employee_code: string } | null
}

function mapAssignment(row: AssignmentRow): EmployeeKpiAssignment {
    return {
        id: row.id,
        kpiId: row.kpi_id,
        employeeId: row.employee_id,
        employeeName: row.employees?.full_name ?? 'Unknown',
        employeeCode: row.employees?.employee_code ?? '—',
        currentValue: row.current_value,
        progressPercent: row.progress_percent,
        weightedScore: row.weighted_score,
        notes: row.notes,
        status: row.status,
        assignedAt: row.assigned_at,
        updatedAt: row.updated_at,
    }
}

export async function listAssignmentsForKpi(
    kpiId: string
): Promise<EmployeeKpiAssignment[]> {
    const { data, error } = await supabase
        .from('employee_kpis')
        .select(
            'id, kpi_id, employee_id, current_value, progress_percent, weighted_score, notes, status, assigned_at, updated_at, employees(full_name, employee_code)'
        )
        .eq('kpi_id', kpiId)
        .order('assigned_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as unknown as AssignmentRow[]).map(mapAssignment)
}

export async function assignKpiToEmployees(kpiId: string, employeeIds: string[]) {
    if (employeeIds.length === 0) return
    const { error } = await supabase
        .from('employee_kpis')
        .upsert(
            employeeIds.map((employeeId) => ({ kpi_id: kpiId, employee_id: employeeId })),
            { onConflict: 'kpi_id,employee_id', ignoreDuplicates: true }
        )

    if (error) throw error
}

export async function unassignKpi(assignmentId: string) {
    const { error } = await supabase
        .from('employee_kpis')
        .delete()
        .eq('id', assignmentId)
    if (error) throw error
}

type MyAssignmentRow = AssignmentRow & {
    kpis: {
        title: string
        category: string
        weight: number
        target: number
        due_date: string
        status: 'draft' | 'active' | 'completed'
    } | null
}

function mapMyAssignment(row: MyAssignmentRow): MyKpiAssignment {
    return {
        ...mapAssignment(row),
        kpiTitle: row.kpis?.title ?? 'Untitled KPI',
        kpiCategory: row.kpis?.category ?? '—',
        kpiWeight: row.kpis?.weight ?? 0,
        kpiTarget: row.kpis?.target ?? 0,
        kpiDueDate: row.kpis?.due_date ?? '',
        kpiStatus: row.kpis?.status ?? 'draft',
    }
}

export async function listMyAssignments(
    employeeId: string
): Promise<MyKpiAssignment[]> {
    const { data, error } = await supabase
        .from('employee_kpis')
        .select(
            'id, kpi_id, employee_id, current_value, progress_percent, weighted_score, notes, status, assigned_at, updated_at, employees(full_name, employee_code), kpis(title, category, weight, target, due_date, status)'
        )
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as unknown as MyAssignmentRow[]).map(mapMyAssignment)
}

export async function updateMyProgress(
    assignmentId: string,
    input: { currentValue: number; notes: string | null }
) {
    const { error } = await supabase
        .from('employee_kpis')
        .update({ current_value: input.currentValue, notes: input.notes })
        .eq('id', assignmentId)

    if (error) throw error
}
