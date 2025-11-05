<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ref, onBeforeMount } from 'vue'

import { getAllTasks } from '@/api/tasks'

import type { Task } from '@/types/task'
import type { AnalysisResult } from '@/types/analysis_result'
import type { CurveSet } from '@/types/curveSet'

const router = useRouter()

onBeforeMount(async () => {
  response.value = await getAllTasks()
})

const response = ref<Awaited<ReturnType<typeof getAllTasks>> | null>(null)

const mockTasksWithResults: Task[] = [
  {
    id: 1,
    title: 'Baseline scan',
    created_at: '2025-11-06T08:15:00.000Z',
    processing_time: 127,
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
</script>

<template>
  <div class="w-2/3 mx-auto">
    <h1 class="text-4xl font-semibold mb-16">Задачи</h1>
    <div class="w-full grid grid-cols-5 gap-4">
      <div v-for="task in mockTasksWithResults">
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
      <!-- <div
        class="size-32 border-dashed border-gray-500 border p-5 text-gray-500 cursor-pointer hover:border-black hover:text-black"
        @click="handleCreateTask"
      >
        Создать задачу
      </div> -->
    </div>
    <!-- <div class="w-full flex justify-center">
      <Button variant="default" @click="handleCreateTask"> Создать задачу </Button>
    </div> -->
  </div>
</template>
