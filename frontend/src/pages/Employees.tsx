import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SortRoundedIcon from '@mui/icons-material/SortRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { employeeApi } from '../api/employeeApi'
import type {
  Employee,
  EmployeePayload,
  EmployeeQueryParams,
} from '../api/employeeApi'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { getApiErrorMessage } from '../utils/apiError'

type SortField = NonNullable<EmployeeQueryParams['sortBy']>

type EmployeeDialogState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; employee: Employee }

const sortOptions: Array<{ label: string; value: SortField }> = [
  { label: 'Created', value: 'createdAt' },
  { label: 'Name', value: 'fullName' },
  { label: 'Email', value: 'email' },
  { label: 'Department', value: 'department' },
  { label: 'Designation', value: 'designation' },
]

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/

const employeeFormSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  password: z
    .string()
    .optional()
    .refine((value) => !value || passwordPattern.test(value), {
      message:
        'Password needs 8 characters with uppercase, lowercase, and a number',
    }),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

const defaultEmployeeValues: EmployeeFormValues = {
  fullName: '',
  email: '',
  department: '',
  designation: '',
  password: '',
}

function EmployeeEmptyOverlay() {
  return (
    <EmptyState
      description="Try adjusting your search or add a new employee."
      icon={<GroupsRoundedIcon sx={{ fontSize: 48 }} />}
      title="No employees found"
    />
  )
}

function EmployeesSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton height={42} key={index} variant="rounded" />
      ))}
    </Stack>
  )
}

