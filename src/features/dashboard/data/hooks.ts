import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
    getAdminDashboardStats,
    getDepartmentPerformance,
    getEmployeeDashboardStats,
    getEmployeeScoreHistory,
    getRecentActivity,
    getRecentEvaluations,
    getTopEmployeePerformance,
    getUpcomingKpis,
} from './api'

export function useAdminDashboardStats() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.admin, 'stats'],
        queryFn: getAdminDashboardStats,
    })
}

export function useDepartmentPerformance() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.admin, 'department-performance'],
        queryFn: getDepartmentPerformance,
    })
}

export function useTopEmployeePerformance() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.admin, 'employee-performance'],
        queryFn: () => getTopEmployeePerformance(),
    })
}

export function useRecentActivity() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.admin, 'recent-activity'],
        queryFn: () => getRecentActivity(),
    })
}

export function useRecentEvaluations() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.admin, 'recent-evaluations'],
        queryFn: () => getRecentEvaluations(),
    })
}

export function useEmployeeDashboardStats(employeeId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.dashboard.employee(employeeId ?? ''),
        queryFn: () => getEmployeeDashboardStats(employeeId!),
        enabled: !!employeeId,
    })
}

export function useEmployeeScoreHistory(employeeId: string | undefined) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.employee(employeeId ?? ''), 'history'],
        queryFn: () => getEmployeeScoreHistory(employeeId!),
        enabled: !!employeeId,
    })
}

export function useUpcomingKpis(employeeId: string | undefined) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.employee(employeeId ?? ''), 'upcoming'],
        queryFn: () => getUpcomingKpis(employeeId!),
        enabled: !!employeeId,
    })
}
