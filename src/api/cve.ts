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
  softwareList: {
    id: string
    name: string
    vendor: string
    type: string
    affectedVersions: string[]
  }[]
  systemList: {
    id: string
    systemName: string
    level: string
    vendor: string
  }[]
  severity: number
}

export interface CveResponse extends BaseResponse<CveItem[]> {}
export interface CreateCveResponse extends BaseResponse<CveItem> {}
export interface UpdateCveResponse extends BaseResponse<CveItem> {}
export interface DeleteCveResponse extends BaseResponse<null> {}

export const getCveList = (params: { min: number, max: number }): Promise<CveResponse> => {
  console.log('请求参数类型检查:', params)
  return request.get<CveResponse>('/cve', 
    { params: { min: params.min, max: params.max } }
  )
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

export const bindSoftware = (cveId: string, softwareIdList: string[]) => {
  const searchParams = new URLSearchParams();
  searchParams.append('cveId', cveId);
  softwareIdList.forEach(id => searchParams.append('softwareId', id));
  
  return request.post<BaseResponse<null>>(`/cve/bind-software?${searchParams.toString()}`);
}

export const bindSystem = (cveId: string, systemIds: string[]) => {
  const searchParams = new URLSearchParams();
  searchParams.append('cveId', cveId);
  systemIds.forEach(id => searchParams.append('systemId', id));
  return request.post<BaseResponse<null>>(`/cve/bind-system?${searchParams.toString()}`)
}

// 绑定国家
export const bindCountry = (cveId: string, countryId: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append('cveId', cveId);
  searchParams.append('countryId', countryId);
  
  return request.post<BaseResponse<CveItem>>(`/cve/bind-country?${searchParams.toString()}`);
}

// 获取国家列表
export const getCountryList = () => {
  return request.get<BaseResponse<Country[]>>('/country')
}

// 国家接口
export interface Country {
  nameEn: string
  nameZh: string
}
