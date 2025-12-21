<script setup lang="ts">
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TUploadedData, TCurve } from './types/uploadedData'

const modelValue = defineModel<TUploadedData>({ default: () => ({ curves: [], irf: [] }) })

// const modelValue = defineModel()
const fileInput = ref<HTMLInputElement>()
const uploadedData = ref<TUploadedData>(modelValue.value || { curves: [], irf: [] })

const fileName = ref<string>('')

// trash
const isDragging = ref(false)
const dragDepth = ref(0)

const parseCurveSet = (text: string) => {
  // Expected format for phasor workflow with IRF:
  // (optional) # names: curve A, curve B, curve C
  // time  irf  intensity_curve1  intensity_curve2 ...
  // (whitespace / CSV / semicolon separated)
  const names: string[] = []
  const irf: number[] = []
  const dataLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const metaMatch = line.match(/^#\s*names?\s*[:=]\s*(.+)$/i)
      if (metaMatch?.[1]) {
        names.push(
          ...metaMatch[1]
            .split(/[;,]+/)
            .map((n) => n.trim())
            .filter(Boolean),
        )
        return false
      }
      return !/^#/.test(line) && !/^\/\//.test(line)
    })
  if (!dataLines.length) throw new Error('Файл пустой')

  const curves: TCurve[] = []
  dataLines.forEach((line, lineIdx) => {
    const parts = line.split(/[\s,;]+/).filter(Boolean)
    if (parts.length < 3) {
      throw new Error(`Строка ${lineIdx + 1}: минимум 3 колонки (time, irf, intensity...)`)
    }
    const numbers = parts.map((p) => Number(p))
    if (numbers.some((n) => Number.isNaN(n))) {
      throw new Error(`Строка ${lineIdx + 1}: все значения должны быть числами`)
    }

    const [time, irfValue, ...intensities] = numbers
    irf.push(irfValue)
    if (names.length && names.length !== intensities.length) {
      throw new Error(
        `Строка ${lineIdx + 1}: количество имён (${names.length}) не совпадает с числом кривых (${intensities.length})`,
      )
    }
    if (!curves.length) {
      intensities.forEach((_, idx) => {
        const name = names[idx] || `Кривая ${idx + 1}`
        curves.push({ name, time: [], intensity: [] })
      })
    } else if (curves.length !== intensities.length) {
      throw new Error(
        `Строка ${lineIdx + 1}: количество кривых не совпадает (${intensities.length} vs ${curves.length})`,
      )
    }

    intensities.forEach((intens, idx) => {
      curves[idx].time.push(time)
      curves[idx].intensity.push(intens)
    })
  })

  if (!curves.length) throw new Error('Не удалось создать набор кривых')

  uploadedData.value = { curves, irf }
}

const readFile = (file: File) => {
  const fileReader = new FileReader()
  fileReader.onload = () => {
    const data = fileReader.result?.toString() || ''
    try {
      parseCurveSet(data)
      fileName.value = file.name
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Ошибка разбора файла')
    }
  }

  fileReader.onerror = () => {
    console.log('Error reading file: ', fileReader.error)
  }

  fileReader.readAsText(file)
}

const handleFileChange = () => {
  const files = fileInput.value?.files
  if (!files || !files.length) {
    return
  }

  readFile(files[0])
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  readFile(file)

  dragDepth.value = 0
  isDragging.value = false
}

const handleDragEnter = (event?: DragEvent) => {
  event?.preventDefault()
  dragDepth.value += 1
  isDragging.value = true
}

const handleDragLeave = (event?: DragEvent) => {
  event?.preventDefault()
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (!dragDepth.value) isDragging.value = false
}

const handleDragOver = (event?: DragEvent) => {
  event?.preventDefault()
}

const handleGlobalDrop = (event: DragEvent) => {
  event.preventDefault()
  handleFileDrop(event)
  dragDepth.value = 0
  isDragging.value = false
}

const hasDocument = typeof document !== 'undefined'

watch(
  uploadedData,
  (newValue) => {
    modelValue.value = newValue || { curves: [] }
  },
  { deep: true },
)

