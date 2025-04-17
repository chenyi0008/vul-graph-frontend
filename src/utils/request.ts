import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 不需要token的白名单路径
const whiteList = ['/user/login', '/user/register']

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 如果请求路径在白名单中，不添加token
    if (whiteList.includes(config.url || '')) {
      return config
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No token found for request:', config.url)
      return Promise.reject(new Error('未登录'))
    }
    
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request 