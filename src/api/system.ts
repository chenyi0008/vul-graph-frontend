import request from '@/utils/request'
import type { BaseResponse } from './types'

export interface SystemNode {
  id: string | null
  systemName: string
  level: string
  vendor: string
}

export interface SystemResponse extends BaseResponse<SystemNode[]> {}
export interface CreateSystemResponse extends BaseResponse<SystemNode> {}
export interface UpdateSystemResponse extends BaseResponse<SystemNode> {}
export interface DeleteSystemResponse extends BaseResponse<null> {}

export const getSystemList = () => {
  return request.get<SystemResponse>('/system')
}

export const createSystem = (system: SystemNode) => {
  return request.post<CreateSystemResponse>('/system', system)
}

export const updateSystem = (system: SystemNode) => {
  return request.put<UpdateSystemResponse>('/system', system)
}

export const deleteSystem = (id: string) => {
  return request.delete<DeleteSystemResponse>(`/system/${id}`)
} 