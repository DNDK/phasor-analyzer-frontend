import { ref } from 'vue'
import type { Ref } from 'vue'

export async function getTask(task_id: number): Promise<Ref> {
  const a = 'a'
  try {
    const data = ref()

    return data
  } catch {
    return ref()
  }
}
