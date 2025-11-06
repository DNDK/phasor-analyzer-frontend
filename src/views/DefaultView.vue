<script setup lang="ts">
// import { Button } from '@/components/ui/button'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ref, onBeforeMount, computed } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

import { getAllTasks } from '@/api/tasks'

import type { Task } from '@/types/task'

import StatusGauge from '@/components/primitives/StatusGauge.vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
// import type { AnalysisResult } from '@/types/analysis_result'
// import type { CurveSet } from '@/types/curveSet'

// const router = useRouter()

// onBeforeMount(async () => {
//   response.value = await getAllTasks()
// })

// const response = ref<Awaited<ReturnType<typeof getAllTasks>> | null>(null)

const mockTasksWithResults: Task[] = [
  {
    id: 1,
    title: 'Baseline scan',
    created_at: '2025-11-06T08:15:00.000Z',
    processing_time: 127,
    // curve_set: {
    //   id: 3001,
    //   task_id: 1,
    //   description: 'Baseline curves (reference)',
    //   curves: [
    //     {
    //       id: 'c1',
    //       time_axis: [0, 1, 2, 3, 4, 5],
    //       raw: [0.01, 0.05, 0.11, 0.18, 0.26, 0.31],
    //       raw_scaled: [0.01, 0.05, 0.11, 0.18, 0.26, 0.31],
    //     },
    //     {
    //       id: 'c2',
    //       time_axis: [0, 1, 2, 3, 4, 5],
    //       raw: [0.0, 0.04, 0.09, 0.15, 0.22, 0.28],
    //       convolved: [0.0, 0.03, 0.08, 0.13, 0.19, 0.24],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7001,
      curve_set_id: 3001,
      dw_real: [0.12, 0.18, 0.26, 0.31],
      dw_imag: [-0.05, -0.09, -0.13, -0.16],
      coeff_v: 1.23,
      coeff_u: 0.87,
      tau1: 2.6,
      tau2: 11.4,
      a1_coeffs: [0.62, -0.14, 0.03],
      a2_coeffs: [0.48, 0.07, -0.01],
      omega: 6.283185307179586, // 2π*1
    },
  },
  {
    id: 2,
    title: 'Kinetics – sample A',
    created_at: '2025-11-06T08:45:12.000Z',
    processing_time: 312,
    // curve_set: {
    //   id: 3001, // тот же сет, что использовали в анализе
    //   task_id: 2,
    //   description: 'Kinetics curves (sample A)',
    //   curves: [
    //     {
    //       id: 'k1',
    //       time_axis: [0, 10, 20, 30, 40, 50, 60],
    //       noisy: [0.0, 0.07, 0.15, 0.22, 0.27, 0.31, 0.32],
    //       raw: [0.0, 0.06, 0.14, 0.21, 0.26, 0.3, 0.32],
    //     },
    //     {
    //       id: 'k2',
    //       time_axis: [0, 10, 20, 30, 40, 50, 60],
    //       raw_scaled: [0.01, 0.05, 0.1, 0.16, 0.21, 0.25, 0.28],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7002,
      curve_set_id: 3001,
      dw_real: [0.1, 0.15, 0.21, 0.27, 0.32],
      dw_imag: [-0.04, -0.08, -0.11, -0.15, -0.17],
      coeff_v: 1.11,
      coeff_u: 0.95,
      tau1: 3.1,
      tau2: 10.2,
      a1_coeffs: [0.55, -0.1, 0.02],
      a2_coeffs: [0.52, 0.05, -0.02],
      omega: 3.141592653589793, // π
    },
  },
  {
    id: 3,
    title: 'Selected wavelengths',
    created_at: '2025-11-06T09:02:30.000Z',
    processing_time: 165,
    // curve_set: {
    //   id: 3002,
    //   task_id: 3,
    //   description: 'Discrete wavelengths set',
    //   curves: [
    //     {
    //       id: 'λ450',
    //       time_axis: [0, 1, 2, 3],
    //       raw: [0.02, 0.08, 0.15, 0.22],
    //     },
    //     {
    //       id: 'λ520',
    //       time_axis: [0, 1, 2, 3],
    //       raw: [0.01, 0.07, 0.13, 0.19],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7003,
      curve_set_id: 3002,
      dw_real: [0.05, 0.09, 0.16, 0.22],
      dw_imag: [-0.02, -0.05, -0.09, -0.12],
      coeff_v: 1.34,
      coeff_u: 0.81,
      tau1: 1.9,
      tau2: 8.7,
      a1_coeffs: [0.6, -0.12, 0.01],
      a2_coeffs: [0.44, 0.09, -0.01],
      omega: 12.566370614359172, // 2π*2
    },
  },
  {
    id: 4,
    title: 'Reference – dark current',
    created_at: '2025-11-06T09:20:00.000Z',
    processing_time: 74,
    // curve_set: {
    //   id: 3003,
    //   task_id: 4,
    //   description: 'Dark current reference curves',
    //   curves: [
    //     {
    //       id: 'd1',
    //       time_axis: [0, 1, 2, 3, 4, 5],
    //       raw: [0.0, 0.01, 0.01, 0.02, 0.02, 0.03],
    //       convolved: [0.0, 0.01, 0.01, 0.02, 0.02, 0.02],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7004,
      curve_set_id: 3003,
      dw_real: [0.14, 0.21, 0.29, 0.35, 0.39, 0.42],
      dw_imag: [-0.06, -0.1, -0.14, -0.17, -0.19, -0.2],
      coeff_v: 1.05,
      coeff_u: 1.02,
      tau1: 4.2,
      tau2: 14.8,
      a1_coeffs: [0.7, -0.15, 0.04],
      a2_coeffs: [0.39, 0.11, -0.02],
      omega: 5.026548245743669, // 2π*0.8
    },
  },
  {
    id: 5,
    title: 'Spectrum – sample B',
    created_at: '2025-11-06T09:48:44.000Z',
    processing_time: 198,
    // curve_set: {
    //   id: 3004,
    //   task_id: 5,
    //   description: 'Full spectrum sweep (sample B)',
    //   curves: [
    //     {
    //       id: 111,
    //       time_axis: [400, 500, 600, 700],
    //       raw: [0.05, 0.18, 0.27, 0.3],
    //     },
    //     {
    //       id: 2222,
    //       time_axis: [400, 500, 600, 700],
    //       raw_scaled: [0.95, 0.82, 0.73, 0.7],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7005,
      curve_set_id: 3004,
      dw_real: [0.08, 0.13, 0.2, 0.26, 0.3],
      dw_imag: [-0.03, -0.07, -0.1, -0.13, -0.15],
      coeff_v: 1.18,
      coeff_u: 0.9,
      tau1: 2.2,
      tau2: 9.9,
      a1_coeffs: [0.58, -0.11, 0.02],
      a2_coeffs: [0.47, 0.06, -0.01],
      omega: 9.42477796076938, // 2π*1.5
    },
  },
  {
    id: 6,
    title: 'Calibration – 5 points',
    created_at: '2025-11-06T10:05:10.000Z',
    processing_time: 94,
    // curve_set: {
    //   id: 3005,
    //   task_id: 6,
    //   description: 'Five-point calibration series',
    //   curves: [
    //     {
    //       id: 'calA',
    //       time_axis: [0, 1, 2, 3],
    //       raw: [0.02, 0.08, 0.18, 0.3],
    //     },
    //     {
    //       id: 'calB',
    //       time_axis: [0, 1, 2, 3],
    //       raw: [0.01, 0.07, 0.16, 0.28],
    //     },
    //   ],
    // },
    analysis_results: {
      id: 7006,
      curve_set_id: 3005,
      dw_real: [0.11, 0.17, 0.24, 0.3],
      dw_imag: [-0.05, -0.09, -0.12, -0.16],
      coeff_v: 1.2,
      coeff_u: 0.92,
      tau1: 2.8,
      tau2: 12.1,
      a1_coeffs: [0.63, -0.13, 0.03],
      a2_coeffs: [0.46, 0.08, -0.02],
      omega: 7.539822368615503, // 2π*1.2
    },
  },
]

