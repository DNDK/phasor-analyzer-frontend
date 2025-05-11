<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()

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
  <div class="w-full flex justify-center">
    <Button variant="default" @click="handleCreateTask"> Создать задачу </Button>
  </div>
</template>