watch(
  () => modelValue.value,
  (newValue) => {
    if (newValue && uploadedData.value !== newValue) {
      uploadedData.value = newValue
    }
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('dragenter', handleDragEnter)
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('dragend', handleDragLeave)
  window.addEventListener('drop', handleGlobalDrop)
})

onBeforeUnmount(() => {
  window.removeEventListener('dragenter', handleDragEnter)
  window.removeEventListener('dragover', handleDragOver)
  window.removeEventListener('dragleave', handleDragLeave)
  window.removeEventListener('dragend', handleDragLeave)
  window.removeEventListener('drop', handleGlobalDrop)
})

const formatValue = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  const abs = Math.abs(value)
  if (abs !== 0 && (abs < 1e-3 || abs > 1e4)) return value.toExponential(3)
  return value.toFixed(3)
}
</script>

<template>
  <div class="relative z-30 w-full col-span-2 border-0">
    <div
      class="bg-white/20 border-white/50 border h-full col-span-2 rounded-lg flex flex-col gap-10 items-center justify-center text-gray-400 backdrop-blur-3xl hover:cursor-pointer hover:bg-radial from-sky-100 to-sky-200 group overflow-hidden"
      @click="fileInput?.click()"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop="
        (event) => {
          handleFileDrop(event)
        }
      "
    >
      <div
        v-if="!uploadedData.curves.length"
        class="flex flex-col items-center justify-center w-full mx-auto"
      >
        <ArrowUpTrayIcon class="size-10" />
        <div class="">
          <span class="text-sky-600 font-semibold">Выберите </span>набор данных или
          <span class="text-sky-600 font-semibold">перетащите</span> его сюда
        </div>
      </div>
      <div v-else class="w-full overflow-hidden h-full relative">
        <div class="flex items-center justify-between px-4">
          <div class="font-semibold text-black">
            Загружено кривых: {{ uploadedData.curves.length }}
          </div>
          <div class="text-xs text-gray-700">Формат: # names: ... (опц.) + t | irf | I₁ | I₂ ...</div>
        </div>
        <div
          class="grid grid-cols-[80px_80px_repeat(3,minmax(100px,1fr))] gap-2 py-4 w-full px-4 fade-bottom-mask"
        >
          <span class="font-semibold text-black text-center">t</span>
          <span class="font-semibold text-black text-center">irf</span>
          <span
            v-for="curve in uploadedData.curves.slice(0, 3)"
            :key="curve.name"
            class="font-semibold text-black text-center"
          >
            {{ curve.name }}
          </span>
          <template
            v-for="rowIdx in Math.min(8, uploadedData.curves[0]?.time.length || 0)"
            :key="rowIdx"
          >
            <span class="text-center">
              {{ formatValue(uploadedData.curves[0]?.time[rowIdx - 1]) }}
            </span>
            <span class="text-center">
              {{ formatValue(uploadedData.irf?.[rowIdx - 1]) }}
            </span>
            <span
              v-for="curve in uploadedData.curves.slice(0, 3)"
              :key="`${curve.name}-${rowIdx}`"
              class="text-center"
            >
              {{ formatValue(curve.intensity[rowIdx - 1]) }}
            </span>
          </template>
        </div>
        <div class="absolute bottom-0 w-full py-4 text-center text-black font-semibold">
          <div
            class="rounded-full bg-white/50 inline-block px-4 py-1 border-gray-300 shadow-lg z-50"
          >
            {{ fileName }}
          </div>
        </div>
      </div>
      <input
        type="file"
        class="hidden"
        ref="fileInput"
        accept=".txt,.csv,text/plain,text/csv"
        @change="handleFileChange"
      />
    </div>

    <Teleport v-if="isDragging && hasDocument" to="body">
      <div class="fixed inset-0 bg-white/40 backdrop-blur-sm pointer-events-none z-20 transition" />
    </Teleport>
  </div>
</template>

<style scoped>
.fade-bottom-mask {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0));
}
</style>
