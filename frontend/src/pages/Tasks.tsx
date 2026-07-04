import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
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
import type { GridColDef } from '@mui/x-data-grid'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { employeeApi } from '../api/employeeApi'
import { taskApi } from '../api/taskApi'
import type { Task, TaskPayload, TaskPriority, TaskStatus } from '../api/taskApi'
import { useAppSelector } from '../app/hooks'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDate, labelize, toApiDate } from '../utils/format'

type TaskDialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; task: Task }

const statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']

const dayjsDateSchema = z.custom<Dayjs>(
  (value) => dayjs.isDayjs(value) && value.isValid(),
  'Date is required',
)

const taskFormSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    startDate: dayjsDateSchema,
    dueDate: dayjsDateSchema,
    assignedToId: z.string().min(1, 'Assigned employee is required'),
  })
  .refine((values) => !values.dueDate.isBefore(values.startDate, 'day'), {
    message: 'Due date must be greater than or equal to start date',
    path: ['dueDate'],
  })

type TaskFormValues = z.infer<typeof taskFormSchema>

const defaultTaskValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  startDate: dayjs(),
  dueDate: dayjs().add(1, 'day'),
  assignedToId: '',
}

const getStatusColor = (status: TaskStatus) => {
  if (status === 'COMPLETED') {
    return 'success'
  }

  if (status === 'IN_PROGRESS') {
    return 'primary'
  }

  return 'warning'
}

const getPriorityColor = (priority: TaskPriority) => {
  if (priority === 'HIGH') {
    return 'error'
  }

  if (priority === 'MEDIUM') {
    return 'warning'
  }

  return 'info'
}

function TasksEmptyOverlay() {
  return (
    <EmptyState
      description="Create a task or check back after tasks are assigned."
      icon={<AssignmentRoundedIcon sx={{ fontSize: 48 }} />}
      title="No tasks found"
    />
  )
}

function TasksSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton height={42} key={index} variant="rounded" />
      ))}
    </Stack>
  )
}

