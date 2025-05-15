<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ref, onBeforeMount } from 'vue'

import { getAllTasks } from '@/api/tasks'

const router = useRouter()

onBeforeMount(async () => {
  response.value = await getAllTasks()
})

const response = ref<Awaited<ReturnType<typeof getAllTasks>> | null>(null)

const handleCreateTask = async () => {
  try {
    const response = await fetch('/api/tasks/create', {
      method: 'POST',
    }).then((res) => res.json())
    router.push({
      name: 'task-view',
      params: {
        id: response.id,
      },
    })
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="w-2/3 mx-auto">
    <h1 class="text-4xl font-semibold mb-16">Задачи</h1>
    <div class="w-full grid grid-cols-3" v-if="!!response && !!response.data?.length">
      <div v-for="task in response.data">
        <RouterLink :to="`/tasks/${task.id}`">
          <div
            class="size-32 p-5 border border-gray-500 shadow-sm shadow-gray-300 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            {{ task.title }}
          </div>
        </RouterLink>
      </div>
      <div
        class="size-32 border-dashed border-gray-500 border p-5 text-gray-500 cursor-pointer hover:border-black hover:text-black"
        @click="handleCreateTask"
      >
        Создать задачу
      </div>
    </div>
    <!-- <div class="w-full flex justify-center">
      <Button variant="default" @click="handleCreateTask"> Создать задачу </Button>
    </div> -->
  </div>
</template>
