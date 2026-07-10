import { type KpiStatus } from './schema'

export const kpiStatuses: { label: string; value: KpiStatus }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
]

export const kpiStatusStyles = new Map<KpiStatus, string>([
    ['draft', 'bg-neutral-300/40 border-neutral-300'],
    ['active', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
    [
        'completed',
        'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
    ],
])

export const kpiCategories = [
    'Sales',
    'Productivity',
    'Quality',
    'Customer Satisfaction',
    'Attendance',
    'Innovation',
    'Other',
]
