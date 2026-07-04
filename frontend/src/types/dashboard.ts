export type AdminDashboardStats = {
  totalEmployees: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export type EmployeeDashboardStats = {
  myTasks: number
  completed: number
  pending: number
  overdue: number
}

export type DashboardStats = AdminDashboardStats | EmployeeDashboardStats

export const isAdminDashboardStats = (
  stats: DashboardStats,
): stats is AdminDashboardStats => 'totalEmployees' in stats
