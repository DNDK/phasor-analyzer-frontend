<script setup lang="ts">
import MainHeader from '@/components/primitives/MainHeader.vue'
</script>

<template>
  <MainHeader />
  <main class="min-h-dvh p-16 relative">
    <div class="h-200 sparkle fixed top-0 left-0 blur-3xl -z-10" />
    <slot />
  </main>
  <footer class="h-40 bg-yellow-300">made by</footer>
</template>

<style scoped>
.sparkle {
  background: #80f7ff;
  background: radial-gradient(
    circle,
    rgba(128, 247, 255, 1) 0%,
    rgba(189, 234, 255, 1) 49%,
    rgba(191, 255, 254, 1) 100%
  );
}
</style>
