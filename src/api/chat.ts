import request from '@/utils/request'
import type { BaseResponse } from './types'

// 聊天消息接口
export interface ChatMessage {
  role: string
  content: string
}

// 聊天请求参数接口
export interface ChatRequest {
  question: string
  cveId: string
}

// 聊天响应接口
export interface ChatResponse extends BaseResponse<ChatMessage> {}

// 发送聊天消息
export const sendChatMessage = (params: ChatRequest): Promise<ChatResponse> => {
  return request.post<ChatResponse>('/chat', params,{
    timeout: 600000
  })
} 