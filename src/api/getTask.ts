import { ref, computed } from 'vue'
import { useFetch } from '@vueuse/core'

import type { Ref } from 'vue'
import type { Task } from '@/types/task'

export async function getTask(task_id: number | string | string[]) {
  const { data, error, isFetching } = await useFetch<Task>(`/api/tasks/${task_id}`).json<Task>()
  return { data, error, isFetching }
}
