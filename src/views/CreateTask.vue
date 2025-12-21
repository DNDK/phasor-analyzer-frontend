<script setup lang="ts">
import { ArrowUpTrayIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'

import MockChart from '@/components/primitives/MockChart.vue'
import PhasorPlot from '@/components/primitives/PhasorPlot.vue'
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

const dataInput = ref<TUploadedData>({ curves: [], irf: [] })

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

const inputValidationMessage = computed<string | null>(() => {
  console.log(dataInput.value)
  const curves = dataInput.value?.curves || []
  if (!curves.length) return 'Загрузите файл с кривыми (формат: t | irf | I₁ | I₂ ...)'
  const irf = dataInput.value?.irf || []

  for (const [idx, c] of curves.entries()) {
    const len = c.time?.length ?? 0
    if (!len) return `Кривая ${idx + 1}: нет точек`
    if ((c.intensity?.length ?? 0) !== len)
      return `Кривая ${idx + 1}: длина intensity не совпадает с time`
    if (c.time.some((v) => !Number.isFinite(v)))
      return `Кривая ${idx + 1}: некорректные значения времени`
    if (c.intensity.some((v) => !Number.isFinite(v)))
      return `Кривая ${idx + 1}: некорректные значения интенсивности`
  }
  if (!irf.length) return 'IRF отсутствует в файле'
  if (curves[0]?.time?.length !== irf.length)
    return 'Длина IRF не совпадает с временной осью'
  if (irf.some((v) => !Number.isFinite(v))) return 'Некорректные значения IRF'

  return null
})

const hasInputData = computed(() => !inputValidationMessage.value)

const aCoeffs = computed(() => {
  if (!analysisResult.value) return []
  return analysisResult.value.a1_coeffs.map((a1, idx) => ({
    index: idx + 1,
    a1,
    a2: analysisResult.value?.a2_coeffs?.[idx],
  }))
})

type WorkflowStep = {
  key: string
  title: string
  description: string
  status: StepStatus
}

const workflowSteps = computed<WorkflowStep[]>(() => {
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
      description:
        'POST /api/curves/upload — отправляем набор кривых: time_axis и intensity для каждой колонки.',
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
      irf: dataInput.value.irf,
      curves: dataInput.value.curves.map((curve) => ({
        time_axis: curve.time,
        intensity: curve.intensity,
      })),
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
  <div class="space-y-10">
    <section
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-600 text-white shadow-xl"
    >
      <div
        class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_45%)] blur-3xl"
      />
      <div class="absolute -left-20 -bottom-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div class="relative px-10 py-12 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/70">Конструктор</p>
            <h1 class="text-4xl font-bold leading-tight">
              {{ props.mode === 'view' ? props.task?.title : 'Новая задача' }}
            </h1>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="step in workflowSteps"
              :key="step.key"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur"
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
        </div>
        <p class="text-white/80 max-w-3xl">
          Загрузите кривые, создайте задачу и запустите анализ фазовых векторов. Результаты tau и
          коэффициентов появятся сразу после обработки.
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-white text-sky-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-sky-900/40 hover:-translate-y-0.5 transition disabled:opacity-60"
            :disabled="isSubmitting"
            @click="runFullAnalysis"
          >
            <ArrowUpTrayIcon class="size-5" />
            {{ isSubmitting ? 'Запускаем...' : 'Запустить анализ' }}
            <ArrowRightIcon class="size-4" />
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            <img src="/pdficon.svg" class="size-5" />
            Экспортировать в PDF
            <ArrowRightIcon class="size-4" />
          </button>
          <div class="text-xs text-white/80 flex items-center" v-if="inputValidationMessage">
            {{ inputValidationMessage }}
          </div>
          <div class="text-xs text-white/80 flex items-center" v-else>
            Загружено кривых: {{ dataInput.curves?.length || 0 }}
          </div>
        </div>
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg text-slate-900">Исходные данные</h3>
          <span
            class="px-2 py-1 rounded-md border text-xs font-semibold"
            :class="statusBadgeClass(stepStatusByKey.upload)"
          >
            {{ statusBadgeLabel[stepStatusByKey.upload] }}
          </span>
        </div>
        <p class="text-slate-700 text-sm leading-6">
          Набор экспериментальных данных — временная зависимость интенсивности флюоресценции.
          Используйте файл с колонками: время, IRF, далее интенсивности кривых (t | irf | I₁ | I₂
          ...). Имена кривых можно задать первой строкой вида: <code># names: curve A; curve B;</code>
          — они попадут в легенду графика.
        </p>
      </div>
      <div
        class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6"
      >
        <FileInput v-model="dataInput" />
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg text-slate-900">Визуализация исходных данных</h3>
          <span class="text-xs text-slate-500">После загрузки</span>
        </div>
        <p class="text-slate-700 text-sm leading-6">
          Кривая затухания показывает, как меняется интенсивность после импульса возбуждения.
        </p>
      </div>
      <div
        class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6 h-96 flex items-center justify-center"
      >
        <MockChart :data="dataInput || null" />
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg text-slate-900">Данные после обработки</h3>
          <span
            class="px-2 py-1 rounded-md border text-xs font-semibold"
            :class="statusBadgeClass(stepStatusByKey.analysis)"
          >
            {{ statusBadgeLabel[stepStatusByKey.analysis] }}
          </span>
        </div>
        <p class="text-slate-700 text-sm leading-6">
          После запуска /api/analysis/start исходная кривая преобразуется в фазовое представление.
          Здесь появится очищенная кривая, когда анализ начнётся.
        </p>
      </div>
      <div
        class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6 h-96 relative flex items-center justify-center"
      >
        <div
          v-if="!analysisStarted"
          class="absolute inset-0 flex items-center justify-center text-sm text-slate-600"
        >
          Запустите анализ, чтобы увидеть фазорный график
        </div>
        <div v-else class="w-full h-full">
          <div
            v-if="!analysisResult"
            class="absolute inset-0 flex items-center justify-center text-sm text-slate-600"
          >
            Ожидаем результаты анализа...
          </div>
          <PhasorPlot
            v-else
            :dw-real="analysisResult.dw_real"
            :dw-imag="analysisResult.dw_imag"
            :omega="analysisResult.omega"
            :coeff-u="analysisResult.coeff_u"
            :coeff-v="analysisResult.coeff_v"
          />
        </div>
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg text-slate-900">Результаты анализа</h3>
          <span
            class="px-2 py-1 rounded-md border text-xs font-semibold"
            :class="statusBadgeClass(stepStatusByKey.analysis)"
          >
            {{ statusBadgeLabel[stepStatusByKey.analysis] }}
          </span>
        </div>
        <p class="text-slate-700 text-sm leading-6">
          Параметры a₁, a₂ и τ₁, τ₂ — результаты аппроксимации биэкспоненциальной моделью.
          Коэффициенты отражают вклад компонентов, времена жизни — скорость затухания процессов.
        </p>
      </div>
      <div
        class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6 space-y-4"
      >
        <div class="font-semibold flex items-center gap-2 text-slate-900">
          <span>
            Результаты анализа кривых затухания методом фазовых векторов
          </span>
          <span v-if="taskId" class="text-xs text-slate-500">(task #{{ taskId }})</span>
        </div>
        <div v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</div>
        <div v-if="!analysisResult" class="text-sm text-slate-600">
          Загрузите данные и нажмите «Запустить анализ», чтобы увидеть результаты.
        </div>
        <div v-else class="space-y-4 w-full">
          <div>
            <span class="font-semibold text-slate-900">Предэкспоненциальные коэффициенты</span>
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
            <span class="font-semibold text-slate-900">Времена жизни</span>
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
    </section>
  </div>
</template>
