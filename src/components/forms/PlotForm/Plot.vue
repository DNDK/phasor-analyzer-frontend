<script setup lang="ts">
import { ref } from 'vue'

import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Legend,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'
import type { TDataSet } from './types'

ChartJS.register(
  LineController,
  Title,
  Legend,
  CategoryScale, // Добавляем шкалу категорий для оси X
  LinearScale, // Добавляем линейную шкалу для оси Y
  PointElement, // Для отображения точек
  LineElement, // Для отображения линий
)

const plotData = ref<TDataSet>()
const handleCurveData = () => {}
</script>

<template></template>
