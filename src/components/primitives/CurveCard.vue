<script setup lang="ts">
import type { Curve } from '@/types/curve'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { computed } from 'vue' // Import computed for reactive chart data
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'

// Register the necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const props = defineProps<Curve>()

// Define chart data using a computed property
const chartData = computed(() => {
  return {
    labels: props.time_axis.map((time) => time.toFixed(2)), // Format time_axis for labels
    datasets: [
      {
        label: 'Raw',
        backgroundColor: '#f87979',
        borderColor: '#f87979',
        data: props.raw,
        tension: 0.4, // Add some curve to the lines
      },
      {
        label: 'Raw Scaled',
        backgroundColor: '#42b883',
        borderColor: '#42b883',
        data: props.raw_scaled,
        tension: 0.4,
      },
      {
        label: 'Convolved',
        backgroundColor: '#00D8FF',
        borderColor: '#00D8FF',
        data: props.convolved,
        tension: 0.4,
      },
      {
        label: 'Noisy',
        backgroundColor: '#FFA500',
        borderColor: '#FFA500',
        data: props.noisy,
        tension: 0.4,
      },
      // Optionally include IRF data if it exists
      ...(props.irf
        ? [
            {
              label: 'IRF',
              backgroundColor: '#9966CC',
              borderColor: '#9966CC',
              data: props.irf,
              tension: 0.4,
              borderDash: [5, 5], // Dotted line for IRF
            },
          ]
        : []),
      ...(props.irf_scaled
        ? [
            {
              label: 'IRF Scaled',
              backgroundColor: '#336699',
              borderColor: '#336699',
              data: props.irf_scaled,
              tension: 0.4,
              borderDash: [5, 5],
            },
          ]
        : []),
    ],
  }
})

// Define chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to fill its container
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Intensity',
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
  },
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <div class="w-full rounded-xl border border-gray-300 flex flex-col cursor-pointer p-1">
        <div>
          <h1 class="">CURVE#{{ props.id }}</h1>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[800px] h-[500px]">
      <DialogHeader>
        <DialogTitle>Curve Details - CURVE#{{ props.id }}</DialogTitle>
        <DialogDescription> Detailed view of the curve data. </DialogDescription>
      </DialogHeader>
      <div class="h-full w-full">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <DialogFooter> </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
