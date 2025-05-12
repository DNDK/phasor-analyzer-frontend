<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { useApi } from '@/composables/useApi'
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import CurveCard from '@/components/primitives/CurveCard.vue'

import { getTask } from '@/api/getTask'

import type { Task } from '@/types/task'

const route = useRoute()

const response = ref<Awaited<ReturnType<typeof getTask>> | null>(null)

onBeforeMount(async () => {
  response.value = await getTask(route.params.id)
})

// const { isFetching, error, data } = useFetch(`/api/tasks/${route.params.id}`).get()
// const jsonData = computed(() => {
// if (!data.value) return
//   return JSON.parse(data.value as string)
// })

const handleGenerateSet = async () => {
  console.log('gen')
}

const isCurveSetExpanded = ref(false)
</script>

<template>
  <div class="w-full flex justify-center flex-col gap-5" v-if="!!response">
    <div v-if="response.isFetching">
      <h1>Loading</h1>
    </div>
    <template v-else-if="!!response.data">
      <h1 class="font-semibold text-3xl leading-9">Задача {{ response.data.title }}</h1>
      <div
        class="flex flex-col rounded-xl shadow-sm shadow-gray-300 w-full min-h-[60dvh] p-10 bg-white"
      >
        <Collapsible v-model:open="isCurveSetExpanded" v-if="!!response.data.curve_set">
          <CollapsibleTrigger
            >Набор "{{ response.data.curve_set?.description }}"</CollapsibleTrigger
          >
          <CollapsibleContent>
            <div class="flex flex-col w-36 gap-2">
              <div v-for="curve in response.data.curve_set?.curves">
                <CurveCard v-bind="curve" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div v-else>
          <div class="flex flex-col gap-3 w-full items-center justify-center h-full">
            У этой задачи нет набора кривых :(
            <Button @click="handleGenerateSet">Сгенерировать</Button>
          </div>
        </div>
        <div v-if="response.data.analysis_results">Results</div>
        <div class="text-gray-600 p-5 flex flex-col w-full gap-5 items-center">
          Анализ ещё не проведён :(
          <Button>Запустить анализ</Button>
        </div>
      </div>

      <div class="flex w-full justify-end text-sm text-gray-600">Date</div>
    </template>
    <div></div>
  </div>
</template>
