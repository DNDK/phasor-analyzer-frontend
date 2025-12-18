<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, onBeforeMount, computed } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

import { getAllTasks } from '@/api/tasks'
import type { Task } from '@/types/task'
import StatusGauge from '@/components/primitives/StatusGauge.vue'

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
  <div class="space-y-12">
    <section
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-600 text-white shadow-xl"
    >
      <div
        class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_45%)] blur-3xl"
      />
      <div class="absolute -left-20 -bottom-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div class="relative px-12 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div class="space-y-6">
          <p class="text-sm uppercase tracking-[0.2em] text-white/70">{{ greeting }}</p>
          <h1 class="text-5xl font-bold leading-tight">
            Фазовый анализ кривых <span class="text-sky-200">в один клик</span>
          </h1>
          <p class="text-lg text-white/80">
            Загружайте кривые затухания, запускайте расчёт и сравнивайте результаты — Analyzer
            собирает кривые, коэффициенты и времена жизни на одном экране.
          </p>
          <div class="flex flex-wrap gap-4">
            <RouterLink
              to="/create-task"
              class="inline-flex items-center gap-2 rounded-xl bg-white text-sky-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-sky-900/40 hover:-translate-y-0.5 transition"
            >
              Начать новую задачу
              <ArrowRightIcon class="size-5" />
            </RouterLink>
            <RouterLink
              to="/tasks"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              История задач
            </RouterLink>
          </div>
        </div>
        <div
          class="grid grid-cols-3 gap-8 bg-white/5 rounded-2xl border border-white/10 p-5 backdrop-blur"
        >
          <div class="stat-tile">
            <div class="text-xs text-white/60">Всего задач</div>
            <div class="text-4xl font-bold">{{ tasksTotal }}</div>
            <div class="text-xs text-white/60">обработаны или в очереди</div>
          </div>
          <div class="stat-tile">
            <div class="text-xs text-white/60">С готовыми результатами</div>
            <div class="text-4xl font-bold text-emerald-200">{{ tasksWithResults }}</div>
            <div class="text-xs text-white/60">коэффициенты и tau рассчитаны</div>
          </div>
          <div class="stat-tile">
            <div class="text-xs text-white/60">API</div>
            <div class="text-4xl font-bold">/api</div>
            <div class="text-xs text-white/60">FastAPI · ECharts · Vue 3</div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
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
                Analyzer строит фазоры, конволюции и нормализованные кривые для расчёта.
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
          <div class="space-y-3">
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

      <div class="space-y-6">
        <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
          <h3 class="text-lg font-semibold mb-3">Мониторинг</h3>
          <div class="flex gap-6 justify-between w-full">
            <div class="flex flex-col items-center gap-2">
              <StatusGauge :value="70" />
              <span class="text-sm font-semibold text-slate-700">CPU</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <StatusGauge :value="55" />
              <span class="text-sm font-semibold text-slate-700">RAM</span>
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-4">Данные условные — подключите реальные метрики.</p>
        </div>
        <div class="rounded-2xl border border-slate-100 bg-white/90 shadow-lg shadow-sky-50 p-6">
          <h3 class="text-lg font-semibold mb-3">Шаблоны запусков</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li>• Базовый скан — быстрый прогон с шумом</li>
            <li>• Полный спектр — несколько кривых с IRF</li>
            <li>• Пользовательские данные — CSV/TSV загрузка</li>
          </ul>
          <RouterLink
            to="/create-task"
            class="mt-4 inline-flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50"
          >
            Открыть конструктор
            <ArrowRightIcon class="size-4" />
          </RouterLink>
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
