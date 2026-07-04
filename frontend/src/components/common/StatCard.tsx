import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

type StatCardProps = {
  title: string
  value: number | string
  icon: ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        p: 3,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(21, 101, 192, 0.08)',
            borderRadius: 2,
            color: 'primary.main',
            display: 'flex',
            height: 48,
            justifyContent: 'center',
            width: 48,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography color="text.primary" variant="h5">
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  )
}

export default StatCard
