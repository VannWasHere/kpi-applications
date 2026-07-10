import { supabase } from '@/lib/supabase'
import type { Department, Employee } from './schema'

type EmployeeRow = {
    id: string
    profile_id: string | null
    employee_code: string
    full_name: string
    email: string
    department_id: string | null
    position: string
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
    departments: { name: string } | null
    profiles: { role: 'admin' | 'karyawan' } | null
}

function mapEmployee(row: EmployeeRow): Employee {
    return {
        id: row.id,
        profileId: row.profile_id,
        employeeCode: row.employee_code,
        fullName: row.full_name,
        email: row.email,
        departmentId: row.department_id,
        departmentName: row.departments?.name ?? null,
        position: row.position,
        status: row.status,
        role: row.profiles?.role ?? 'karyawan',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function listEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
        .from('employees')
        .select(
            'id, profile_id, employee_code, full_name, email, department_id, position, status, created_at, updated_at, departments(name), profiles(role)'
        )
        .order('created_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as unknown as EmployeeRow[]).map(mapEmployee)
}

export async function getEmployeeByProfileId(
    profileId: string
): Promise<Employee | null> {
    const { data, error } = await supabase
        .from('employees')
        .select(
            'id, profile_id, employee_code, full_name, email, department_id, position, status, created_at, updated_at, departments(name), profiles(role)'
        )
        .eq('profile_id', profileId)
        .maybeSingle()

    if (error) throw error
    return data ? mapEmployee(data as unknown as EmployeeRow) : null
}

export async function listDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true })

    if (error) throw error
    return data ?? []
}

export type EmployeeInput = {
    employeeCode: string
    fullName: string
    email: string
    departmentId: string | null
    position: string
    status: 'active' | 'inactive'
    role: 'admin' | 'karyawan'
    /** Only used on create: provisions a login for the employee. */
    createLogin?: boolean
}

export async function createEmployee(input: EmployeeInput) {
    const { data: employee, error } = await supabase
        .from('employees')
        .insert({
            employee_code: input.employeeCode,
            full_name: input.fullName,
            email: input.email,
            department_id: input.departmentId,
            position: input.position,
            status: input.status,
        })
        .select('id')
        .single()

    if (error) throw error

    if (input.createLogin) {
        const { data: session } = await supabase.auth.getSession()
        const accessToken = session.session?.access_token
        const { error: fnError } = await supabase.functions.invoke(
            'create-employee-account',
            {
                body: {
                    employeeId: employee.id,
                    email: input.email,
                    fullName: input.fullName,
                    role: input.role,
                },
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : undefined,
            }
        )
        if (fnError) throw fnError
    }

    return employee
}

export async function updateEmployee(
    id: string,
    input: EmployeeInput,
    profileId: string | null
) {
    const { error } = await supabase
        .from('employees')
        .update({
            employee_code: input.employeeCode,
            full_name: input.fullName,
            email: input.email,
            department_id: input.departmentId,
            position: input.position,
            status: input.status,
        })
        .eq('id', id)

    if (error) throw error

    if (profileId) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: input.role, full_name: input.fullName })
            .eq('id', profileId)
        if (profileError) throw profileError
    }
}

export async function deleteEmployee(id: string) {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
}
