import { useState } from 'react'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import NotificationBell from '../components/layout/NotificationBell'
import { logout } from '../features/auth/authSlice'
import type { UserRole } from '../features/auth/authTypes'

const drawerWidth = 264

type NavItem = {
  label: string
  path: string
  icon: ReactNode
}

const getNavItems = (role?: UserRole): NavItem[] => {
  if (role === 'ADMIN') {
    return [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardRoundedIcon />,
      },
      {
        label: 'Employees',
        path: '/employees',
        icon: <GroupsRoundedIcon />,
      },
      {
        label: 'Tasks',
        path: '/tasks',
        icon: <AssignmentRoundedIcon />,
      },
      {
        label: 'Reports',
        path: '/reports',
        icon: <AssessmentRoundedIcon />,
      },
    ]
  }

  return [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardRoundedIcon />,
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: <AssignmentRoundedIcon />,
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <NotificationsRoundedIcon />,
    },
  ]
}

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const navItems = getNavItems(user?.role)

  const handleNavigate = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography color="primary" variant="h6">
          Task Manager
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {user?.role === 'ADMIN' ? 'Admin Workspace' : 'Employee Workspace'}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogoutRoundedIcon />}
          variant="outlined"
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', display: 'flex', minHeight: '100vh' }}>
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            aria-label="Open navigation"
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap color="text.primary" variant="subtitle1">
              {user?.fullName ?? 'Workspace'}
            </Typography>
            <Typography noWrap color="text.secondary" variant="body2">
              {user?.email}
            </Typography>
          </Box>
          <NotificationBell />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }}
      >
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          variant="temporary"
        >
          {drawer}
        </Drawer>
        <Drawer
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          variant="permanent"
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4,
          pt: 12,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
