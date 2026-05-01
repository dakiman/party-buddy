import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/discover',
      component: () => import('@/views/Discover.vue')
    },
    {
      path: '/create',
      component: () => import('@/views/CreateEvent.vue')
    },
    {
      path: '/events/:id',
      component: () => import('@/views/EventView.vue')
    },
    {
      path: '/events/:id/edit',
      component: () => import('@/views/EditEvent.vue')
    },
    {
      path: '/shared/:token',
      component: () => import('@/views/SharedEvent.vue')
    }
  ]
})

export default router
