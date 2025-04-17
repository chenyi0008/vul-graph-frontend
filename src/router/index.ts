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
      component: LoginCard
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterCard
    },
    {
      path: '/system',
      name: 'system',
      component: SystemView
    },
   
  ],
})

export default router
