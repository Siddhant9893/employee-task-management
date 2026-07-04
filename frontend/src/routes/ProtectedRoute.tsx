import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import type { UserRole } from '../features/auth/authTypes'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { token, user } = useAppSelector((state) => state.auth)

  if (token === null) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

export default ProtectedRoute
