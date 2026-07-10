/**
 * Centralized React Query key factories, so cache invalidation stays
 * consistent across features.
 */
export const queryKeys = {
    departments: {
        all: ['departments'] as const,
    },
    employees: {
        all: ['employees'] as const,
        detail: (id: string) => ['employees', id] as const,
    },
    kpis: {
        all: ['kpis'] as const,
        detail: (id: string) => ['kpis', id] as const,
        assignments: (kpiId: string) => ['kpis', kpiId, 'assignments'] as const,
    },
    employeeKpis: {
        all: ['employee-kpis'] as const,
        forEmployee: (employeeId: string) =>
            ['employee-kpis', 'employee', employeeId] as const,
    },
    evaluations: {
        all: ['evaluations'] as const,
        forEmployee: (employeeId: string) =>
            ['evaluations', 'employee', employeeId] as const,
    },
    dashboard: {
        admin: ['dashboard', 'admin'] as const,
        employee: (employeeId: string) =>
            ['dashboard', 'employee', employeeId] as const,
    },
} as const
