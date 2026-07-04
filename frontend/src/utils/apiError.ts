import axios from 'axios'

type ApiErrorBody = {
  message?: string
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong',
) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
