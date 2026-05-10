import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DefaultView from '@/views/DefaultView.vue'
import CreateTask from '@/views/CreateTask.vue'
import TaskView from '@/views/TaskView.vue'
import TasksHistory from '@/views/TasksHistory.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import CreatePlot from '@/views/CreatePlot.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public routes (no auth required) ──────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { public: true },
    },

    // ── Protected routes ───────────────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: DefaultView,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/curve-sets/:id',
      name: 'curve-set-view',
      component: TaskView,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/curve-sets',
      name: 'curve-sets-history',
      component: TasksHistory,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/create-task',
      name: 'create-task-view',
      component: CreateTask,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/plot',
      name: 'create-plot',
      component: CreatePlot,
      meta: { layout: DefaultLayout },
    },

    // ── Legacy redirect ────────────────────────────────────────────────────
    { path: '/tasks', redirect: '/curve-sets' },
    { path: '/tasks/:id', redirect: (to) => `/curve-sets/${to.params.id}` },
  ],
})

// Navigation guard: redirect unauthenticated users to /login
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  // Redirect already-authenticated users away from login/register
  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
