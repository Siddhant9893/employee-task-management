import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboardApi'
import { useAppSelector } from '../app/hooks'
import StatCard from '../components/common/StatCard'
import { isAdminDashboardStats } from '../types/dashboard'

function Dashboard() {
  const { token, user } = useAppSelector((state) => state.auth)
  const { data, isError, isLoading, refetch } = useQuery({
    enabled: Boolean(token),
    queryFn: dashboardApi.getDashboard,
    queryKey: ['dashboard', user?.role],
  })

  const cards = data
    ? isAdminDashboardStats(data)
      ? [
          {
            title: 'Total Employees',
            value: data.totalEmployees,
            icon: <GroupsRoundedIcon />,
          },
          {
            title: 'Total Tasks',
            value: data.totalTasks,
            icon: <TaskAltRoundedIcon />,
          },
          {
            title: 'Completed',
            value: data.completedTasks,
            icon: <AssignmentTurnedInRoundedIcon />,
          },
          {
            title: 'Pending',
            value: data.pendingTasks,
            icon: <PendingActionsRoundedIcon />,
          },
        ]
      : [
          {
            title: 'My Tasks',
            value: data.myTasks,
            icon: <TaskAltRoundedIcon />,
          },
          {
            title: 'Completed',
            value: data.completed,
            icon: <AssignmentTurnedInRoundedIcon />,
          },
          {
            title: 'Pending',
            value: data.pending,
            icon: <PendingActionsRoundedIcon />,
          },
          {
            title: 'Overdue',
            value: data.overdue,
            icon: <ErrorOutlineRoundedIcon />,
          },
        ]
    : []

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography color="text.primary" variant="h4">
            Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body1">
            {user?.role === 'ADMIN'
              ? 'Organization task overview'
              : 'Your task overview'}
          </Typography>
        </Box>
      </Stack>

      {isLoading ? (
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : null}

      {isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => void refetch()} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          Unable to load dashboard.
        </Alert>
      ) : null}

      {cards.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {cards.map((card) => (
            <StatCard
              icon={card.icon}
              key={card.title}
              title={card.title}
              value={card.value}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

export default Dashboard
