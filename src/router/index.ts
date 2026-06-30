import { createRouter, createWebHistory } from 'vue-router'
import SessionView from '../views/SessionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: SessionView },
    {
      path: '/play',
      component: () => import('../views/PlayView.vue'),
    },
  ],
})

export default router
