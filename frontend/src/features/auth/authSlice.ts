import axios from 'axios'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login } from './authApi'
import {
  clearPersistedAuth,
  getPersistedAuth,
  persistAuth,
} from '../../utils/authStorage'
import type { AuthState, LoginCredentials, LoginResponse } from './authTypes'

type LoginError = {
  message: string
}

const persistedAuth = getPersistedAuth()

const initialState: AuthState = {
  user: persistedAuth?.user ?? null,
  token: persistedAuth?.token ?? null,
  isAuthenticated: Boolean(persistedAuth?.token),
  loading: false,
}

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: LoginError }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await login(credentials)
    persistAuth(
      {
        user: response.user,
        token: response.token,
      },
      Boolean(credentials.rememberMe),
    )
    return response
  } catch (error) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message
      : undefined

    return rejectWithValue({
      message: message ?? 'Unable to sign in. Please try again.',
    })
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      clearPersistedAuth()
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
