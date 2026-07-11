import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      component: () => import('@/views/CreateEvent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id',
      component: () => import('@/views/EventView.vue')
    },
    {
      path: '/events/:id/edit',
      component: () => import('@/views/EditEvent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shared/:token',
      component: () => import('@/views/SharedEvent.vue')
    }
  ]
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return
  // Called lazily inside the guard so pinia is active by the time it runs.
  // isAuthenticated is token-derived (synchronous) — no need to await ready.
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return { path: '/' }
  }
})

export default router