// const handleCreateTask = async () => {
//   try {
//     const response = await fetch('/api/tasks/create', {
//       method: 'POST',
//     }).then((res) => res.json())
//     router.push({
//       name: 'task-view',
//       params: {
//         id: response.id,
//       },
//     })
//   } catch (err) {
//     console.error(err)
//   }
// }

const greeting = computed(() => {
  const currentDate = new Date()

  if (currentDate.getHours() < 12) {
    return 'Доброе утро!'
  } else if (currentDate.getHours() < 18) {
    return 'Добрый день'
  } else {
    return 'Добрый вечер'
  }
})
</script>

<template>
  <div class="size-full grid grid-cols-3 gap-10 px-40">
    <div
      class="col-span-2 block-gradient p-8 space-y-20 relative rounded-lg border-yellow-400/20 border overflow-hidden"
    >
      <div class="absolute top-0 -right-30 h-100 -rotate-15 opacity-20">
        <img src="/Fluorescein.svg" class="object-fit size-full" />
      </div>
      <h2 class="text-4xl font-bold">{{ greeting }}</h2>
      <div class="space-y-10">
        <div class="text-2xl">С чего начнём?</div>
        <div class="grid grid-cols-3 gap-5">
          <RouterLink to="https://google.com" class="group">
            <div
              class="relative h-40 backdrop-blur-2xl w-full bg-white/60 rounded-lg p-4 flex flex-col gap-5 group-hover:bg-white"
            >
              <h3>Создать новую задачу</h3>
              <p class="text-black/40">Загрузите данные, запустите анализ и получите результат!</p>
              <div class="text-gray-400 relative">
                <ArrowRightIcon
                  class="size-6 absolute group-hover:right-0 right-1/4 duration-200 opacity-0 group-hover:opacity-100"
                />
              </div>
            </div>
          </RouterLink>
          <RouterLink to="https://google.com">
            <div class="h-40 backdrop-blur-2xl w-full bg-white/60 rounded-lg p-4">
              <h3>Создать новую задачу</h3>
            </div>
          </RouterLink>
          <RouterLink to="https://google.com"
            ><div class="h-40 backdrop-blur-2xl w-full bg-white/60 rounded-lg p-4">
              <h3>Создать новую задачу</h3>
            </div></RouterLink
          >
        </div>
      </div>
    </div>

    <div
      class="block-gradient p-8 space-y-20 relative rounded-lg border-yellow-400/20 border overflow-hidden row-span-2"
    >
      <h2 class="text-4xl font-bold">Недавние задачи</h2>
      <div class="flex flex-col gap-4">
        <RouterLink
          to="https://google.com"
          v-for="task in mockTasksWithResults.slice(0, 6)"
          :key="task.id"
          class="group"
        >
          <div
            class="w-full relative h-20 backdrop-blur-2xl bg-white/60 rounded-lg p-4 flex gap-5 group-hover:bg-white items-center border-l-8 border-l-green-500"
          >
            <div class="w-full">{{ task.title }}</div>
            <div class="w-full text-gray-400 relative h-full flex items-center">
              <ArrowRightIcon
                class="size-6 absolute group-hover:right-0 right-1/4 duration-200 opacity-0 group-hover:opacity-100"
              />
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div
      class="block-gradient p-8 relative rounded-lg border-yellow-400/20 border overflow-hidden space-y-10"
    ></div>
    <div
      class="block-gradient p-8 space-y-20 relative rounded-lg border-yellow-400/20 border overflow-hidden"
    >
      <h2 class="text-4xl font-bold">Состояние сервера</h2>
      <div class="flex gap-4 justify-between w-full px-10">
        <div class="flex flex-col justify-center">
          <StatusGauge :value="50" />
          <span class="mx-auto text-lg font-semibold">ЦП</span>
        </div>
        <div class="flex flex-col justify-center">
          <StatusGauge :value="50" />
          <span class="mx-auto text-lg font-semibold">ОЗУ</span>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="w-2/3 mx-auto">
    <h1 class="text-4xl font-semibold mb-16">Задачи</h1>
    <div class="w-full grid grid-cols-5 gap-4">
      <div v-for="task in mockTasksWithResults" :key="task.id">
        <RouterLink :to="`/tasks/${task.id}`">
          <div class="w-full h-80 flex flex-col border rounded-md border-gray-600">
            <div class="h-2/3 bg-black/30"></div>
            <div class="text-lg font-semibold px-2">{{ task.title }}</div>
            <div class="text-gray-600 px-2 line-clamp-2 text-sm mt-5" v-if="task.analysis_results">
              <div>
                <div>
                  <span>TAU1 = </span> <span>{{ task.analysis_results?.tau1 }}</span>
                </div>
                <div>
                  <span>TAU2 = </span> <span>{{ task.analysis_results?.tau1 }}</span>
                </div>
              </div>
              <span>See all...</span>
            </div>
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
    <div class="w-full flex justify-center">
      <Button variant="default" @click="handleCreateTask"> Создать задачу </Button>
    </div>
  </div> -->
</template>

<style scoped>
.block-gradient {
  background: #f2ecdf;
  background: linear-gradient(
    45deg,
    rgba(242, 236, 223, 1) 0%,
    rgba(255, 250, 158, 1) 72%,
    rgba(255, 240, 184, 1) 100%
  );
}
</style>
