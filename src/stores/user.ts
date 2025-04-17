import { defineStore } from 'pinia'
import { login, register } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: localStorage.getItem('username') || ''
  }),
  
  actions: {
    async login(username: string, password: string) {
      const resp = await login(username, password)
      if (resp.code === 1) {
        const token = resp.data
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
        this.username = username
      }
      return resp
    },
    
    async register(username: string, password: string) {
      return register(username, password)
    },
    
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.username = ''
    }
  }
}) 