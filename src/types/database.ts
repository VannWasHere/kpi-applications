/**
 * Hand-written types mirroring the Supabase Postgres schema defined in
 * supabase/migrations/*.sql. If the schema changes, update this file
 * (or regenerate with `supabase gen types typescript`).
 */

export type AppRole = 'admin' | 'karyawan'
export type EmployeeStatus = 'active' | 'inactive'
export type KpiStatus = 'draft' | 'active' | 'completed'
export type EmployeeKpiStatus = 'not_started' | 'in_progress' | 'completed'
export type EvaluationStatus = 'draft' | 'submitted' | 'finalized'
export type PerformanceRating =
    | 'Excellent'
    | 'Good'
    | 'Average'
    | 'Needs Improvement'
    | 'Poor'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    role: AppRole
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string
                    role?: AppRole
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    role?: AppRole
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            departments: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            employees: {
                Row: {
                    id: string
                    profile_id: string | null
                    employee_code: string
                    full_name: string
                    email: string
                    department_id: string | null
                    position: string
                    status: EmployeeStatus
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id?: string | null
                    employee_code: string
                    full_name: string
                    email: string
                    department_id?: string | null
                    position: string
                    status?: EmployeeStatus
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string | null
                    employee_code?: string
                    full_name?: string
                    email?: string
                    department_id?: string | null
                    position?: string
                    status?: EmployeeStatus
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'employees_department_id_fkey'
                        columns: ['department_id']
                        isOneToOne: false
                        referencedRelation: 'departments'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'employees_profile_id_fkey'
                        columns: ['profile_id']
                        isOneToOne: true
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            kpis: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: string
                    weight: number
                    target: number
                    due_date: string
                    status: KpiStatus
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    category: string
                    weight: number
                    target: number
                    due_date: string
                    status?: KpiStatus
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    weight?: number
                    target?: number
                    due_date?: string
                    status?: KpiStatus
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'kpis_created_by_fkey'
                        columns: ['created_by']
                        isOneToOne: false
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            employee_kpis: {
                Row: {
                    id: string
                    kpi_id: string
                    employee_id: string
                    current_value: number
                    progress_percent: number
                    weighted_score: number
                    notes: string | null
                    status: EmployeeKpiStatus
                    assigned_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    kpi_id: string
                    employee_id: string
                    current_value?: number
                    progress_percent?: number
                    weighted_score?: number
                    notes?: string | null
                    status?: EmployeeKpiStatus
                    assigned_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    kpi_id?: string
                    employee_id?: string
                    current_value?: number
                    progress_percent?: number
                    weighted_score?: number
                    notes?: string | null
                    status?: EmployeeKpiStatus
                    assigned_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'employee_kpis_kpi_id_fkey'
                        columns: ['kpi_id']
                        isOneToOne: false
                        referencedRelation: 'kpis'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'employee_kpis_employee_id_fkey'
                        columns: ['employee_id']
                        isOneToOne: false
                        referencedRelation: 'employees'
                        referencedColumns: ['id']
                    },
                ]
            }
            evaluations: {
                Row: {
                    id: string
                    employee_id: string
                    period: string
                    kpi_score: number
                    rating: PerformanceRating
                    comments: string | null
                    status: EvaluationStatus
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_id: string
                    period: string
                    kpi_score?: number
                    rating?: PerformanceRating
                    comments?: string | null
                    status?: EvaluationStatus
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_id?: string
                    period?: string
                    kpi_score?: number
                    rating?: PerformanceRating
                    comments?: string | null
                    status?: EvaluationStatus
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'evaluations_employee_id_fkey'
                        columns: ['employee_id']
                        isOneToOne: false
                        referencedRelation: 'employees'
                        referencedColumns: ['id']
                    },
                ]
            }
            evaluation_history: {
                Row: {
                    id: string
                    evaluation_id: string | null
                    employee_id: string
                    period: string
                    kpi_score: number
                    rating: PerformanceRating
                    comments: string | null
                    status: string
                    recorded_at: string
                }
                Insert: {
                    id?: string
                    evaluation_id?: string | null
                    employee_id: string
                    period: string
                    kpi_score: number
                    rating: PerformanceRating
                    comments?: string | null
                    status: string
                    recorded_at?: string
                }
                Update: {
                    id?: string
                    evaluation_id?: string | null
                    employee_id?: string
                    period?: string
                    kpi_score?: number
                    rating?: PerformanceRating
                    comments?: string | null
                    status?: string
                    recorded_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'evaluation_history_employee_id_fkey'
                        columns: ['employee_id']
                        isOneToOne: false
                        referencedRelation: 'employees'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'evaluation_history_evaluation_id_fkey'
                        columns: ['evaluation_id']
                        isOneToOne: false
                        referencedRelation: 'evaluations'
                        referencedColumns: ['id']
                    },
                ]
            }
            activity_logs: {
                Row: {
                    id: string
                    actor_id: string | null
                    action: string
                    entity_type: string
                    entity_id: string | null
                    description: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_id?: string | null
                    action: string
                    entity_type: string
                    entity_id?: string | null
                    description: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    actor_id?: string | null
                    action?: string
                    entity_type?: string
                    entity_id?: string | null
                    description?: string
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
    }
}
