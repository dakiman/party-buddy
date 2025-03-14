import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/create',
      component: () => import('@/views/CreateEvent.vue')
    },
    {
      path: '/events/:id',
      component: () => import('@/views/EventView.vue')
    }
  ]
})

export default router