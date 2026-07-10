import {
  ClipboardList,
  History,
  LayoutDashboard,
  Settings,
  Target,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'KPI Application',
    email: '',
    avatar: '',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Employees',
          url: '/employees',
          icon: Users,
          roles: ['admin'],
        },
        {
          title: 'KPI Management',
          url: '/kpis',
          icon: Target,
          roles: ['admin'],
        },
        {
          title: 'My KPIs',
          url: '/my-kpis',
          icon: ClipboardList,
          roles: ['karyawan'],
        },
        {
          title: 'Evaluation History',
          url: '/evaluations',
          icon: History,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}
