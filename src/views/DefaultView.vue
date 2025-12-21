<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, onBeforeMount, computed } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

import { getAllTasks } from '@/api/tasks'
import type { Task } from '@/types/task'

const tasks = ref<Task[] | null>(null)

onBeforeMount(async () => {
  const response = await getAllTasks()
  tasks.value = response.data.value
})

const greeting = computed(() => {
  const currentDate = new Date()

  if (currentDate.getHours() < 12) {
    return 'Доброе утро!'
  } else if (currentDate.getHours() < 18) {
    return 'Добрый день'
  } else {
    return 'Добрый вечер'
  }
})

const tasksTotal = computed(() => tasks.value?.length ?? 0)
const tasksWithResults = computed(
  () => tasks.value?.filter((task) => Boolean(task.analysis_results)).length ?? 0,
)
</script>

<template>
  <div class="space-y-12 w-full flex flex-col justify-center items-center">
    <section
      class="rounded-3xl border border-slate-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 shadow-lg shadow-sky-50 px-10 py-12 mb-12 w-full"
    >
      <div class="grid lg:grid-cols-2 gap-8 items-center">
        <div class="lg:col-span-2 space-y-4">
          <!-- <p class="text-sm uppercase tracking-[0.2em] text-sky-800 font-semibold">Приветствие</p> -->
          <h1 class="text-4xl font-bold text-slate-900">{{ greeting }}</h1>
          <p class="text-base text-slate-700 max-w-3xl leading-7">
            Подготовьте данные, запустите анализ и сравните результаты с предыдущими задачами.
            Используйте историю для быстрых сравнений и возвращения к расчётам.
          </p>
          <div class="flex flex-wrap gap-3">
            <RouterLink
              to="/create-task"
              class="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50"
            >
              Создать задачу
              <ArrowRightIcon class="size-4" />
            </RouterLink>
            <RouterLink
              to="/tasks"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              История задач
              <ArrowRightIcon class="size-4" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-sky-700 font-semibold">Шаги</p>
              <h2 class="text-2xl font-bold">Как работает Analyzer</h2>
            </div>
            <RouterLink
              to="/create-task"
              class="inline-flex items-center gap-2 rounded-xl bg-sky-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-800"
            >
              Создать задачу
            </RouterLink>
          </div>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="step-card">
              <div class="step-index">1</div>
              <h3 class="font-semibold">Загрузка кривых</h3>
              <p class="text-sm text-gray-600">
                Импортируйте экспериментальные данные: время, IRF и интенсивности.
              </p>
            </div>
            <div class="step-card">
              <div class="step-index">2</div>
              <h3 class="font-semibold">Обработка</h3>
              <p class="text-sm text-gray-600">
                Analyzer проводит полный цикл анализа методом фазовых векторов.
              </p>
            </div>
            <div class="step-card">
              <div class="step-index">3</div>
              <h3 class="font-semibold">Результаты</h3>
              <p class="text-sm text-gray-600">
                Получите τ₁/τ₂, коэффициенты a₁/a₂ и графики для сравнения запусков.
              </p>
            </div>
          </div>
        </div>
        <div
          class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-8 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Недавние задачи</h2>
            <RouterLink
              to="/tasks"
              class="text-sm font-semibold text-sky-900 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50"
            >
              Все задачи
            </RouterLink>
          </div>
          <div class="flex flex-col gap-4">
            <RouterLink
              v-for="task in tasks?.slice(0, 5) || []"
              :key="task.id"
              class="group"
              :to="`/tasks/${task.id}`"
            >
              <div
                class="w-full relative h-18 rounded-xl border border-slate-100 bg-white/70 font-semibold p-4 flex gap-5 group-hover:border-sky-200 group-hover:bg-sky-50 items-center"
              >
                <div class="w-full flex flex-col">
                  <span class="text-slate-900">{{ task.title }}</span>
                  <span class="text-xs text-slate-500">{{
                    new Date(task.created_at).toLocaleString()
                  }}</span>
                </div>
                <div class="text-gray-400 relative h-full flex items-center">
                  <ArrowRightIcon
                    class="size-5 absolute group-hover:right-0 right-1/4 duration-200 opacity-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </RouterLink>
            <div v-if="!tasks?.length" class="text-sm text-gray-700">
              Список пуст — создайте первую задачу, чтобы увидеть её здесь.
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.stat-tile {
  @apply rounded-xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/10;
}
.step-card {
  @apply rounded-xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-100;
}
.step-index {
  @apply mb-3 size-8 rounded-full bg-sky-100 text-sky-900 text-sm font-bold flex items-center justify-center;
}
</style>