function Employees() {
  const [dialogState, setDialogState] = useState<EmployeeDialogState>({
    mode: 'closed',
  })
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const queryClient = useQueryClient()
  const isDialogOpen = dialogState.mode !== 'closed'

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<EmployeeFormValues>({
    defaultValues: defaultEmployeeValues,
    resolver: zodResolver(employeeFormSchema),
  })

  const queryParams: EmployeeQueryParams = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: deferredSearch || undefined,
    sortBy,
    sortOrder,
  }

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryFn: () => employeeApi.getEmployees(queryParams),
    queryKey: ['employees', queryParams],
  })

  const employees = data?.data ?? []
  const rowCount = data?.meta?.total ?? 0

  const createMutation = useMutation({
    mutationFn: employeeApi.createEmployee,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create employee'))
    },
    onSuccess: async () => {
      toast.success('Employee Created')
      setDialogState({ mode: 'closed' })
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<EmployeePayload>
    }) => employeeApi.updateEmployee(id, payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update employee'))
    },
    onSuccess: async () => {
      toast.success('Employee Updated')
      setDialogState({ mode: 'closed' })
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete employee'))
    },
    onSuccess: async () => {
      toast.success('Deleted Successfully')
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const sortModel: GridSortModel = useMemo(
    () => [{ field: sortBy, sort: sortOrder }],
    [sortBy, sortOrder],
  )

  const columns: GridColDef<Employee>[] = [
      {
        field: 'fullName',
        flex: 1,
        headerName: 'Name',
        minWidth: 180,
      },
      {
        field: 'email',
        flex: 1,
        headerName: 'Email',
        minWidth: 220,
      },
      {
        field: 'department',
        flex: 1,
        headerName: 'Department',
        minWidth: 160,
        valueGetter: (_value, row) => row.department ?? '-',
      },
      {
        field: 'designation',
        flex: 1,
        headerName: 'Designation',
        minWidth: 160,
        valueGetter: (_value, row) => row.designation ?? '-',
      },
      {
        field: 'actions',
        filterable: false,
        headerName: 'Actions',
        minWidth: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit employee">
              <IconButton
                aria-label={`Edit ${row.fullName}`}
                onClick={() => openEditDialog(row)}
                size="small"
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete employee">
              <IconButton
                aria-label={`Delete ${row.fullName}`}
                color="error"
                onClick={() => setDeleteTarget(row)}
                size="small"
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
  ]

  const openAddDialog = () => {
    reset(defaultEmployeeValues)
    setDialogState({ mode: 'add' })
  }

  const openEditDialog = (employee: Employee) => {
    reset({
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department ?? '',
      designation: employee.designation ?? '',
      password: '',
    })
    setDialogState({ mode: 'edit', employee })
  }

  const handleDialogClose = () => {
    setDialogState({ mode: 'closed' })
  }

  const handleFormSubmit = async (values: EmployeeFormValues) => {
    const trimmedValues = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      department: values.department.trim(),
      designation: values.designation.trim(),
      password: values.password?.trim(),
    }

    if (dialogState.mode === 'add' && !trimmedValues.password) {
      setError('password', { message: 'Password is required' })
      return
    }

    const payload: EmployeePayload = {
      fullName: trimmedValues.fullName,
      email: trimmedValues.email,
      department: trimmedValues.department,
      designation: trimmedValues.designation,
    }

    if (trimmedValues.password) {
      payload.password = trimmedValues.password
    }

    if (dialogState.mode === 'add') {
      await createMutation.mutateAsync(payload)
    }

    if (dialogState.mode === 'edit') {
      await updateMutation.mutateAsync({
        id: dialogState.employee.id,
        payload,
      })
    }
  }

  const handleSortModelChange = (model: GridSortModel) => {
    const nextSort = model[0]

    if (!nextSort) {
      return
    }

    setSortBy(nextSort.field as SortField)
    setSortOrder(nextSort.sort ?? 'asc')
    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  const handleSortByChange = (value: SortField) => {
    setSortBy(value)
    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography color="text.primary" variant="h4">
            Employees
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body1">
            Manage employee records, assignments, and access.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <TextField
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            value={search}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="employee-sort-label">Sort</InputLabel>
            <Select
              label="Sort"
              labelId="employee-sort-label"
              onChange={(event) => handleSortByChange(event.target.value as SortField)}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}>
            <IconButton
              aria-label="Toggle sort order"
              onClick={() =>
                setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
              }
            >
              <SortRoundedIcon
                sx={{
                  transform:
                    sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton aria-label="Refresh employees" onClick={() => void refetch()}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
          <Button
            onClick={openAddDialog}
            startIcon={<AddRoundedIcon />}
            variant="contained"
          >
            Add Employee
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <EmployeesSkeleton />
        ) : (
          <DataGrid
            columns={columns}
            disableRowSelectionOnClick
            loading={isFetching}
            onPaginationModelChange={setPaginationModel}
            onSortModelChange={handleSortModelChange}
            pageSizeOptions={[5, 10, 25]}
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={rowCount}
            rows={employees}
            slots={{ noRowsOverlay: EmployeeEmptyOverlay }}
            sortModel={sortModel}
            sortingMode="server"
            sx={{
              border: 0,
              minHeight: 520,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'background.default',
              },
            }}
          />
        )}
      </Paper>

      <Dialog fullWidth maxWidth="sm" onClose={handleDialogClose} open={isDialogOpen}>
        <Box component="form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogTitle>
            {dialogState.mode === 'edit' ? 'Edit Employee' : 'Add Employee'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                error={Boolean(errors.fullName)}
                fullWidth
                helperText={errors.fullName?.message}
                label="Name"
                {...register('fullName')}
              />
              <TextField
                error={Boolean(errors.email)}
                fullWidth
                helperText={errors.email?.message}
                label="Email"
                type="email"
                {...register('email')}
              />
              <TextField
                error={Boolean(errors.department)}
                fullWidth
                helperText={errors.department?.message}
                label="Department"
                {...register('department')}
              />
              <TextField
                error={Boolean(errors.designation)}
                fullWidth
                helperText={errors.designation?.message}
                label="Designation"
                {...register('designation')}
              />
              <TextField
                error={Boolean(errors.password)}
                fullWidth
                helperText={
                  errors.password?.message ??
                  (dialogState.mode === 'edit'
                    ? 'Leave blank to keep current password'
                    : undefined)
                }
                label="Password"
                type="password"
                {...register('password')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmitting} onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {dialogState.mode === 'edit' ? 'Update Employee' : 'Create Employee'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        loading={deleteMutation.isPending}
        message={`Are you sure you want to delete ${
          deleteTarget?.fullName ?? 'this employee'
        }?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        open={Boolean(deleteTarget)}
        title="Delete Employee"
      />
    </Box>
  )
}

export default Employees
