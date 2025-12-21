<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Props = {
  dwReal?: number[] | null
  dwImag?: number[] | null
  omega?: number | null
  coeffU?: number | null
  coeffV?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  dwReal: () => [],
  dwImag: () => [],
  omega: null,
  coeffU: null,
  coeffV: null,
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

const backendLine = computed(() => {
  // Backend returns v, u from lstsq(A, y) where y ~ v * x + u
  const m = props.coeffV
  const c = props.coeffU
  if (m === null || m === undefined || c === null || c === undefined) return null
  const pts = points.value
  const xs = pts.length ? pts.map(([x]) => x) : [0, 1]
  const minX = Math.min(...xs, 0)
  const maxX = Math.max(...xs, 1)
  const span = Math.max(0.4, maxX - minX || 0.4)
  const start = minX - span * 0.25
  const end = maxX + span * 0.25
  return [
    [start, m * start + c],
    [end, m * end + c],
  ]
})

const lineForDisplay = computed(() => backendLine.value || fitLine.value)

const lineParams = computed(() => {
  if (
    props.coeffU !== null &&
    props.coeffU !== undefined &&
    props.coeffV !== null &&
    props.coeffV !== undefined
  ) {
    // Backend: y = v * x + u
    return { m: props.coeffV, c: props.coeffU }
  }
  const line = fitLine.value
  if (!line?.length) return null
  const [[x1, y1], [x2, y2]] = line
  const dx = x2 - x1
  if (Math.abs(dx) < 1e-8) return null
  const m = (y2 - y1) / dx
  const c = y1 - m * x1
  return { m, c }
})

const intersections = computed<[number, number][]>(() => {
  const params = lineParams.value
  if (!params) return []
  const { m, c } = params
  // (x-0.5)^2 + y^2 = 0.25  => x^2 - x + y^2 = 0
  // y = m x + c
  const A = 1 + m * m
  const B = 2 * m * c - 1
  const C = c * c
  const D = B * B - 4 * A * C
  if (D < 0) return []
  const sqrtD = Math.sqrt(D)
  const xRoot1 = (-B + sqrtD) / (2 * A)
  const xRoot2 = (-B - sqrtD) / (2 * A)
  const roots = [xRoot1, xRoot2]
  const result: [number, number][] = []
  for (const xr of roots) {
    const yr = m * xr + c
    if (yr >= -0.01) result.push([xr, yr])
  }
  return result
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
  const xs = [
    ...semicircle.value.map(([x]) => x),
    ...points.value.map(([x]) => x),
    ...intersections.value.map(([x]) => x),
  ]
  const ys = [
    ...semicircle.value.map(([, y]) => y),
    ...points.value.map(([, y]) => y),
    ...intersections.value.map(([, y]) => y),
  ]
  const snap = (v: number, step = 0.05) => Math.round(v / step) * step
  const niceFloor = (v: number, step = 0.05) => snap(Math.floor(v / step) * step, step)
  const niceCeil = (v: number, step = 0.05) => snap(Math.ceil(v / step) * step, step)

  const xMin = niceFloor(Math.min(...xs, -0.2) - 0.05, 0.05)
  const xMax = niceCeil(Math.max(...xs, 1.4) + 0.05, 0.05)
  const yMax = niceCeil(Math.max(...ys, 0.9) + 0.05, 0.05)
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
      min: xMin,
      max: xMax,
      nameLocation: 'middle',
      nameGap: 35,
      axisLabel: {
        hideOverlap: true,
        formatter: (val: number) => Number(val).toFixed(2),
      },
    },
    yAxis: {
      type: 'value',
      name: 'Im(D)',
      min: 0,
      max: yMax,
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: {
        hideOverlap: true,
        formatter: (val: number) => Number(val).toFixed(2),
      },
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
            name: backendLine.value ? 'Линия (backend u/v)' : 'Линейная аппроксимация',
            data: lineForDisplay.value,
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
      intersections.value.length
        ? {
            type: 'scatter',
            name: 'Точки пересечения',
            data: intersections.value,
            symbolSize: 10,
            itemStyle: { color: '#10b981' },
            tooltip: {
              formatter: (p: any) =>
                `Пересечение<br/>Re: ${p.value[0].toFixed(4)}<br/>Im: ${p.value[1].toFixed(4)}`,
            },
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
