<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Props = {
  dwReal?: number[] | null
  dwImag?: number[] | null
  omega?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  dwReal: () => [],
  dwImag: () => [],
  omega: null,
})

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const points = computed<[number, number][]>(() => {
  const re = props.dwReal || []
  const im = props.dwImag || []
  const len = Math.min(re.length, im.length)
  const res: [number, number][] = []
  for (let i = 0; i < len; i++) {
    const x = Number(re[i])
    const y = Number(im[i])
    if (Number.isFinite(x) && Number.isFinite(y)) res.push([x, y])
  }
  return res
})

const fitLine = computed(() => {
  const pts = points.value
  if (!pts.length) return []
  const n = pts.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0
  for (const [x, y] of pts) {
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1)
  const c = (sumY - m * sumX) / n
  const xs = pts.map(([x]) => x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const span = Math.max(0.2, maxX - minX || 0.2)
  const start = minX - span * 0.1
  const end = maxX + span * 0.2
  return [
    [start, m * start + c],
    [end, m * end + c],
  ]
})

const semicircle = computed(() => {
  const centerX = 0.5
  const centerY = 0
  const radius = 0.5
  const steps = 100
  const res: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const theta = (Math.PI * i) / steps
    res.push([centerX + radius * Math.cos(theta), centerY + radius * Math.sin(theta)])
  }
  return res
})

const option = computed<echarts.EChartsOption>(() => {
  const hasData = points.value.length > 0
  return {
    grid: { left: 70, right: 30, top: 30, bottom: 60, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (Array.isArray(p.value)) {
          return `Re: ${p.value[0].toFixed(4)}<br/>Im: ${p.value[1].toFixed(4)}`
        }
        return ''
      },
    },
    legend: { bottom: 0 },
    xAxis: {
      type: 'value',
      name: 'Re(D)',
      min: -0.2,
      max: 1.4,
      nameLocation: 'middle',
      nameGap: 35,
      axisLabel: { hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      name: 'Im(D)',
      min: 0,
      max: 0.9,
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: { hideOverlap: true },
    },
    series: [
      {
        type: 'line',
        name: 'Универсальная полуокружность',
        data: semicircle.value,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#94a3b8', width: 1.5 },
        silent: true,
      },
      hasData
        ? {
            type: 'line',
            name: 'Линейная аппроксимация',
            data: fitLine.value,
            showSymbol: false,
            lineStyle: { type: 'dashed', width: 1.5, color: '#0ea5e9' },
          }
        : null,
      hasData
        ? {
            type: 'scatter',
            name: 'Фазоры',
            data: points.value,
            symbolSize: 8,
            itemStyle: { color: '#2563eb' },
          }
        : null,
    ].filter(Boolean) as echarts.SeriesOption[],
  }
})

const apply = () => {
  if (!chart) return
  chart.setOption(option.value, { notMerge: true })
}

watch(option, apply, { deep: true })

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  apply()
  const onResize = () => chart?.resize()
  window.addEventListener('resize', onResize)
  ;(chart as any)._onResize = onResize
})

onBeforeUnmount(() => {
  if (chart) {
    window.removeEventListener('resize', (chart as any)._onResize)
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div ref="el" class="w-full h-full"></div>
</template>
