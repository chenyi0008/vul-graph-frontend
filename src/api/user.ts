import request from '@/utils/request'
import type { BaseResponse } from './types'

export interface LoginResponse extends BaseResponse<string> {}

export interface RegisterResponse extends BaseResponse<null> {}

export const login = (username: string, password: string) => {
  return request.post<LoginResponse>('/user/login', { username, password })
}

export const register = (username: string, password: string) => {
  return request.post<RegisterResponse>('/user/register', { username, password })
} 