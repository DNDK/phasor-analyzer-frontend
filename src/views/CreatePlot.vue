<script setup lang="ts">
console.log('aaa')
// import { ref, watch, computed } from 'vue'

// import {
//   Label,
//   NumberFieldDecrement,
//   NumberFieldIncrement,
//   NumberFieldInput,
//   NumberFieldRoot,
// } from 'reka-ui'

// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

// import { Line } from 'vue-chartjs'
// import {
//   Chart as ChartJS,
//   Title,
//   Legend,
//   LineController,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
// } from 'chart.js'

// import type { TDataSet, TPointSet } from './types'
import PlotForm from '@/components/forms/PlotForm/PlotForm.vue'

// const a1 = ref<number>(0.1)
// const tau1 = ref<number>(1)
// const tau2 = ref<number>(3)
// const dt = ref<number>(0.05)
// const num_points = ref<number>(512)
// const apply_convolution = ref<boolean>(true)
// const add_noise = ref<boolean>(true)

// const dataSets = ref<TDataSet[]>([])

// const handleSubmit = async (event: any) => {
//   const resp: { plots: TDataSet } = await fetch('/api/tasks/create', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       a1: a1.value,
//       tau1: tau1.value,
//       tau2: tau2.value,
//       dt: dt.value,
//       num_points: num_points.value,
//       apply_convolution: apply_convolution.value,
//       add_noise: add_noise.value,
//     }),
//   }).then((res) => res.json())

//   dataSets.value?.push(resp.plots)
//   console.log(dataSets.value)
// }

// watch(
//   dataSets,
//   (_) => {
//     console.log('aaaa')
//   },
//   { deep: true },
// )

// ChartJS.register(
//   LineController,
//   Title,
//   Legend,
//   CategoryScale, // Добавляем шкалу категорий для оси X
//   LinearScale, // Добавляем линейную шкалу для оси Y
//   PointElement, // Для отображения точек
//   LineElement, // Для отображения линий
// )

// const chartData = computed(() => {
//   if (!dataSets.value.length) return null
//   const pointSet = dataSets.value[0].noisy

//   // 2. Добавляем проверку наличия данных
//   if (!pointSet || !pointSet.x || !pointSet.y) return null

//   // 3. Формируем данные с labels и datasets
//   return {
//     labels: pointSet.x.map((x) => x.toString()), // Преобразуем в строки для категорий
//     datasets: [
//       {
//         label: 'Original Data',
//         data: pointSet.y, // Используем только y, так как x станет labels
//         borderColor: '#f59e0b',
//         tension: 0.1,
//       },
//     ],
//   }
// })
</script>

<template>
  <PlotForm />
  <!-- <div class="w-full mx-auto flex items-center gap-8">
    <div v-if="!chartData" class="flex w-full h-150 rounded-md border border-black">
      No data available
    </div>
    <div v-else class="flex w-full">
      <Line :data="chartData" :options="{ responsive: true }" />
    </div>
    <form class="w-1/2 text-sm" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <Label for="a1">a1</Label>
          <NumberFieldRoot
            id="a1"
            class="flex gap-2"
            :min="0.1"
            :max="0.9"
            :step="0.1"
            v-model="a1"
          >
            <NumberFieldDecrement
              class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
            >
              <ChevronDownIcon class="size-4" />
            </NumberFieldDecrement>
            <NumberFieldInput class="rounded-md border-gray-600 border px-3 text-center" />
            <NumberFieldIncrement
              class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
            >
              <ChevronUpIcon class="size-4" />
            </NumberFieldIncrement>
          </NumberFieldRoot>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="tau1">tau1</Label>
          <NumberFieldRoot id="a1" class="flex gap-2" :min="0.1" :step="0.1" v-model="tau1">
            <NumberFieldDecrement
              class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
            >
              <ChevronDownIcon class="size-4" />
            </NumberFieldDecrement>
            <NumberFieldInput class="rounded-md border-gray-600 border px-3 text-center" />
            <NumberFieldIncrement
              class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
            >
              <ChevronUpIcon class="size-4" />
            </NumberFieldIncrement>
          </NumberFieldRoot>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="tau2">tau2</Label>
          <input name="tau2" class="rounded-md border-gray-600 border px-3" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="dt">dt</Label>
          <input name="dt" class="rounded-md border-gray-600 border px-3" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="num_points">Кол-во точек</Label>
          <input name="num_points" class="rounded-md border-gray-600 border px-3" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="apply_convolution">Добавить свертку</Label>
          <input name="a1" class="rounded-md border-gray-600 border px-3" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="add_noise">Добавить шум</Label>
          <input name="add_noise" class="rounded-md border-gray-600 border px-3" />
        </div>
      </div>

      <button
        type="submit"
        class="bg-amber-300 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200 mt-8 py-2 px-4 font-bold"
      >
        Сгенерировать
      </button>
    </form>
  </div> -->
</template>
