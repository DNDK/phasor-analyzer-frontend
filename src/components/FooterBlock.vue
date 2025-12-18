<template>
  <footer class="relative w-full border-t border-white/70 bg-slate-900 text-white overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-cyan-400/10 to-transparent" />
    <div class="absolute -bottom-24 -right-16 size-72 rounded-full bg-sky-400/20 blur-3xl" />
    <div class="absolute -top-28 left-0 size-80 rounded-full bg-cyan-300/15 blur-3xl" />

    <div class="relative mx-auto max-w-7xl px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="size-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold"
          >
            A
          </div>
          <div>
            <div class="text-xl font-bold">Analyzer</div>
            <div class="text-xs text-white/70">Фазовый анализ кривых</div>
          </div>
        </div>
        <p class="text-sm text-white/70 max-w-sm">
          Обработка кривых затухания флюоресценции с помощью метода фазовых векторов.
        </p>
        <div class="flex gap-3 text-xs text-white/60">
          <span class="px-3 py-1 rounded-full border border-white/20 bg-white/5">FastAPI</span>
          <span class="px-3 py-1 rounded-full border border-white/20 bg-white/5">Vue 3</span>
          <span class="px-3 py-1 rounded-full border border-white/20 bg-white/5">ECharts</span>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Разработка</h3>
        <div class="space-y-1 text-white/70">
          <div>Дубовец А. С.</div>
          <div>Дигрис А. В.</div>
        </div>
        <div class="text-sm text-white/60">
          Контакты:
          <a class="underline-offset-2 hover:underline" href="mailto: rct.dubovecas@bsu.by"
            >rct.dubovecas@bsu.by</a
          >
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Литература</h3>
        <ul class="space-y-1 text-white/70 text-sm">
          <li>Lakowicz J.R. Principles of Fluorescence Spectroscopy</li>
          <li>O'Connor D.V., Phillips D. Time-Correlated Single Photon Counting</li>
          <li>Demchenko A.P. Introduction to Fluorescence Sensing</li>
          <li>Valeur B. Molecular Fluorescence</li>
        </ul>
      </div>
    </div>

    <div
      class="relative border-t border-white/10 px-10 py-4 text-xs text-white/50 flex justify-between max-w-7xl mx-auto"
    >
      <span>© {{ new Date().getFullYear() }} Analyzer</span>
      <span>beta build</span>
    </div>
  </footer>
</template>
