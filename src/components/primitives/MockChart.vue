<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

// параметры шума и модели
const tau = 2.0
const N = 200
const noiseSigma = 0.05

function randn() {
  const u = 1 - Math.random()
  const v = 1 - Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const data: [number, number][] = []
for (let i = 0; i < N; i++) {
  const t = (i / (N - 1)) * 10 // 0..10
  const clean = Math.exp(-t / tau)
  const noisy = Math.max(0, clean + noiseSigma * randn())
  data.push([t, noisy])
}

const option: echarts.EChartsOption = {
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
    min: 0,
    max: 1,
  },
  series: [
    {
      type: 'scatter',
      name: 'Экспериментальные измерения',
      symbolSize: 4,
      opacity: 0.9,
      data,
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
  <div ref="el" class="h-full w-full my-auto"></div>
</template>
