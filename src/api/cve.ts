import request from '@/utils/request'
import type { BaseResponse } from './types'

export interface CveItem {
  cveId: string
  status: string
  description: string
  cvssScore: number
  referenceLink: string
  attackMethod: string
  vulnType: string
  affectedScope: string
  attackVector: string
  impact: string
  solution: string
  publishTime: string
}

export interface CveResponse extends BaseResponse<CveItem[]> {}
export interface CreateCveResponse extends BaseResponse<CveItem> {}
export interface UpdateCveResponse extends BaseResponse<CveItem> {}
export interface DeleteCveResponse extends BaseResponse<null> {}

export const getCveList = (): Promise<CveResponse> => {
  return request.get<CveResponse>('/cve')
}

export const getCveById = (cveId: string): Promise<CreateCveResponse> => {
  return request.get<BaseResponse<CveItem>>(`/cve/${cveId}`)
}

export const createCve = (cve: CveItem): Promise<CreateCveResponse> => {
  return request.post<CreateCveResponse>('/cve', cve)
}

export const updateCve = (cve: CveItem): Promise<UpdateCveResponse> => {
  return request.put<UpdateCveResponse>('/cve', cve)
}

export const deleteCve = (cveId: string): Promise<DeleteCveResponse> => {
  return request.delete<DeleteCveResponse>(`/cve/${cveId}`)
}

export const bindSoftware = (cveId: string, softwareId: string) => {
  return request.post<BaseResponse<null>>(`/cve/bind-software?cveId=${cveId}&softwareId=${softwareId}`)
} 