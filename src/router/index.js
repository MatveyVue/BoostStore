import { createRouter, createWebHistory } from 'vue-router'
import main from '../views/main.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('../views/main.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/history.vue'),
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('../views/add.vue'),
    },
    {
      path: '/withdrawal',
      name: 'withdrawal',
      component: () => import('../views/withdrawal.vue'),
    }
  ],
})

export default router