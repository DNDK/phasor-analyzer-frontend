<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'

import { Button } from '@/components/ui/button'

const route = useRoute()

const { isFetching, error, data } = useFetch(`/api/tasks/${route.params.id}`).get()
const jsonData = computed(() => {
  if (!data.value) return
  return JSON.parse(data.value as string)
})

const handleGenerateSet = async () => {
  console.log('gen')
}
</script>

<template>
  <div class="w-full flex justify-center flex-col gap-5">
    {{ jsonData }}
    <div v-if="isFetching">
      <h1>Loading</h1>
    </div>
    <template v-else-if="!!data">
      <h1 class="font-semibold text-3xl leading-9">Задача {{ jsonData.title }}</h1>
      <div class="flex rounded-xl shadow-sm shadow-gray-300 w-full min-h-[60dvh] p-10 bg-white">
        <div v-if="jsonData.curve_set">
          {{ jsonData.curve_set }}
        </div>
        <div class="flex flex-col gap-3 w-full items-center justify-center h-full">
          У этой задачи нет набора кривых :(
          <Button @click="handleGenerateSet">Сгенерировать</Button>
        </div>
      </div>
      <div class="flex w-full justify-end text-sm text-gray-600">{{ jsonData.created_at }}</div>
    </template>
    <div v-else>DIC</div>
  </div>
</template>