function Tasks() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTaskId = searchParams.get('taskId')
  const [dialogState, setDialogState] = useState<TaskDialogState>({
    mode: 'closed',
  })
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [uploadTarget, setUploadTarget] = useState<Task | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormValues>({
    defaultValues: defaultTaskValues,
    resolver: zodResolver(taskFormSchema),
  })

  const {
    data: taskResponse,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: taskApi.getTasks,
    queryKey: ['tasks'],
  })

  const { data: employeeResponse } = useQuery({
    enabled: isAdmin,
    queryFn: () =>
      employeeApi.getEmployees({
        page: 1,
        limit: 100,
        sortBy: 'fullName',
        sortOrder: 'asc',
      }),
    queryKey: ['employees', 'task-form'],
  })

  const tasks = useMemo(() => taskResponse?.data ?? [], [taskResponse?.data])
  const employees = employeeResponse?.data ?? []

  const clearSelectedTaskParam = useCallback(() => {
    if (!selectedTaskId) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('taskId')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, selectedTaskId, setSearchParams])

  const createMutation = useMutation({
    mutationFn: taskApi.createTask,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create task'))
    },
    onSuccess: async () => {
      toast.success('Task Created')
      setDialogState({ mode: 'closed' })
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<TaskPayload>
    }) => taskApi.updateTask(id, payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update task'))
    },
    onSuccess: async () => {
      toast.success('Task Updated')
      clearSelectedTaskParam()
      setDialogState({ mode: 'closed' })
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete task'))
    },
    onSuccess: async () => {
      toast.success('Deleted Successfully')
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      taskApi.uploadAttachment(id, file),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to upload attachment'))
    },
    onSuccess: async () => {
      toast.success('Attachment Uploaded')
      setAttachmentFile(null)
      setUploadTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const openCreateDialog = () => {
    reset({
      ...defaultTaskValues,
      assignedToId: employees[0]?.id ?? '',
      startDate: dayjs(),
      dueDate: dayjs().add(1, 'day'),
    })
    setDialogState({ mode: 'create' })
  }

  const openEditDialog = useCallback((task: Task) => {
    reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      startDate: dayjs(task.startDate),
      dueDate: dayjs(task.dueDate),
      assignedToId: task.assignedToId,
    })
    setDialogState({ mode: 'edit', task })
  }, [reset])

  const closeTaskDialog = () => {
    clearSelectedTaskParam()
    setDialogState({ mode: 'closed' })
  }

  useEffect(() => {
    if (!selectedTaskId || isLoading || dialogState.mode !== 'closed') {
      return
    }

    const selectedTask = tasks.find((task) => task.id === selectedTaskId)

    if (!selectedTask) {
      if (taskResponse) {
        toast.error('Task not found')
        clearSelectedTaskParam()
      }
      return
    }

    openEditDialog(selectedTask)
  }, [
    clearSelectedTaskParam,
    dialogState.mode,
    isLoading,
    openEditDialog,
    selectedTaskId,
    taskResponse,
    tasks,
  ])

  const handleTaskSubmit = async (values: TaskFormValues) => {
    if (!isAdmin && dialogState.mode === 'edit') {
      await updateMutation.mutateAsync({
        id: dialogState.task.id,
        payload: { status: values.status },
      })
      return
    }

    const payload: TaskPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      startDate: toApiDate(values.startDate),
      dueDate: toApiDate(values.dueDate),
      assignedToId: values.assignedToId,
    }

    if (dialogState.mode === 'create') {
      await createMutation.mutateAsync(payload)
    }

    if (dialogState.mode === 'edit') {
      await updateMutation.mutateAsync({
        id: dialogState.task.id,
        payload,
      })
    }
  }

  const columns: GridColDef<Task>[] = [
      {
        field: 'title',
        flex: 1,
        headerName: 'Title',
        minWidth: 220,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        minWidth: 130,
        renderCell: ({ row }) => (
          <Chip
            color={getPriorityColor(row.priority)}
            label={labelize(row.priority)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 150,
        renderCell: ({ row }) => (
          <Chip
            color={getStatusColor(row.status)}
            label={labelize(row.status)}
            size="small"
          />
        ),
      },
      {
        field: 'assignedEmployee',
        flex: 1,
        headerName: 'Assigned Employee',
        minWidth: 190,
        valueGetter: (_value, row) => row.assignedTo?.fullName ?? '-',
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        minWidth: 140,
        valueGetter: (_value, row) => formatDate(row.startDate),
      },
      {
        field: 'dueDate',
        headerName: 'Due Date',
        minWidth: 140,
        valueGetter: (_value, row) => formatDate(row.dueDate),
      },
      {
        field: 'actions',
        filterable: false,
        headerName: 'Actions',
        minWidth: isAdmin ? 152 : 104,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isAdmin ? 'Edit task' : 'Update status'}>
              <IconButton
                aria-label={`Edit ${row.title}`}
                onClick={() => openEditDialog(row)}
                size="small"
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload attachment">
              <IconButton
                aria-label={`Upload attachment for ${row.title}`}
                onClick={() => {
                  setAttachmentFile(null)
                  setUploadTarget(row)
                }}
                size="small"
              >
                <UploadFileRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {isAdmin ? (
              <Tooltip title="Delete task">
                <IconButton
                  aria-label={`Delete ${row.title}`}
                  color="error"
                  onClick={() => setDeleteTarget(row)}
                  size="small"
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ),
      },
  ]

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography color="text.primary" variant="h4">
            Tasks
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body1">
            Track assignments, dates, priorities, and progress.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh">
            <IconButton aria-label="Refresh tasks" onClick={() => void refetch()}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
          {isAdmin ? (
            <Button
              onClick={openCreateDialog}
              startIcon={<AddRoundedIcon />}
              variant="contained"
            >
              Create Task
            </Button>
          ) : null}
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
          <TasksSkeleton />
        ) : (
          <DataGrid
            columns={columns}
            disableRowSelectionOnClick
            loading={isFetching}
            pageSizeOptions={[10, 25, 50]}
            rows={tasks}
            slots={{ noRowsOverlay: TasksEmptyOverlay }}
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

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={closeTaskDialog}
        open={dialogState.mode !== 'closed'}
      >
        <Box component="form" noValidate onSubmit={handleSubmit(handleTaskSubmit)}>
          <DialogTitle>
            {dialogState.mode === 'create'
              ? 'Create Task'
              : isAdmin
              ? 'Edit Task'
              : 'Update Task Status'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {isAdmin ? (
                <>
                  <TextField
                    error={Boolean(errors.title)}
                    fullWidth
                    helperText={errors.title?.message}
                    label="Title"
                    {...register('title')}
                  />
                  <TextField
                    error={Boolean(errors.description)}
                    fullWidth
                    helperText={errors.description?.message}
                    label="Description"
                    minRows={3}
                    multiline
                    {...register('description')}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.priority)}>
                          <InputLabel id="priority-label">Priority</InputLabel>
                          <Select
                            label="Priority"
                            labelId="priority-label"
                            {...field}
                          >
                            {priorities.map((priority) => (
                              <MenuItem key={priority} value={priority}>
                                {labelize(priority)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.priority ? (
                            <FormHelperText>
                              {errors.priority.message}
                            </FormHelperText>
                          ) : null}
                        </FormControl>
                      )}
                    />
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.status)}>
                          <InputLabel id="status-label">Status</InputLabel>
                          <Select label="Status" labelId="status-label" {...field}>
                            {statuses.map((status) => (
                              <MenuItem key={status} value={status}>
                                {labelize(status)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.status ? (
                            <FormHelperText>{errors.status.message}</FormHelperText>
                          ) : null}
                        </FormControl>
                      )}
                    />
                  </Stack>
                  <Controller
                    control={control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.assignedToId)}>
                        <InputLabel id="assigned-employee-label">
                          Assigned Employee
                        </InputLabel>
                        <Select
                          label="Assigned Employee"
                          labelId="assigned-employee-label"
                          {...field}
                        >
                          {employees.map((employee) => (
                            <MenuItem key={employee.id} value={employee.id}>
                              {employee.fullName}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.assignedToId ? (
                          <FormHelperText>
                            {errors.assignedToId.message}
                          </FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date"
                          onChange={(value) => field.onChange(value)}
                          slotProps={{
                            textField: {
                              error: Boolean(errors.startDate),
                              fullWidth: true,
                              helperText: errors.startDate?.message,
                            },
                          }}
                          value={field.value}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <DatePicker
                          label="Due Date"
                          onChange={(value) => field.onChange(value)}
                          slotProps={{
                            textField: {
                              error: Boolean(errors.dueDate),
                              fullWidth: true,
                              helperText: errors.dueDate?.message,
                            },
                          }}
                          value={field.value}
                        />
                      )}
                    />
                  </Stack>
                </>
              ) : (
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.status)}>
                      <InputLabel id="employee-status-label">Status</InputLabel>
                      <Select
                        label="Status"
                        labelId="employee-status-label"
                        {...field}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {labelize(status)}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status ? (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmitting} onClick={closeTaskDialog}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {dialogState.mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setUploadTarget(null)}
        open={Boolean(uploadTarget)}
      >
        <DialogTitle>Upload Attachment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary" variant="body2">
              {uploadTarget?.title}
            </Typography>
            <Button
              component="label"
              startIcon={<UploadFileRoundedIcon />}
              variant="outlined"
            >
              Choose File
              <input
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                hidden
                onChange={(event) =>
                  setAttachmentFile(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </Button>
            <Typography color="text.secondary" variant="body2">
              {attachmentFile?.name ?? 'No file selected'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => setUploadTarget(null)}
          >
            Cancel
          </Button>
          <Button
            disabled={!attachmentFile || uploadMutation.isPending}
            onClick={() => {
              if (uploadTarget && attachmentFile) {
                uploadMutation.mutate({
                  id: uploadTarget.id,
                  file: attachmentFile,
                })
              }
            }}
            startIcon={<UploadFileRoundedIcon />}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        loading={deleteMutation.isPending}
        message={`Are you sure you want to delete ${
          deleteTarget?.title ?? 'this task'
        }?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        open={Boolean(deleteTarget)}
        title="Delete Task"
      />
    </Box>
  )
}

export default Tasks
