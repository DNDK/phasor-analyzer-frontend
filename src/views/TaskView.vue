<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { LineChart } from 'echarts/charts'

import { ArrowRightIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

import { getCurveSet } from '@/api/curveSets'
import { startAnalysis, getAnalysisByCurveSet } from '@/api/analysis'
import type { CurveSet } from '@/types/curveSet'
import type { Curve } from '@/types/curve'
import type { AnalysisResult } from '@/types/analysis_result'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError } from '@/api/client'

use([TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer, LineChart, GridComponent])

const route = useRoute()

const curveSet = ref<CurveSet | null>(null)
const analysisResult = ref<AnalysisResult | null>(null)
const isLoading = ref(true)
const isRunningAnalysis = ref(false)
const errorMessage = ref<string | null>(null)
const analysisError = ref<string | null>(null)

const fetchCurveSet = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
    curveSet.value = await getCurveSet(id)
    // If the analysis has already been run, fetch its result automatically
    if (curveSet.value.status === 'completed') {
      analysisResult.value = await getAnalysisByCurveSet(id)
    }
  } catch (e: any) {
    errorMessage.value = e instanceof ApiError ? e.message : 'Ошибка при загрузке набора кривых'
    curveSet.value = null
  } finally {
    isLoading.value = false
  }
}

const runAnalysis = async () => {
  if (!curveSet.value) return
  isRunningAnalysis.value = true
  analysisError.value = null
  try {
    analysisResult.value = await startAnalysis(curveSet.value.id)
    // Refresh the curve set to get the updated status
    curveSet.value = await getCurveSet(curveSet.value.id)
  } catch (e: any) {
    analysisError.value = e instanceof ApiError ? e.message : 'Не удалось запустить анализ'
  } finally {
    isRunningAnalysis.value = false
  }
}

onBeforeMount(fetchCurveSet)

const formattedDate = computed(() => {
  if (!curveSet.value?.created_at) return ''
  const date = new Date(curveSet.value.created_at)
  if (isNaN(date.getTime())) return curveSet.value.created_at
  return date
    .toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '')
})

const getPriorityData = (curve: Curve): number[] =>
  curve.noisy ??
  curve.convolved ??
  curve.raw_scaled ??
  curve.raw ??
  Array(curve.time_axis.length).fill(0)

const generateColor = (index: number, total: number) => {
  const hue = Math.floor((index * 360) / total)
  return `hsl(${hue}, 80%, 60%)`
}

const echartOptions = computed(() => {
  if (!curveSet.value?.curves?.length) return {}
  const curves = curveSet.value.curves
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toFixed(4),
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: curves[0]?.time_axis?.map((time) => time.toFixed(2)) || [],
        axisLabel: { show: false },
      },
    ],
    yAxis: { type: 'value', axisLabel: { show: false } },
    series: curves.map((curve, index) => {
      const yData = getPriorityData(curve)
      const color = generateColor(index, curves.length)
      return {
        name: `Curve ${curve.id}`,
        type: 'line',
        data: curve.time_axis.map((time, i) => [time.toFixed(2), yData[i].toFixed(4)]),
        lineStyle: { color },
        itemStyle: { color },
        symbol: 'none',
        connectNulls: true,
      }
    }),
  }
})

const aCoeffs = computed(() => {
  if (!analysisResult.value) return []
  return analysisResult.value.a1_coeffs.map((a1, idx) => ({
    index: idx + 1,
    a1,
    a2: analysisResult.value?.a2_coeffs?.[idx],
  }))
})

const statusLabel = computed(() => {
  const st = curveSet.value?.status
  if (st === 'completed') return 'Анализ завершён'
  if (st === 'running') return 'Выполняется'
  if (st === 'failed') return 'Ошибка'
  return 'Ожидает анализа'
})

