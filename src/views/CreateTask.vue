<script setup lang="ts">
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
const stage = ref<'upload' | 'process'>()
</script>

<template>
  <div>
    <h1 class="">Новая задача</h1>
    <div class="flex flex-col">
      <div class="border rounded-lg h-full p-48 w-fit text-gray-500" @click="stage = 'process'">
        <PaperClipIcon class="size-56" />
        <span>Загрузите набор данных</span>
      </div>
    </div>
  </div>
</template>
