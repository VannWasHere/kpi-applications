import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const profile = useAuthStore((state) => state.auth.profile)

  const navGroups = sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => !item.roles || (profile && item.roles.includes(profile.role)))
        .map((item) =>
          'items' in item && item.items
            ? {
                ...item,
                items: item.items.filter(
                  (subItem) =>
                    !subItem.roles || (profile && subItem.roles.includes(profile.role))
                ),
              }
            : item
        ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: profile?.fullName || 'User',
            email: profile?.email ?? '',
            avatar: profile?.avatarUrl ?? '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
