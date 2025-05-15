<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'
import VChart from 'vue-echarts'

import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { Button } from '@/components/ui/button'
import { getTask, getAllTasks } from '@/api/tasks'
import type { Task, Curve } from '@/types'
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { LineChart } from 'echarts/charts'
use([TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer, LineChart, GridComponent])

const route = useRoute()
const response = ref<Awaited<ReturnType<typeof getTask>> | null>(null)

// Регистрация компонентов Chart.js
// Функция выбора данных по приоритету (остается без изменений)
function getPriorityData(curve: Curve) {
  return (
    curve.noisy ??
    curve.convolved ??
    curve.raw_scaled ??
    curve.raw ??
    Array(curve.time_axis.length).fill(0)
  )
}

// Генерация уникального цвета для каждой кривой (остается без изменений)
function generateColor(index: number, total: number) {
  const hue = Math.floor((index * 360) / total)
  return `hsl(${hue}, 80%, 60%)`
}

const echartOptions = computed(() => {
  if (!response.value?.data?.curve_set?.curves) {
    return {} // Возвращаем пустой объект, если нет данных
  }

  const curves = response.value.data.curve_set.curves

  return {
    // grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toFixed(4),
    },
    // legend: {
    //   data: curves.map((curve) => `Curve ${curve.id}`),
    //   // Отключаем стандартное поведение скрытия при клике (аналогично Chart.js)
    //   selectedMode: false,
    // },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false, // Убираем промежутки по краям оси X
        data: curves[0]?.time_axis?.map((time) => time.toFixed(2)) || [], // Используем time_axis первой кривой как метки,
        axisLabel: {
          show: false,
        },
      },
    ],
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
    },
    series: curves.map((curve, index) => {
      const yData = getPriorityData(curve)
      const color = generateColor(index, curves.length)
      return {
        name: `Curve ${curve.id}`,
        type: 'line',
        data: curve.time_axis.map((time, i) => [time.toFixed(2), yData[i].toFixed(4)]), // Формат данных для ECharts [x, y]
        lineStyle: {
          color: color,
        },
        itemStyle: {
          color: color,
        },
        symbol: 'none', // Убираем точки на линии
        connectNulls: true, // Соединяем null значения
        // ... другие настройки серии
      }
    }),
  }
})

// Отслеживаем изменения chartOptions для отладки (необязательно)
watch(
  echartOptions,
  (newOptions) => {
    console.log('ECharts Options:', newOptions)
  },
  { deep: true },
)

// Форматирование даты
const formattedDate = computed(() => {
  if (!response.value?.data?.created_at) return ''

  try {
    const date = new Date(response.value.data.created_at)
    if (isNaN(date.getTime())) return 'Invalid Date'

    return date
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '')
  } catch (e) {
    console.error('Date formatting error:', e)
    return 'Invalid Date'
  }
})

const isCurveSetExpanded = ref(false)
const handleGenerateSet = () => console.log('Generate set')

watch(response, (newValue) => {
  console.log('response.value:', newValue)
})

watch(
  () => response.value?.data?.curve_set,
  (newValue) => {
    console.log('response.value?.data?.curve_set:', newValue)
  },
)

onBeforeMount(async () => {
  response.value = await getTask(route.params.id)
})

const staticEchartOptions = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Test Data',
      type: 'line',
      data: [120, 200, 150, 80, 70, 110, 130],
    },
  ],
}
</script>

<template>
  <h1 class="text-4xl mb-16 font-semibold leading-9">Задача</h1>

  <div class="flex w-full justify-center items-center gap-6">
    <!-- Блок задачи -->
    <div
      class="size-90 border border-black rounded-xl flex flex-col relative p-6 bg-white shadow-lg shadow-gray-300"
    >
      <h3 class="-top-[13px] left-10 absolute bg-white px-2">Задача</h3>
      <h1 class="text-xl text-gray-600 font-semibold">{{ response?.data?.title }}</h1>
      <span class="mt-auto ml-auto">{{ formattedDate }}</span>
    </div>

    <ArrowRightIcon class="size-8" :class="response?.data?.curve_set ? '' : 'text-gray-300'" />

    <!-- Блок набора кривых -->
    <div
      class="size-90 border border-black p-6 rounded-xl relative bg-white shadow-lg shadow-gray-300"
    >
      <h3 class="-top-[13px] left-10 absolute bg-white px-2">Набор кривых</h3>
      <h1 class="text-xl text-gray-600 font-semibold">Набор#{{ response?.data?.curve_set?.id }}</h1>
      <v-chart :option="echartOptions" v-if="response?.data?.curve_set?.curves" />
      <div class="w-full h-full flex justify-center items-center flex-col gap-5">
        <span class="text-gray-600">Набор кривых отсутствует</span>
        <Button variant="outline" @click="handleGenerateSet">Сгенерировать</Button>
      </div>
    </div>

    <ArrowRightIcon
      class="size-8"
      :class="response?.data?.analysis_results ? '' : 'text-gray-300'"
    />

    <!-- Блок результатов анализа -->
    <div
      class="size-90 border border-black p-6 rounded-xl relative bg-white shadow-lg shadow-gray-300"
    >
      <h3 class="-top-[13px] left-10 absolute bg-white px-2">Результаты анализа</h3>
      <div v-if="response?.data?.analysis_results">
        <!-- Здесь можно добавить отображение результатов анализа -->
      </div>
      <div v-else class="w-full h-full flex justify-center items-center flex-col gap-5">
        <span class="text-gray-600">Анализ не был проведён</span>
        <Button variant="outline">Запустить</Button>
      </div>
    </div>
  </div>
</template>
