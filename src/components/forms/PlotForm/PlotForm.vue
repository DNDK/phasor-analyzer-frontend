<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js'
import type { TDataSet, TPointSet } from './types'
import CurveInput from '@/components/forms/PlotForm/CurveInput.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Регистрируем компоненты Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

type TPlotType = 'original' | 'convolved' | 'noisy'
const plotTypes = ['original', 'convolved', 'noisy'] as const

const dataSets = ref<TDataSet[]>([])
const activeTab = ref<TPlotType>('original')

// Цвета для разных кривых
const chartColors = [
  '#f59e0b', // оранжевый
  '#3b82f6', // синий
  '#10b981', // зеленый
  '#ef4444', // красный
]

const handleCurveData = (data: TDataSet) => {
  dataSets.value.push({
    ...data,
    metadata: {
      color: chartColors[dataSets.value.length % chartColors.length],
      label: `Кривая ${dataSets.value.length + 1}`,
    },
  })
}

const chartData = computed(() => (type: TPlotType) => {
  if (!dataSets.value.length) return null

  const datasets = dataSets.value
    .filter((dataset) => dataset[type])
    .map((dataset, index) => ({
      label: `${dataset.metadata!.label} (${type})`,
      data: dataset[type]!.y,
      borderColor: dataset.metadata!.color,
      tension: 0.1,
      pointRadius: 2,
      borderWidth: 1,
    }))

  const labels = dataSets.value[0]?.[type]?.x?.map((x) => x.toString()) || []

  return {
    labels,
    datasets,
  }
})

import type { ChartOptions } from 'chart.js'

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'linear' as const,
      title: {
        display: true,
        text: 'Время, ед.',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Интенсивность, ед.',
      },
    },
  },
  plugins: {
    legend: {
      position: 'right',
      align: 'start',
      labels: {
        boxWidth: 12,
        padding: 12,
        usePointStyle: true,
      },
    },
  },
}
</script>

<template>
  <div class="w-full flex items-center gap-8">
    <div class="min-w-2/3 flex flex-col h-140">
      <h1 class="leading-7 font-semibold text-xl text-gray-600 mb-4">График кривой затухания</h1>

      <Tabs v-model="activeTab" class="h-full">
        <TabsContent v-for="plotType in plotTypes" :key="plotType" :value="plotType" class="h-full">
          <div class="h-full p-8 bg-white shadow-gray-300 shadow-md rounded-lg">
            <div v-if="chartData(plotType)?.datasets?.length" class="h-full">
              <Line :data="chartData(plotType)!" :options="chartOptions!" />
            </div>
            <div v-else class="text-gray-500 text-center h-full flex items-center justify-center">
              Нет данных для отображения
            </div>
          </div>
        </TabsContent>
        <TabsList class="grid w-full grid-cols-3 mt-2">
          <TabsTrigger value="original">Оригинал</TabsTrigger>
          <TabsTrigger value="convolved">Свёртка</TabsTrigger>
          <TabsTrigger value="noisy">С шумом</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <div class="w-full">
      <CurveInput @trigger:curve-data="handleCurveData" />
    </div>
  </div>
</template>
