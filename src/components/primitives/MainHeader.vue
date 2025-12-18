<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm"
  >
    <div class="relative overflow-hidden">
      <div class="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-sky-200/50 to-white/0" />
      <div class="mx-auto flex max-w-7xl items-center justify-between px-10 py-5 relative">
        <RouterLink to="/" class="flex items-center gap-3">
          <div
            class="size-10 rounded-2xl bg-sky-900 text-white flex items-center justify-center font-bold"
          >
            A
          </div>
          <div class="leading-tight">
            <div class="text-xl font-bold text-slate-900">Analyzer</div>
            <div class="text-xs text-slate-600">Фазовый анализ кривых</div>
          </div>
        </RouterLink>
        <nav class="flex items-center gap-4 text-sm font-semibold text-slate-700">
          <RouterLink class="nav-link" to="/create-task">Создать задачу</RouterLink>
          <RouterLink class="nav-link" to="/tasks">История</RouterLink>
          <RouterLink class="nav-link" to="/">Главная</RouterLink>
        </nav>
        <div class="hidden md:flex items-center gap-3">
          <span class="text-xs uppercase tracking-[0.2em] text-sky-800">beta</span>
          <span
            class="rounded-full bg-sky-100 text-sky-900 text-xs px-3 py-1 border border-sky-200"
          >
            FastAPI · Vue 3
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="postcss">
.nav-link {
  @apply px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors;
}
</style>
