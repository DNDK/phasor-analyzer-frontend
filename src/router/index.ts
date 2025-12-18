import { createRouter, createWebHistory } from 'vue-router'
import CreatePlot from '@/views/CreatePlot.vue'
import DefaultView from '@/views/DefaultView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TaskView from '@/views/TaskView.vue'
import CreateTask from '@/views/CreateTask.vue'
import TasksHistory from '@/views/TasksHistory.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'default-layout',
      component: DefaultView,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/tasks/:id',
      name: 'task-view',
      component: TaskView,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/tasks',
      name: 'tasks-history',
      component: TasksHistory,
      meta: { layout: DefaultLayout },
    },
    {
      path: '/create-task',
      name: 'create-task-view',
      component: CreateTask,
      meta: {layout: DefaultLayout}
    }
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
