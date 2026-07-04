import DoneRoundedIcon from '@mui/icons-material/DoneRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api/notificationApi'
import type { Notification } from '../api/notificationApi'
import EmptyState from '../components/common/EmptyState'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDate, labelize } from '../utils/format'

function NotificationsSkeleton() {
  return (
    <Stack spacing={2}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton height={82} key={index} variant="rounded" />
      ))}
    </Stack>
  )
}

function Notifications() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryFn: notificationApi.getNotifications,
    queryKey: ['notifications'],
  })

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update notification'))
    },
    onSuccess: async () => {
      toast.success('Notification Marked Read')
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const notifications = data?.data ?? []

  const handleOpenNotification = async (notification: Notification) => {
    if (!notification.isRead && !markReadMutation.isPending) {
      try {
        await markReadMutation.mutateAsync(notification.id)
      } catch {
        return
      }
    }

    if (notification.taskId) {
      navigate(`/tasks?taskId=${notification.taskId}`)
    }
  }

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
            Notifications
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body1">
            Review task updates and mark them as read.
          </Typography>
        </Box>
      </Stack>

      {isLoading ? <NotificationsSkeleton /> : null}

      {!isLoading && notifications.length === 0 ? (
        <EmptyState
          description="Task updates will appear here."
          icon={<NotificationsRoundedIcon sx={{ fontSize: 48 }} />}
          title="No notifications found"
        />
      ) : null}

      {!isLoading && notifications.length > 0 ? (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Paper
              elevation={0}
              key={notification.id}
              onClick={() => void handleOpenNotification(notification)}
              sx={{
                border: '1px solid',
                borderColor: notification.isRead ? 'divider' : 'primary.main',
                cursor: notification.taskId ? 'pointer' : 'default',
                p: 2.5,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      color={notification.isRead ? 'default' : 'primary'}
                      label={notification.isRead ? 'Read' : 'Unread'}
                      size="small"
                    />
                    <Chip
                      label={labelize(notification.type)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography color="text.primary" variant="subtitle1">
                    {notification.message}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {formatDate(notification.createdAt)}
                  </Typography>
                </Box>
                <Button
                  disabled={notification.isRead || markReadMutation.isPending}
                  onClick={(event) => {
                    event.stopPropagation()
                    markReadMutation.mutate(notification.id)
                  }}
                  startIcon={<DoneRoundedIcon />}
                  variant={notification.isRead ? 'outlined' : 'contained'}
                >
                  Mark Read
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </Box>
  )
}

export default Notifications
