import request from '@/utils/request'
import type { BaseResponse } from './types'

export interface SoftwareItem {
  id: string
  name: string
  vendor: string
  type: string
  affectedVersions: string[]
}

export interface SoftwareResponse extends BaseResponse<SoftwareItem[]> {}
export interface CreateSoftwareResponse extends BaseResponse<SoftwareItem> {}
export interface UpdateSoftwareResponse extends BaseResponse<SoftwareItem> {}
export interface DeleteSoftwareResponse extends BaseResponse<null> {}

export const getSoftwareList = () => {
  return request.get<SoftwareResponse>('/software')
}

export const getSoftwareById = (id: string) => {
  return request.get<BaseResponse<SoftwareItem>>(`/software/${id}`)
}

export const createSoftware = (software: SoftwareItem) => {
  return request.post<CreateSoftwareResponse>('/software', software)
}

export const updateSoftware = (software: SoftwareItem) => {
  return request.put<UpdateSoftwareResponse>('/software', software)
}

export const deleteSoftware = (id: string) => {
  return request.delete<DeleteSoftwareResponse>(`/software/${id}`)
} 