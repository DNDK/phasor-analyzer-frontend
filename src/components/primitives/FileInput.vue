<script setup lang="ts">
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import { onBeforeUnmount, onMounted, ref } from 'vue'

type TUploadedData = {
  time: number[]
  intensity: number[]
}

// const modelValue = defineModel()
const fileInput = ref<HTMLInputElement>()
const uploadedData = ref<TUploadedData>({ time: [], intensity: [] })

const fileName = ref<string>('')

// trash
const isDragging = ref(false)
const dragDepth = ref(0)

const readByCols = (text: string) => {
  const lines = text.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // пропускаем пустые строки
    if (!line) continue

    const parts = line.split(/\s+/)

    if (parts.length !== 2) {
      throw new Error('Each line must contain exactly two columns of data.')
    }
    try {
      uploadedData.value.time.push(parseFloat(parts[0]))
      uploadedData.value.intensity.push(parseFloat(parts[1]))
    } catch {
      throw new Error('Data must be numerical.')
    }
  }
}

const readFile = (file: File) => {
  const fileReader = new FileReader()
  fileReader.onload = () => {
    const data = fileReader.result?.toString() || ''
    try {
      readByCols(data)
      fileName.value = file.name
    } catch (e) {
      console.error(e)
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

  if (files[0].type !== 'text/plain') {
    console.log(files[0].type)
    return
  }

  readFile(files[0])
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()

  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  if (file.type === 'text/plain') return

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
        v-if="!uploadedData.time.length || !uploadedData.intensity.length"
        class="flex flex-col items-center justify-center w-full mx-auto"
      >
        <ArrowUpTrayIcon class="size-10" />
        <div class="">
          <span class="text-sky-600 font-semibold">Выберите </span>набор данных или
          <span class="text-sky-600 font-semibold">перетащите</span> его сюда
        </div>
      </div>
      <div v-else class="w-full overflow-hidden h-full relative">
        <div class="grid grid-cols-2 py-4 w-fit mx-auto fade-bottom-mask">
          <span class="mx-auto font-semibold text-black">Время</span>
          <span class="mx-auto font-semibold text-black">Интенсивность</span>
          <div class="flex flex-col gap-1 mx-auto">
            <span v-for="(t, i) in uploadedData.time.slice(0, 8)" :key="i">
              {{ t }}
            </span>
          </div>
          <div class="flex flex-col gap-1 mx-auto">
            <span v-for="(intens, i) in uploadedData.intensity.slice(0, 8)" :key="i">
              {{ intens }}
            </span>
          </div>
        </div>
        <div class="absolute bottom-0 w-full py-4 text-center text-black font-semibold">
          <div
            class="rounded-full bg-white/50 inline-block px-4 py-1 border-gray-300 shadow-lg z-50"
          >
            {{ fileName }}
          </div>
        </div>
      </div>
      <input type="file" class="hidden" ref="fileInput" @change="handleFileChange" />
    </div>

    <Teleport to="body">
      <div
        v-if="isDragging"
        class="fixed inset-0 bg-white/40 backdrop-blur-sm pointer-events-none z-20 transition"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.fade-bottom-mask {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0));
}
</style>
