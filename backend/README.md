# Employee Task Management Backend

## Task API

Routes are mounted under `/api/tasks` and require a valid JWT.

- `POST /api/tasks`: Admin only. Creates a task and assigns it to an employee.
- `GET /api/tasks`: Admins receive all tasks. Employees receive only tasks assigned to their user id.
- `GET /api/tasks/:id`: Admins can read any task. Employees can read only assigned tasks.
- `PUT /api/tasks/:id`: Admins can edit task fields. Employees can update only the `status` field on their assigned tasks.
- `DELETE /api/tasks/:id`: Admin only.
- `POST /api/tasks/:id/attachments`: Uploads one attachment using form-data field `file`. Supported files are PDF, JPG, and PNG up to 5MB.

Business rules enforced in the service layer:

- `dueDate` must be greater than or equal to `startDate`.
- Completed tasks cannot be edited and return `409 Conflict`.
- Employees cannot access tasks assigned to another employee.

## Dashboard API

- `GET /api/dashboard`: Admins receive total employee and task counts. Employees receive counts for their own tasks, completed tasks, pending tasks, and overdue tasks.

## Notification API

- `GET /api/notifications`: Returns notifications for the logged-in user.
- `PUT /api/notifications/:id/read`: Marks one logged-in user's notification as read.

Notifications are created automatically when a task is assigned, when a task is completed, and every day at 8:00 for tasks due tomorrow.

## Reports API

Reports are Admin only.

- `GET /api/reports?type=completed&format=csv`
- `GET /api/reports?type=pending&format=excel`
- `GET /api/reports?type=employee-wise&format=excel`
