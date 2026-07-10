import { type PerformanceRating } from './schema'

export const ratingStyles = new Map<PerformanceRating, string>([
    ['Excellent', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
    ['Good', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
    ['Average', 'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300'],
    [
        'Needs Improvement',
        'bg-orange-100/40 text-orange-900 dark:text-orange-200 border-orange-300',
    ],
    [
        'Poor',
        'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
    ],
])

export const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
]

export function getYearOptions(count = 5) {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: count }, (_, i) => {
        const year = String(currentYear - i)
        return { label: year, value: year }
    })
}
