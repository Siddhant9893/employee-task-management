import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loginUser } from '../features/auth/authSlice'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

type LocationState = {
  from?: {
    pathname?: string
  }
}

function Login() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const loading = useAppSelector((state) => state.auth.loading)
  const from =
    (location.state as LocationState | null)?.from?.pathname ?? '/dashboard'

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginUser(values)).unwrap()
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Unable to sign in'

      toast.error(message)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 3, sm: 4 },
      }}
    >
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Box>
            <Typography color="text.primary" variant="h4">
              Sign In
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
              Employee task management
            </Typography>
          </Box>

          {location.state ? (
            <Alert severity="info">Please sign in to continue.</Alert>
          ) : null}

          <TextField
            autoComplete="email"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message}
            label="Email"
            type="email"
            {...register('email')}
          />
          <TextField
            autoComplete="current-password"
            error={Boolean(errors.password)}
            fullWidth
            helperText={errors.password?.message}
            label="Password"
            type="password"
            {...register('password')}
          />
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label="Remember Me"
              />
            )}
          />
          <Button
            disabled={loading || isSubmitting}
            fullWidth
            size="large"
            startIcon={<LoginRoundedIcon />}
            type="submit"
            variant="contained"
          >
            Sign In
          </Button>
          <Typography
            color="text.secondary"
            sx={{ textAlign: 'center' }}
            variant="body2"
          >
            New here?{' '}
            <Link component={RouterLink} to="/register">
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}

export default Login
