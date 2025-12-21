import { useFetch } from '@vueuse/core'

import type { Task } from '@/types/task'

export async function getTask(task_id: number | string | string[]) {
  const { data, error, isFetching } = await useFetch<Task>(`/api/tasks/${task_id}`).json<Task>()
  return { data, error, isFetching }
}

export async function getAllTasks() {
  const { data, error, isFetching } = await useFetch<Task[]>(`/api/tasks/`).json<Task[]>()
  return { data, error, isFetching }
}

export async function createTask(title?: string) {
  const { data, error, isFetching } = await useFetch<Task>(`/api/tasks/create`)
    .post({
      title: title && title?.length ? title : undefined,
    })
    .json<Task>()
  return { data, error, isFetching }
}
