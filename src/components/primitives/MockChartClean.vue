<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

// 1) генерим шумную экспоненту I(t)
const tau = 2.0
const N = 200
const tMax = 10
const dt = tMax / (N - 1)
const noiseSigma = 0.05

function randn() {
  const u = 1 - Math.random(),
    v = 1 - Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const t: number[] = []
const I: number[] = []
for (let i = 0; i < N; i++) {
  const ti = i * dt
  const clean = Math.exp(-ti / tau)
  const noisy = Math.max(0, clean + noiseSigma * randn())
  t.push(ti)
  I.push(noisy)
}

// 2) фазовые векторы: проекции на cos/sin для диапазона частот
const fMin = 0.1,
  fMax = 2.0,
  fSteps = 80
const iqData: [number, number][] = []
for (let k = 0; k < fSteps; k++) {
  const f = fMin + (k / (fSteps - 1)) * (fMax - fMin)
  const w = 2 * Math.PI * f
  let X = 0,
    Y = 0
  for (let i = 0; i < N; i++) {
    X += I[i] * Math.cos(w * t[i]) * dt // In-phase
    Y += I[i] * Math.sin(w * t[i]) * dt // Quadrature
  }
  // необязательная нормировка по DC-компоненте
  iqData.push([X, Y])
}

const option: echarts.EChartsOption = {
  grid: { left: 70, right: 30, top: 20, bottom: 60, containLabel: true },
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => `I: ${p.value[0].toFixed(3)}<br/>Q: ${p.value[1].toFixed(3)}`,
  },
  xAxis: {
    type: 'value',
    name: 'In-phase (I)',
    nameLocation: 'middle',
    nameGap: 35,
    nameTextStyle: { fontSize: 12 },
    axisLabel: { hideOverlap: true, margin: 8 },
  },
  yAxis: {
    type: 'value',
    name: 'Quadrature (Q)',
    nameLocation: 'middle',
    nameGap: 55, // побольше отступ, чтобы не обрезалось
    nameTextStyle: { fontSize: 12 },
    axisLabel: { hideOverlap: true, margin: 8 },
  },
  series: [
    {
      type: 'line',
      name: 'фазовая траектория',
      data: iqData,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2 },
    },
    {
      type: 'scatter',
      name: 'частоты',
      data: iqData,
      symbolSize: 4,
      itemStyle: { opacity: 0.9 },
    },
  ],
}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(option)
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
