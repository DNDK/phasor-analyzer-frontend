<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number // 0..100
    size?: number // px
    stroke?: number // толщина дуги
    startAngle?: number // где начинается шкала (градусы)
    sweep?: number // сколько градусов рисуем (меньше 360 => зазор)
    color?: string // цвет прогресса
    track?: string // цвет трека
  }>(),
  {
    size: 120,
    stroke: 12,
    startAngle: -120, // «10 часов» — «2 часа»
    sweep: 240, // зазор ~120°
    color: '#22c55e', // tailwind green-500
    track: '#e5e7eb', // tailwind gray-200
  },
)

const cx = computed(() => props.size / 2)
const cy = cx
const r = computed(() => props.size / 2 - props.stroke / 2)

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function arcPath(start: number, end: number) {
  const s = polar(cx.value, cy.value, r.value, start)
  const e = polar(cx.value, cy.value, r.value, end)
  const large = Math.abs(end - start) > 180 ? 1 : 0
  const sweep = end > start ? 1 : 0
  return `M ${s.x} ${s.y} A ${r.value} ${r.value} 0 ${large} ${sweep} ${e.x} ${e.y}`
}

const baseD = computed(() => arcPath(props.startAngle, props.startAngle + props.sweep))
const progEnd = computed(
  () => props.startAngle + props.sweep * Math.max(0, Math.min(1, props.value / 100)),
)
const progD = computed(() => arcPath(props.startAngle, progEnd.value))
</script>

<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img">
    <path :d="baseD" :stroke="track" :stroke-width="stroke" fill="none" stroke-linecap="round" />
    <path :d="progD" :stroke="color" :stroke-width="stroke" fill="none" stroke-linecap="round" />
  </svg>
</template>
