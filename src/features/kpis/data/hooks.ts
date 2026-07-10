import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
    assignKpiToEmployees,
    createKpi,
    deleteKpi,
    listAssignmentsForKpi,
    listKpis,
    listMyAssignments,
    unassignKpi,
    updateKpi,
    updateMyProgress,
    type KpiInput,
} from './api'
import type { Kpi } from './schema'

export function useKpis() {
    return useQuery({
        queryKey: queryKeys.kpis.all,
        queryFn: listKpis,
    })
}

export function useKpiAssignments(kpiId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.kpis.assignments(kpiId ?? ''),
        queryFn: () => listAssignmentsForKpi(kpiId!),
        enabled: !!kpiId,
    })
}

export function useMyAssignments(employeeId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.employeeKpis.forEmployee(employeeId ?? ''),
        queryFn: () => listMyAssignments(employeeId!),
        enabled: !!employeeId,
    })
}

export function useCreateKpi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: KpiInput) => createKpi(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kpis.all })
        },
    })
}

export function useUpdateKpi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: KpiInput }) =>
            updateKpi(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kpis.all })
        },
    })
}

export function useDeleteKpi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (kpi: Kpi) => deleteKpi(kpi.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kpis.all })
        },
    })
}

export function useAssignKpi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            kpiId,
            employeeIds,
        }: {
            kpiId: string
            employeeIds: string[]
        }) => assignKpiToEmployees(kpiId, employeeIds),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.kpis.assignments(variables.kpiId),
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.kpis.all })
        },
    })
}

export function useUnassignKpi(kpiId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (assignmentId: string) => unassignKpi(assignmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.kpis.assignments(kpiId),
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.kpis.all })
        },
    })
}

export function useUpdateMyProgress(employeeId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            assignmentId,
            currentValue,
            notes,
        }: {
            assignmentId: string
            currentValue: number
            notes: string | null
        }) => updateMyProgress(assignmentId, { currentValue, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.employeeKpis.forEmployee(employeeId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.evaluations.forEmployee(employeeId),
            })
        },
    })
}
