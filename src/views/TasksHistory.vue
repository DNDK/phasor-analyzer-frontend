<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAllTasks } from '@/api/tasks'
import { getAnalysis } from '@/api/analysis'
import type { Task } from '@/types/task'
import type { AnalysisResult } from '@/types/analysis_result'

const tasks = ref<Task[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const taskResults = ref<Record<number, AnalysisResult | null>>({})

const fetchTasks = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const { data, error } = await getAllTasks()
    if (error.value) {
      throw new Error('Не удалось загрузить задачи')
    }
    tasks.value = data.value ?? []

    // Бэкенд не отдаёт корректные статусы, поэтому тянем результаты отдельными запросами
    const resultEntries = await Promise.all(
      tasks.value.map(async (task) => {
        if (task.analysis_results) return [task.id, task.analysis_results] as const
        if (!task.analysis_results_id) return [task.id, null] as const

        const { data: resData, error: resError } = await getAnalysis(task.analysis_results_id)
        if (resError.value) return [task.id, null] as const
        return [task.id, resData.value ?? null] as const
      }),
    )
    taskResults.value = Object.fromEntries(resultEntries)
  } catch (err: any) {
    errorMessage.value = err?.message || 'Ошибка при загрузке задач'
    tasks.value = []
    taskResults.value = {}
  } finally {
    isLoading.value = false
  }
}

onBeforeMount(fetchTasks)

const sortedTasks = computed(() =>
  [...tasks.value].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
)

const stats = computed(() => {
  const withResults = sortedTasks.value.filter((task) => Boolean(taskResults.value[task.id])).length
  return {
    total: tasks.value.length,
    withResults,
    pending: tasks.value.length - withResults,
  }
})

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  return date
    .toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '')
}

const formatDuration = (value?: number) => {
  if (value === undefined || value === null) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(1)} с`
  return `${value} мс`
}

const resultSummary = (task: Task) => {
  const result = taskResults.value[task.id]
  if (!result) return 'Ожидает анализа'

  const tau1 = Number.isFinite(result.tau1) ? result.tau1.toFixed(2) : '—'
  const tau2 = Number.isFinite(result.tau2) ? result.tau2.toFixed(2) : '—'
  return `τ₁ ${tau1} • τ₂ ${tau2}`
}

const curvesCount = (task: Task) => task.curve_set?.curves?.length ?? 0

const resultStatusLabel = (task: Task) =>
  taskResults.value[task.id] ? 'Готово' : 'Ожидает анализа'
</script>

<template>
  <div class="space-y-10">
    <div
      class="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-10 shadow-lg"
    >
      <div class="absolute -top-24 -right-24 size-80 rounded-full bg-sky-200/40 blur-3xl" />
      <div class="absolute -bottom-32 -left-10 size-72 rounded-full bg-cyan-100/50 blur-3xl" />

      <div class="flex justify-between items-start gap-8 relative z-10">
        <div class="space-y-3 max-w-3xl">
          <p class="text-xs tracking-[0.2em] uppercase text-sky-800 font-semibold">История задач</p>
          <h1 class="text-4xl font-bold leading-tight">Результаты предыдущих запусков</h1>
          <p class="text-gray-700">
            Следите за выполнением расчётов, просматривайте ключевые коэффициенты и возвращайтесь к
            нужным задачам в один клик.
          </p>
        </div>
        <div class="flex gap-3 shrink-0">
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-900 shadow-sm hover:bg-white"
            @click="fetchTasks"
          >
            <ArrowPathIcon class="size-5" />
            Обновить
          </button>
          <RouterLink
            to="/create-task"
            class="inline-flex items-center gap-2 rounded-xl bg-sky-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200/80 hover:bg-sky-800"
          >
            <PlusIcon class="size-5" />
            Новая задача
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-8 relative z-10">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Всего задач</span>
            <DocumentMagnifyingGlassIcon class="size-6 text-sky-700" />
          </div>
          <div class="text-4xl font-bold mt-2">{{ stats.total }}</div>
          <p class="text-sm text-gray-600 mt-2">История расчётов за всё время</p>
        </div>
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">С готовыми результатами</span>
            <ClockIcon class="size-6 text-emerald-700" />
          </div>
          <div class="text-4xl font-bold mt-2 text-emerald-700">{{ stats.withResults }}</div>
          <p class="text-sm text-gray-600 mt-2">Доступны коэффициенты и кривые</p>
        </div>
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Ожидают анализа</span>
            <ArrowRightIcon class="size-6 text-amber-700" />
          </div>
          <div class="text-4xl font-bold mt-2 text-amber-700">{{ stats.pending }}</div>
          <p class="text-sm text-gray-600 mt-2">Проверьте и запустите расчёт</p>
        </div>
      </div>
    </div>

    <div
      class="rounded-3xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-100 overflow-hidden"
    >
      <div class="flex items-center justify-between px-8 py-6 border-b border-slate-100/70">
        <div>
          <h2 class="text-2xl font-semibold">Список задач</h2>
          <p class="text-gray-600">Краткий срез по времени запуска и результатам анализа</p>
        </div>
        <RouterLink
          to="/create-task"
          class="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50"
        >
          <PlusIcon class="size-5" />
          Добавить новую
        </RouterLink>
      </div>

      <div v-if="isLoading" class="p-8 space-y-3">
        <div class="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 w-24 bg-slate-100 rounded animate-pulse" />
        <div class="space-y-2">
          <div v-for="n in 4" :key="n" class="h-12 bg-slate-50 rounded-lg animate-pulse" />
        </div>
      </div>

      <div v-else-if="errorMessage" class="p-8">
        <div class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {{ errorMessage }}
        </div>
      </div>

      <div v-else-if="!sortedTasks.length" class="p-8">
        <div
          class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center"
        >
          <p class="text-lg font-semibold text-slate-800">Задач пока нет</p>
          <p class="text-gray-600 mt-2">
            Создайте первую задачу и она появится здесь вместе с результатами.
          </p>
          <RouterLink
            to="/create-task"
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-800"
          >
            <PlusIcon class="size-5" />
            Создать задачу
          </RouterLink>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="bg-slate-50/80">
              <TableHead class="min-w-64">Задача</TableHead>
              <TableHead>Создана</TableHead>
              <TableHead>Кривых</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead>Результат</TableHead>
              <TableHead class="w-32 text-right">Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="task in sortedTasks"
              :key="task.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <TableCell class="font-semibold text-slate-900">
                <div class="flex items-center gap-3">
                  <span>{{ task.title }}</span>
                  <span
                    class="px-2 py-1 rounded-full text-xs border"
                    :class="
                      taskResults[task.id]
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    "
                  >
                    {{ resultStatusLabel(task) }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-gray-700">{{ formatDate(task.created_at) }}</TableCell>
              <TableCell class="text-gray-700">
                {{ curvesCount(task) ? `${curvesCount(task)} крив.` : '—' }}
              </TableCell>
              <TableCell class="text-gray-700">{{
                formatDuration(task.processing_time)
              }}</TableCell>
              <TableCell class="text-gray-700">{{ resultSummary(task) }}</TableCell>
              <TableCell class="text-right">
                <RouterLink
                  :to="`/tasks/${task.id}`"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                >
                  Смотреть
                  <ArrowRightIcon class="size-4" />
                </RouterLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.stat-card {
  @apply rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md shadow-sky-100 backdrop-blur;
}
</style>
