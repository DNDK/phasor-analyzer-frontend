<script setup lang="ts">
import { computed, watch } from 'vue'
import VChart from 'vue-echarts'

// echarts registration
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, TooltipComponent, LegendComponent, GridComponent])

import type { TChartProps, TChartCurve } from './types/chart'

// type CurveForChart = {
//   id: string | number
//   time_axis: number[]
//   noisy?: number[]
//   convolved?: number[]
//   raw_scaled?: number[]
//   raw?: number[]
// }

// type Props = {
//   curves: CurveForChart[]
//   xPrecision?: number
//   yPrecision?: number
//   legend?: boolean
// }
const props = withDefaults(defineProps<TChartProps>(), {
  curves: () => [],
  xPrecision: 2,
  yPrecision: 4,
  legend: false,
})

function pickY(curve: TChartCurve): number[] {
  return (
    curve.noisy ??
    curve.convolved ??
    curve.raw_scaled ??
    curve.raw ??
    Array(curve.time_axis.length).fill(0)
  )
}
function color(i: number, total: number) {
  const hue = Math.floor((i * 360) / Math.max(1, total))
  return `hsl(${hue}, 80%, 60%)`
}

const option = computed(() => {
  const curves = props.curves || []
  if (curves.length === 0 || !curves[0]?.time_axis?.length) return {}

  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: number) => (Number.isFinite(v) ? v.toFixed(props.yPrecision) : String(v)),
    },
    legend: props.legend
      ? {
          data: curves.map((c) => `Curve ${c.id}`),
          selectedMode: false,
        }
      : undefined,
    grid: { left: 8, right: 8, top: props.legend ? 28 : 8, bottom: 8, containLabel: false },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: curves[0].time_axis.map((t) => t.toFixed(props.xPrecision)),
        axisLabel: { show: false },
      },
    ],
    yAxis: {
      type: 'value',
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    series: curves.map((c, i) => {
      const y = pickY(c)
      const col = color(i, curves.length)
      return {
        name: `Curve ${c.id}`,
        type: 'line',
        data: c.time_axis.map((t, idx) => [
          t.toFixed(props.xPrecision),
          (y[idx] ?? 0).toFixed(props.yPrecision),
        ]),
        lineStyle: { color: col },
        itemStyle: { color: col },
        symbol: 'none',
        connectNulls: true,
        showSymbol: false,
        smooth: 0,
      }
    }),
  }
})

watch(option, (o) => console.debug('[TaskCurvesChart] option', o), { deep: true })
</script>

<template>
  <VChart v-if="curves?.length" :option="option" autoresize class="w-full h-full" />
  <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
    Нет данных для графика
  </div>
</template>
