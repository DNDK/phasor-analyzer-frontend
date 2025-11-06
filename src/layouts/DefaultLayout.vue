<script setup lang="ts">
import MainHeader from '@/components/primitives/MainHeader.vue'
</script>

<template>
  <MainHeader />
  <main class="min-h-dvh p-16">
    <slot />
  </main>
  <footer class="h-40 bg-yellow-300">made by</footer>
</template>
