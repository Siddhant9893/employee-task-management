import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Box>
  )
}

export default AuthLayout
