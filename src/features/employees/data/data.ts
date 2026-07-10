import { ShieldCheck, UserRound } from 'lucide-react'
import { type EmployeeRole, type EmployeeStatus } from './schema'

export const statusStyles = new Map<EmployeeStatus, string>([
    ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const roles: { label: string; value: EmployeeRole; icon: typeof ShieldCheck }[] = [
    { label: 'Admin', value: 'admin', icon: ShieldCheck },
    { label: 'Karyawan', value: 'karyawan', icon: UserRound },
]

export const statuses: { label: string; value: EmployeeStatus }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
]
