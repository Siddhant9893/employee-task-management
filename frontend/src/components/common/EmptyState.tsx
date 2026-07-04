import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
}

function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>{icon}</Box>
      <Typography color="text.primary" variant="h6">
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          {description}
        </Typography>
      ) : null}
    </Paper>
  )
}

export default EmptyState
