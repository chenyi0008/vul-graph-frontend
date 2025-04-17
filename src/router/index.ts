import { createRouter, createWebHistory } from 'vue-router'
import LoginCard from '../components/LoginCard.vue'
import RegisterCard from '../components/RegisterCard.vue'
import SystemView from '../views/SystemView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginCard,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterCard,
      meta: { requiresAuth: false }
    },
    {
      path: '/system',
      name: 'system',
      component: SystemView,
      meta: { requiresAuth: true }
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 从 localStorage 获取 token
  const token = localStorage.getItem('token')

  // 如果路由需要认证且没有token，重定向到登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } 
  // 如果已经登录且访问登录或注册页，重定向到系统页
  else if (token && (to.path === '/login' || to.path === '/register')) {
    next('/system')
  } 
  // 其他情况正常放行
  else {
    next()
  }
})

export default router