const statusClass = computed(() => {
  const st = curveSet.value?.status
  if (st === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (st === 'failed') return 'bg-red-50 text-red-700 border-red-100'
  if (st === 'running') return 'bg-sky-50 text-sky-700 border-sky-100'
  return 'bg-amber-50 text-amber-700 border-amber-100'
})
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
            <p class="text-xs uppercase tracking-[0.2em] text-white/70">Задача</p>
            <h1 class="text-4xl font-bold leading-tight">
              {{ curveSet?.title || 'Набор кривых' }}
            </h1>
            <p class="text-sm text-white/70 mt-1">{{ formattedDate }}</p>
          </div>
          <div class="flex flex-wrap gap-3 items-center">
            <span class="px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-sm font-semibold">
              ID: {{ curveSet?.id ?? '—' }}
            </span>
            <span
              class="px-3 py-1.5 rounded-lg border text-sm font-semibold"
              :class="statusClass"
            >
              {{ statusLabel }}
            </span>
            <RouterLink
              to="/curve-sets"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              История задач
              <ArrowRightIcon class="size-4" />
            </RouterLink>
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
              @click="fetchCurveSet"
            >
              <ArrowPathIcon class="size-4" />
              Обновить
            </button>
            <button
              v-if="curveSet?.status !== 'completed' && curveSet?.status !== 'running'"
              class="inline-flex items-center gap-2 rounded-xl bg-white text-sky-900 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition disabled:opacity-60"
              :disabled="isRunningAnalysis || !curveSet?.curves?.length"
              @click="runAnalysis"
            >
              {{ isRunningAnalysis ? 'Анализ...' : 'Запустить анализ' }}
            </button>
          </div>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="rounded-xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/10">
            <div class="text-xs text-white/70">Времена жизни</div>
            <div class="text-2xl font-bold">
              τ₁ {{ analysisResult?.tau1?.toFixed(2) ?? '—' }}
            </div>
            <div class="text-sm text-white/70">τ₂ {{ analysisResult?.tau2?.toFixed(2) ?? '—' }}</div>
            <div v-if="analysisError" class="text-xs text-red-300 mt-1">{{ analysisError }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/10">
            <div class="text-xs text-white/70">Кривых в наборе</div>
            <div class="text-2xl font-bold">
              {{ curveSet?.curves?.length ?? 0 }}
            </div>
            <div class="text-sm text-white/70">Curve Set #{{ curveSet?.id ?? '—' }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/10">
            <div class="text-xs text-white/70">Длительность</div>
            <div class="text-2xl font-bold">
              {{ curveSet?.processing_time ? `${curveSet.processing_time.toFixed(1)} мс` : '—' }}
            </div>
            <div class="text-sm text-white/70">Время обработки</div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="rounded-2xl border border-slate-100 bg-white/90 p-8 shadow">
      <div class="space-y-3">
        <div class="h-6 w-40 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 w-60 bg-slate-100 rounded animate-pulse" />
        <div class="h-72 w-full bg-slate-50 rounded-xl animate-pulse" />
      </div>
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-2xl border border-red-100 bg-red-50 text-red-800 p-6 shadow"
    >
      {{ errorMessage }}
    </div>

    <div v-else class="space-y-8">
      <section class="grid lg:grid-cols-3 gap-6">
        <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-lg text-slate-900">Набор кривых</h3>
            <ChartBarIcon class="size-6 text-slate-500" />
          </div>
          <p class="text-slate-700 text-sm leading-6">
            Кривые затухания, используемые в анализе. По умолчанию отображаются исходные или
            нормализованные данные, если они есть.
          </p>
          <div class="mt-4 text-sm text-slate-600">
            Кривых: {{ curveSet?.curves?.length ?? 0 }}
          </div>
        </div>
        <div
          class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6 h-96"
        >
          <VChart v-if="curveSet?.curves?.length" :option="echartOptions" class="h-full" />
          <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
            Набор кривых отсутствует
          </div>
        </div>
      </section>

      <section class="grid lg:grid-cols-3 gap-6">
        <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-lg text-slate-900">Результаты анализа</h3>
            <span
              class="px-2 py-1 rounded-md border text-xs font-semibold"
              :class="statusClass"
            >
              {{ statusLabel }}
            </span>
          </div>
          <p class="text-slate-700 text-sm leading-6">
            Параметры τ₁/τ₂, коэффициенты a₁/a₂, а также фазовые коэффициенты U/V. Ниже — таблицы с
            рассчитанными значениями.
          </p>
        </div>
        <div
          class="lg:col-span-2 rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6 space-y-4"
        >
          <div v-if="!analysisResult" class="text-sm text-slate-600">
            Результаты отсутствуют. Запустите анализ для этой задачи.
          </div>
          <div v-else class="space-y-4">
            <div class="grid sm:grid-cols-3 gap-4">
              <div class="stat-tile text-slate-900 border-slate-100 bg-slate-50">
                <div class="text-xs text-slate-600">τ₁</div>
                <div class="text-2xl font-bold">{{ analysisResult.tau1.toFixed(3) }}</div>
              </div>
              <div class="stat-tile text-slate-900 border-slate-100 bg-slate-50">
                <div class="text-xs text-slate-600">τ₂</div>
                <div class="text-2xl font-bold">{{ analysisResult.tau2.toFixed(3) }}</div>
              </div>
              <div class="stat-tile text-slate-900 border-slate-100 bg-slate-50">
                <div class="text-xs text-slate-600">U / V</div>
                <div class="text-2xl font-bold">
                  {{ analysisResult.coeff_u.toFixed(2) }} / {{ analysisResult.coeff_v.toFixed(2) }}
                </div>
              </div>
            </div>

            <div>
              <p class="font-semibold text-slate-900 mb-2">Предэкспоненциальные коэффициенты</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>a1</TableHead>
                    <TableHead>a2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="row in aCoeffs" :key="row.index">
                    <TableCell class="font-medium">{{ row.index }}</TableCell>
                    <TableCell>{{ row.a1?.toFixed(4) }}</TableCell>
                    <TableCell>{{ row.a2?.toFixed(4) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <p class="font-semibold text-slate-900 mb-2">Фазовые коэффициенты</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Re(D)</TableHead>
                    <TableHead>Im(D)</TableHead>
                    <TableHead>ω</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(real, idx) in analysisResult.dw_real" :key="idx">
                    <TableCell>{{ real?.toFixed(4) }}</TableCell>
                    <TableCell>{{ analysisResult.dw_imag?.[idx]?.toFixed(4) }}</TableCell>
                    <TableCell v-if="idx === 0">{{ analysisResult.omega?.toFixed(4) }}</TableCell>
                    <TableCell v-else class="text-slate-400">—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.stat-tile {
  @apply rounded-xl border p-4 shadow-sm;
}
</style>
