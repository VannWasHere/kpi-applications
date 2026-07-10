import { z } from 'zod'

export const employeeStatusSchema = z.union([
    z.literal('active'),
    z.literal('inactive'),
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

export const employeeRoleSchema = z.union([
    z.literal('admin'),
    z.literal('karyawan'),
])
export type EmployeeRole = z.infer<typeof employeeRoleSchema>

export interface Employee {
    id: string
    profileId: string | null
    employeeCode: string
    fullName: string
    email: string
    departmentId: string | null
    departmentName: string | null
    position: string
    status: EmployeeStatus
    role: EmployeeRole
    createdAt: string
    updatedAt: string
}

export interface Department {
    id: string
    name: string
}
