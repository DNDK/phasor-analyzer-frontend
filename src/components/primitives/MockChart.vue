<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

import type { TUploadedData } from './types/uploadedData'

const props = withDefaults(defineProps<{ data?: TUploadedData | null }>(), {
  data: () => ({ curves: [] }),
})

const chartEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const buildOption = (uploaded?: TUploadedData | null): echarts.EChartsOption => {
  const curves = uploaded?.curves || []
  const series =
    curves
      .filter((c) => (c.time?.length ?? 0) && (c.intensity?.length ?? 0))
      .map((curve, idx) => {
        const length = Math.min(curve.time.length, curve.intensity.length)
        const data = Array.from({ length }, (_, i) => [Number(curve.time[i]), Number(curve.intensity[i])]).filter(
          ([t, y]) => Number.isFinite(t) && Number.isFinite(y),
        )
        return {
          type: 'line',
          name: curve.name || `Кривая ${idx + 1}`,
          symbolSize: 3,
          showSymbol: false,
          data,
        }
      }) || []

  return {
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
      min: series.length ? 'dataMin' : 0,
      max: series.length ? 'dataMax' : 1,
    },
    legend: { show: series.length > 1 },
    series,
  }
}

const hasData = computed(() => (props.data?.curves?.length ?? 0) > 0)

const applyOptions = (uploaded?: TUploadedData | null) => {
  if (!chart) return
  chart.clear()
  chart.setOption(buildOption(uploaded), { notMerge: true })
}

onMounted(() => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value)
  applyOptions(props.data)
  const onResize = () => chart?.resize()
  window.addEventListener('resize', onResize)
  ;(chart as any)._onResize = onResize
})

watch(
  () => props.data,
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
  <div class="h-full w-full my-auto relative">
    <div ref="chartEl" class="h-full w-full"></div>
    <div
      v-if="!hasData"
      class="absolute inset-0 flex items-center justify-center text-gray-500 text-center px-4"
    >
      Загрузите набор кривых для предварительного просмотра
    </div>
  </div>
</template>
