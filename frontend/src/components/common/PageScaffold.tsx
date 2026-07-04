import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

type PageScaffoldProps = {
  title: string
  description: string
}

function PageScaffold({ title, description }: PageScaffoldProps) {
  return (
    <Box>
      <Typography color="text.primary" variant="h4">
        {title}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          mt: 3,
          p: 3,
        }}
      >
        <Typography color="text.secondary" variant="body1">
          {description}
        </Typography>
      </Paper>
    </Box>
  )
}

export default PageScaffold
