import { useAuthStore } from '@/stores/auth-store'
import { AdminDashboard } from './admin-dashboard'
import { EmployeeDashboard } from './employee-dashboard'

export function Dashboard() {
  const role = useAuthStore((state) => state.auth.profile?.role)
  return role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />
}
