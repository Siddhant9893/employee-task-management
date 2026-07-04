import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '../api/authApi'
import { getApiErrorMessage } from '../utils/apiError'

const passwordRule =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().regex(passwordRule, {
      message:
        'Password needs 8 characters with uppercase, lowercase, and a number',
    }),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    role: z.enum(['ADMIN', 'EMPLOYEE']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function Register() {
  const navigate = useNavigate()
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'EMPLOYEE',
    },
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      })
      toast.success('Account Created')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create account'))
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
              Register
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
              Create an admin or employee account
            </Typography>
          </Box>

          <TextField
            autoComplete="name"
            error={Boolean(errors.fullName)}
            fullWidth
            helperText={errors.fullName?.message}
            label="Full Name"
            {...register('fullName')}
          />
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
            autoComplete="new-password"
            error={Boolean(errors.password)}
            fullWidth
            helperText={errors.password?.message}
            label="Password"
            type="password"
            {...register('password')}
          />
          <TextField
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            fullWidth
            helperText={errors.confirmPassword?.message}
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.role)}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select label="Role" labelId="role-label" {...field}>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                </Select>
                {errors.role ? (
                  <FormHelperText>{errors.role.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Button
            disabled={isSubmitting}
            fullWidth
            size="large"
            startIcon={<PersonAddRoundedIcon />}
            type="submit"
            variant="contained"
          >
            Create Account
          </Button>
          <Typography
            color="text.secondary"
            sx={{ textAlign: 'center' }}
            variant="body2"
          >
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}

export default Register
