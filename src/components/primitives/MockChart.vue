<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

import type { TUploadedData } from './types/uploadedData'

const props = withDefaults(defineProps<{ data?: TUploadedData | null }>(), {
  data: () => ({ time: [], intensity: [] }),
})

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const buildSeriesData = (uploaded?: TUploadedData | null): [number, number][] => {
  const time = uploaded?.time || []
  const intensity = uploaded?.intensity || []
  const length = Math.min(time.length, intensity.length)
  if (!length) return []

  return Array.from({ length }, (_, index) => [
    Number(time[index]),
    Number(intensity[index]),
  ]).filter(([t, y]) => Number.isFinite(t) && Number.isFinite(y))
}

const buildOption = (seriesData: [number, number][]): echarts.EChartsOption => ({
  grid: { left: 50, right: 20, top: 20, bottom: 50, containLabel: true },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'value',
    name: 't',
    nameLocation: 'end',
    nameGap: 30, // больше места под подпись
  },
  yAxis: {
    type: 'value',
    name: 'I(t)',
    nameLocation: 'middle',
    nameGap: 40, // чтобы не прилипало к оси
    min: seriesData.length ? 'dataMin' : 0,
    max: seriesData.length ? 'dataMax' : 1,
  },
  series: [
    {
      type: 'scatter',
      name: 'Экспериментальные измерения',
      symbolSize: 4,
      opacity: 0.9,
      data: seriesData,
    },
  ],
})

const seriesData = computed(() => buildSeriesData(props.data))

const hasData = computed(() => seriesData.value.length > 0)

const applyOptions = (seriesData: [number, number][]) => {
  if (!chart) return
  chart.clear()
  chart.setOption(buildOption(seriesData), { notMerge: true })
}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  applyOptions(seriesData.value)
  const onResize = () => chart?.resize()
  window.addEventListener('resize', onResize)
  ;(chart as Еany)._onResize = onResize
})

watch(
  seriesData,
  (newValue) => {
    if (!chart) return
    applyOptions(newValue)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (chart) {
    window.removeEventListener('resize', (chart as any)._onResize)
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div ref="el" class="h-full w-full my-auto relative">
    <div
      v-if="!hasData"
      class="absolute inset-0 flex items-center justify-center text-gray-500 text-center px-4"
    >
      Provide the data first
    </div>
  </div>
</template>
