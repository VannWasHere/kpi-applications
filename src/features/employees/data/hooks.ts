import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
    createEmployee,
    deleteEmployee,
    getEmployeeByProfileId,
    listDepartments,
    listEmployees,
    updateEmployee,
    type EmployeeInput,
} from './api'
import type { Employee } from './schema'

export function useEmployees() {
    return useQuery({
        queryKey: queryKeys.employees.all,
        queryFn: listEmployees,
    })
}

export function useCurrentEmployee(profileId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.employees.detail(profileId ?? ''),
        queryFn: () => getEmployeeByProfileId(profileId!),
        enabled: !!profileId,
    })
}

export function useDepartments() {
    return useQuery({
        queryKey: queryKeys.departments.all,
        queryFn: listDepartments,
    })
}

export function useCreateEmployee() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: EmployeeInput) => createEmployee(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
        },
    })
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            input,
            profileId,
        }: {
            id: string
            input: EmployeeInput
            profileId: string | null
        }) => updateEmployee(id, input, profileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
        },
    })
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (employee: Employee) => deleteEmployee(employee.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
        },
    })
}
