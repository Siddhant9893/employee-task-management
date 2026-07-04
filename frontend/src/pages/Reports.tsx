import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reportApi } from '../api/reportApi'
import type { ReportFormat, ReportType } from '../api/reportApi'
import { getApiErrorMessage } from '../utils/apiError'

const reports: Array<{
  description: string
  icon: React.ReactNode
  title: string
  type: ReportType
}> = [
  {
    description: 'Completed task export with assignee details.',
    icon: <TaskAltRoundedIcon />,
    title: 'Completed',
    type: 'completed',
  },
  {
    description: 'Pending task export for follow-up planning.',
    icon: <PendingActionsRoundedIcon />,
    title: 'Pending',
    type: 'pending',
  },
  {
    description: 'Employee-wise task counts and progress.',
    icon: <GroupsRoundedIcon />,
    title: 'Employee Wise',
    type: 'employee-wise',
  },
]

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function Reports() {
  const downloadMutation = useMutation({
    mutationFn: ({
      format,
      type,
    }: {
      format: ReportFormat
      type: ReportType
    }) => reportApi.downloadReport(type, format),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to download report'))
    },
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      toast.success('Report Downloaded')
    },
  })

  const handleDownload = (type: ReportType, format: ReportFormat) => {
    downloadMutation.mutate({ type, format })
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography color="text.primary" variant="h4">
          Reports
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body1">
          Download task and employee performance reports.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {reports.map((report) => (
          <Card
            elevation={0}
            key={report.type}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
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
                    {report.icon}
                  </Box>
                  <Box>
                    <Typography color="text.primary" variant="h6">
                      {report.title}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {report.description}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    disabled={downloadMutation.isPending}
                    fullWidth
                    onClick={() => handleDownload(report.type, 'csv')}
                    startIcon={<DownloadRoundedIcon />}
                    variant="outlined"
                  >
                    CSV
                  </Button>
                  <Button
                    disabled={downloadMutation.isPending}
                    fullWidth
                    onClick={() => handleDownload(report.type, 'excel')}
                    startIcon={<DownloadRoundedIcon />}
                    variant="contained"
                  >
                    Excel
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default Reports
