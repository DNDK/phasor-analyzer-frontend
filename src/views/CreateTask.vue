<script setup lang="ts">
import { ArrowUpTrayIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'

import MockChart from '@/components/primitives/MockChart.vue'
import MockChartClean from '@/components/primitives/MockChartClean.vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Task } from '@/types/task'
import type { TUploadedData } from '@/components/primitives/types/uploadedData'
import FileInput from '@/components/primitives/FileInput.vue'
import { createTask } from '@/api/tasks'
import { uploadCurveSetFromData } from '@/api/curves'
import { startAnalysis } from '@/api/analysis'
import type { AnalysisResult } from '@/types/analysis_result'

const props = defineProps<{
  mode: 'view' | 'create'
  task?: Task
}>()

const dataInput = ref<TUploadedData>({ time: [], intensity: [] })

const analysisResult = ref<AnalysisResult | null>(null)
const taskId = ref<number | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const curveUploaded = ref(false)
const analysisStarted = ref(false)

type StepStatus = 'pending' | 'progress' | 'done' | 'error'

const statusBadgeClass = (status: StepStatus) => {
  switch (status) {
    case 'done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'progress':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

const statusBadgeLabel: Record<StepStatus, string> = {
  pending: 'Ожидает',
  progress: 'Выполняется',
  done: 'Готово',
  error: 'Ошибка',
}

const hasInputData = computed(
  () => (dataInput.value.time?.length ?? 0) > 0 && (dataInput.value.intensity?.length ?? 0) > 0,
)

const aCoeffs = computed(() => {
  if (!analysisResult.value) return []
  return analysisResult.value.a1_coeffs.map((a1, idx) => ({
    index: idx + 1,
    a1,
    a2: analysisResult.value?.a2_coeffs?.[idx],
  }))
})

const workflowSteps = computed(() => {
  const createTaskStatus: StepStatus = submitError.value
    ? 'error'
    : taskId.value
      ? 'done'
      : isSubmitting.value && !taskId.value
        ? 'progress'
        : 'pending'

  const uploadStatus: StepStatus = submitError.value
    ? 'error'
    : curveUploaded.value
      ? 'done'
      : isSubmitting.value && taskId.value && !curveUploaded.value
        ? 'progress'
        : 'pending'

  const analysisStatus: StepStatus = submitError.value
    ? 'error'
    : analysisResult.value
      ? 'done'
      : analysisStarted.value
        ? 'progress'
        : 'pending'

  return [
    {
      key: 'upload',
      title: 'Загрузка данных',
      description: 'Выберите или перетащите файл с временной зависимостью интенсивности.',
      status: hasInputData.value ? 'done' : 'pending',
    },
    {
      key: 'createTask',
      title: 'Создание задачи',
      description: 'POST /api/tasks/create — подготавливаем задачу перед загрузкой кривых.',
      status: createTaskStatus,
    },
    {
      key: 'curves',
      title: 'Загрузка кривых',
      description: 'POST /api/curves/upload — отправляем time_axis и intensity в созданную задачу.',
      status: uploadStatus,
    },
    {
      key: 'analysis',
      title: 'Запуск анализа',
      description: 'POST /api/analysis/start — запускаем расчёт фазовых коэффициентов.',
      status: analysisStatus,
    },
  ]
})

const stepStatusByKey = computed<Record<string, StepStatus>>(() =>
  workflowSteps.value.reduce((acc, step) => {
    acc[step.key] = step.status
    return acc
  }, {} as Record<string, StepStatus>),
)

const runFullAnalysis = async () => {
  submitError.value = null
  analysisResult.value = null
  curveUploaded.value = false
  analysisStarted.value = false
  taskId.value = null

  if (!hasInputData.value) {
    submitError.value = 'Сначала загрузите файл с данными'
    return
  }

  isSubmitting.value = true
  try {
    const taskResponse = await createTask()
    if (taskResponse.error.value) {
      throw new Error('Не удалось создать задачу')
    }
    const createdTask = taskResponse.data.value
    if (!createdTask?.id) {
      throw new Error('Задача создана, но id не получен')
    }
    taskId.value = createdTask.id

    const uploadPayload = {
      task_id: createdTask.id,
      description: 'User uploaded dataset',
      curves: [
        {
          time_axis: dataInput.value.time,
          intensity: dataInput.value.intensity,
        },
      ],
    }
    const uploadResponse = await uploadCurveSetFromData(uploadPayload)
    if (uploadResponse.error.value) {
      throw new Error('Не удалось загрузить данные на сервер')
    }
    curveUploaded.value = true

    analysisStarted.value = true
    const analysisResponse = await startAnalysis(createdTask.id)
    if (analysisResponse.error.value) {
      throw new Error('Не удалось запустить анализ')
    }
    analysisResult.value = analysisResponse.data.value || null
  } catch (e: any) {
    submitError.value = e?.message || 'Неизвестная ошибка'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="h-full">
    <div class="w-3/4 mx-auto">
      <h1 class="text-3xl font-bold mb-8 leading-8">
        {{ props.mode === 'view' ? props.task?.title : 'Новая задача' }}
      </h1>
      <div class="flex flex-wrap gap-3 mb-6">
        <div
          v-for="step in workflowSteps"
          :key="step.key"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/40 bg-white/30 backdrop-blur"
        >
          <span class="text-sm font-semibold">{{ step.title }}</span>
          <span
            class="px-2 py-1 rounded-md border text-xs font-semibold"
            :class="statusBadgeClass(step.status)"
          >
            {{ statusBadgeLabel[step.status] }}
          </span>
        </div>
      </div>
      <div class="border rounded-lg relative overflow-hidden space-y-15 p-14 card-background">
        <div class="absolute -top-30 -left-30 opacity-10 size-300 rotate-50">
          <img src="/hexagons.svg" class="size-full" />
        </div>
        <div class="absolute -bottom-80 -right-80 opacity-10 size-300 rotate-50">
          <img src="/hexagons.svg" class="size-full" />
        </div>
        <!-- <div
          class="bg-radial from-sky-600/30 to-sky-600/15 size-200 rounded-md absolute -top-100 -left-100 -z-20 blur-2xl"
        />
        <div
          class="bg-radial from-sky-500/20 to-sky-500/5 size-150 rounded-md absolute -bottom-100 -right-100 -z-20 blur-2xl"
        />
        <div
          class="bg-radial from-sky-500/40 to-sky-500/10 size-100 rounded-md absolute -top-25 right-50 -z-20 blur-2xl"
        /> -->
        <!-- <h1
          class="text-4xl font-bold bg-white w-full leading-24 sticky top-0 px-14 py-7 z-40   "
        >
          Новая задача
        </h1> -->
        <div class="gap-10 grid grid-cols-3 w-full">
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold leading-10 text-lg">Исходные данные</h3>
              <span
                class="px-2 py-1 rounded-md border text-xs font-semibold"
                :class="statusBadgeClass(stepStatusByKey.upload)"
              >
                {{ statusBadgeLabel[stepStatusByKey.upload] }}
              </span>
            </div>
            <p class="text-gray-700 text text-justify">
              Набор экспериментальных данных — это временная зависимость интенсивности флюоресценции
              после импульса возбуждения (кривая затухания), которая была получена в ходе измерений.
            </p>
          </div>
          <div class="bg-white/20 border-white/50 border h-full col-span-2 rounded-lg backdrop-blur-3xl p-5">
            <FileInput v-model="dataInput" />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold leading-10 text-lg">Визуализация исходных данных</h3>
              <span class="text-xs text-gray-600">После загрузки</span>
            </div>
            <p class="text-gray-700 text text-justify">
              Кривая затухания — это запись того, как изменяется интенсивность флюоресценции во
              времени после короткого импульса возбуждения.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center text-gray-400 p-5 py-auto h-96 relative backdrop-blur-3xl"
          >
            <MockChart :data="dataInput || null" />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold leading-10 text-lg">Данные после обработки</h3>
              <span
                class="px-2 py-1 rounded-md border text-xs font-semibold"
                :class="statusBadgeClass(stepStatusByKey.analysis)"
              >
                {{ statusBadgeLabel[stepStatusByKey.analysis] }}
              </span>
            </div>
            <p class="text-gray-700 text text-justify">
              После запуска /api/analysis/start исходная кривая преобразуется в фазовое
              представление. Здесь появится очищенная кривая, когда анализ начнётся.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center text-gray-400 p-5 py-auto h-96 relative backdrop-blur-3xl"
          >
            <div
              v-if="!analysisStarted"
              class="absolute inset-0 flex items-center justify-center text-sm text-gray-600"
            >
              Запустите анализ, чтобы увидеть обработанные данные
            </div>
            <MockChartClean v-else />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold leading-10 text-lg">Результаты анализа</h3>
              <span
                class="px-2 py-1 rounded-md border text-xs font-semibold"
                :class="statusBadgeClass(stepStatusByKey.analysis)"
              >
                {{ statusBadgeLabel[stepStatusByKey.analysis] }}
              </span>
            </div>
            <p class="text-gray-700 text text-justify">
              Параметры a₁, a₂, а также τ₁ и τ₂ — это результаты аппроксимации кривой затухания
              биэкспоненциальной моделью. Коэффициенты a₁, a₂ задают вклад каждой компоненты, а
              времена жизни τ₁ и τ₂ отражают скорость затухания двух независимых процессов.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center p-8 py-auto relative space-y-4 backdrop-blur-3xl"
          >
            <div class="font-semibold flex items-center gap-2">
              <span>
                По результатам анализа кривых затухания методом фазовых векторов были получены
                следующие значения
              </span>
              <span v-if="taskId" class="text-xs text-gray-600">(task #{{ taskId }})</span>
            </div>
            <div v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</div>
            <div v-if="!analysisResult" class="text-sm text-gray-600">
              Загрузите данные и нажмите «Запустить анализ», чтобы увидеть результаты.
            </div>
            <div v-else class="space-y-4 w-full">
              <div>
                <span>Предэкспоненциальные коэффициенты</span>
                <Table>
                  <TableCaption>Коэффициенты a1, a2 для набора</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead> № </TableHead>
                      <TableHead> a1 </TableHead>
                      <TableHead> a2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="row in aCoeffs" :key="row.index">
                      <TableCell class="font-medium"> {{ row.index }} </TableCell>
                      <TableCell>{{ row.a1?.toFixed(4) }}</TableCell>
                      <TableCell>{{ row.a2?.toFixed(4) }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <span>Времена жизни</span>
                <Table>
                  <TableCaption>Времена жизни TAU1, TAU2 для набора</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead> TAU1 </TableHead>
                      <TableHead> TAU2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{{ analysisResult?.tau1?.toFixed(4) }}</TableCell>
                      <TableCell>{{ analysisResult?.tau2?.toFixed(4) }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 flex w-full justify-end gap-4">
        <button
          class="px-6 py-2 rounded-lg border flex gap-4 hover:cursor-pointer bg-linear-30 from-sky-200/50 to-sky-200 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isSubmitting || !hasInputData"
          @click="runFullAnalysis"
        >
          <ArrowUpTrayIcon class="size-6 text-black/60" />
          {{ isSubmitting ? 'Запускаем...' : 'Запустить анализ' }}
          <ArrowRightIcon class="size-6 text-black/40" />
        </button>
        <button
          class="px-6 py-2 rounded-lg border flex gap-4 hover:cursor-pointer bg-linear-30 from-sky-200/50 to-sky-200"
        >
          <img src="/pdficon.svg" class="size-6" />
          Экспортировать в PDF
          <ArrowRightIcon class="size-6 text-black/40" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-background {
  background: #83a4d4; /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #b6fbff, #83a4d4); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #b6fbff,
    #83a4d4
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
