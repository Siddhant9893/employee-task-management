import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import Employees from '../pages/Employees'
import Login from '../pages/Login'
import Notifications from '../pages/Notifications'
import Register from '../pages/Register'
import Reports from '../pages/Reports'
import Tasks from '../pages/Tasks'
import ProtectedRoute from './ProtectedRoute'

function RootRedirect() {
  const { token } = useAppSelector((state) => state.auth)
  return <Navigate replace to={token ? '/dashboard' : '/login'} />
}

function PublicOnlyRoute() {
  const { token } = useAppSelector((state) => state.auth)
  return token ? <Navigate replace to="/dashboard" /> : <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootRedirect />} path="/" />
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route element={<Login />} path="/login" />
          <Route element={<Register />} path="/register" />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<Dashboard />} path="/dashboard" />
          <Route element={<Tasks />} path="/tasks" />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<Employees />} path="/employees" />
            <Route element={<Reports />} path="/reports" />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route element={<Notifications />} path="/notifications" />
          </Route>
        </Route>
      </Route>
      <Route element={<RootRedirect />} path="*" />
    </Routes>
  )
}

export default AppRoutes
