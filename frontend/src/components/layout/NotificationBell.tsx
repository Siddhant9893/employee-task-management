import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../../api/notificationApi'
import type { Notification } from '../../api/notificationApi'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatDate, labelize } from '../../utils/format'

function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const open = Boolean(anchorEl)

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
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const notifications = data?.data ?? []
  const unreadCount = notifications.filter((item) => !item.isRead).length

  const handleOpenNotification = async (notification: Notification) => {
    if (!notification.isRead && !markReadMutation.isPending) {
      try {
        await markReadMutation.mutateAsync(notification.id)
      } catch {
        return
      }
    }

    setAnchorEl(null)

    if (notification.taskId) {
      navigate(`/tasks?taskId=${notification.taskId}`)
      return
    }

    navigate('/notifications')
  }
  return (
    <>
      <IconButton
        aria-label="Notifications"
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        open={open}
        slotProps={{
          paper: {
            sx: { mt: 1, width: 360, maxWidth: 'calc(100vw - 32px)' },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">Notifications</Typography>
          <Typography color="text.secondary" variant="body2">
            {unreadCount} unread
          </Typography>
        </Box>
        <Divider />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : null}
        {!isLoading && notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              No notifications found
            </Typography>
          </Box>
        ) : null}
        {notifications.slice(0, 7).map((notification) => (
          <ListItemButton
            key={notification.id}
            onClick={() => void handleOpenNotification(notification)}
            selected={!notification.isRead}
            sx={{ alignItems: 'flex-start', py: 1.25 }}
          >
            <ListItemText
              primary={notification.message}
              secondary={`${labelize(notification.type)} - ${formatDate(
                notification.createdAt,
              )}`}
              slotProps={{
                primary: { variant: 'body2' },
                secondary: { variant: 'caption' },
              }}
            />
          </ListItemButton>
        ))}
      </Menu>
    </>
  )
}

export default NotificationBell
