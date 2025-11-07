<script setup lang="ts">
import { PaperClipIcon, ArrowUpTrayIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

import MockChart from '@/components/primitives/MockChart.vue'
import MockChartClean from '@/components/primitives/MockChartClean.vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const stage = ref<'upload' | 'preview' | 'result'>()
</script>

<template>
  <div class="h-full">
    <div class="w-2/3 mx-auto">
      <h1 class="text-3xl font-bold mb-8 leading-8">Новая задача</h1>
      <div class="border rounded-lg relative overflow-hidden space-y-15 p-14 card-background">
        <div class="absolute -top-30 -left-30 opacity-10 size-300 rotate-50">
          <img src="/hexagons.svg" class="size-full" />
        </div>
        <div class="absolute -bottom-80 -right-80 opacity-10 size-300 rotate-50">
          <img src="/hexagons.svg" class="size-full" />
        </div>
        <!-- <div
          class="bg-radial from-sky-600/30 to-sky-600/15 size-200 rounded-md absolute -top-100 -left-100 -z-20 blur-2xl"
        />
        <div
          class="bg-radial from-sky-500/20 to-sky-500/5 size-150 rounded-md absolute -bottom-100 -right-100 -z-20 blur-2xl"
        />
        <div
          class="bg-radial from-sky-500/40 to-sky-500/10 size-100 rounded-md absolute -top-25 right-50 -z-20 blur-2xl"
        /> -->
        <!-- <h1
          class="text-4xl font-bold bg-white w-full leading-24 sticky top-0 px-14 py-7 z-40   "
        >
          Новая задача
        </h1> -->
        <div class="gap-10 grid grid-cols-3 w-full divide-y-2 divide-sky-500">
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl">
            <h3 class="font-semibold leading-10 text-lg">Исходные данные</h3>
            <p class="text-gray-700 text text-justify">
              Набор экспериментальных данных — это временная зависимость интенсивности флюоресценции
              после импульса возбуждения (кривая затухания), которая была получена в ходе измерений.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border h-full col-span-2 rounded-lg flex flex-col gap-10 items-center justify-center text-gray-400 backdrop-blur-3xl"
          >
            <ArrowUpTrayIcon class="size-10" />
            <div class="">
              <span class="text-sky-600 font-semibold">Выберите </span>набор данных или
              <span class="text-sky-600 font-semibold">перетащите</span> его сюда
            </div>
          </div>

          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <h3 class="font-semibold leading-10 text-lg">Визуализация исходных данных</h3>
            <p class="text-gray-700 text text-justify">
              Кривая затухания — это запись того, как изменяется интенсивность флюоресценции во
              времени после короткого импульса возбуждения.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center text-gray-400 p-5 py-auto h-96 relative backdrop-blur-3xl"
          >
            <MockChart />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <h3 class="font-semibold leading-10 text-lg">Данные после обработки</h3>
            <p class="text-gray-700 text text-justify">
              Данные после анализа методом фазовых векторов — это обработанная зависимость, в
              которой исходная кривая затухания преобразована в фазовое представление, позволяющее
              оценить времена жизни и свойства системы по фазовому сдвигу и амплитуде
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center text-gray-400 p-5 py-auto h-96 relative backdrop-blur-3xl"
          >
            <MockChartClean />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <h3 class="font-semibold leading-10 text-lg">Визуализация исходных данных</h3>
            <p class="text-gray-700 text text-justify">
              Кривая затухания — это запись того, как изменяется интенсивность флюоресценции во
              времени после короткого импульса возбуждения.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center text-gray-400 p-5 py-auto h-96 relative backdrop-blur-3xl"
          >
            <MockChart />
          </div>
          <div class="bg-white/20 border-gray-100 border p-5 rounded-lg backdrop-blur-3xl my-auto">
            <h3 class="font-semibold leading-10 text-lg">Результаты анализа</h3>
            <p class="text-gray-700 text text-justify">
              Параметры a₁, a₂, а также τ₁ и τ₂ — это результаты аппроксимации кривой затухания
              биэкспоненциальной моделью. Коэффициенты a₁, a₂ задают вклад каждой компоненты, а
              времена жизни τ₁ и τ₂ отражают скорость затухания двух независимых процессов.
            </p>
          </div>
          <div
            class="bg-white/20 border-white/50 border w-full col-span-2 rounded-lg gap-10 items-center justify-center p-8 py-auto relative space-y-4 backdrop-blur-3xl"
          >
            <div class="font-semibold">
              По результатам анализа кривых затухания методом фазовых векторов были получены
              следующие значения:
            </div>
            <div>
              <span>Предэкспоненциальные коэффициенты</span>
              <Table>
                <TableCaption>Коэффициенты a1, a2 для набора</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead> № </TableHead>
                    <TableHead> a1 </TableHead>
                    <TableHead> a2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell class="font-medium"> 1 </TableCell>
                    <TableCell>0.9</TableCell>
                    <TableCell>0.1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium"> 2 </TableCell>
                    <TableCell>0.8</TableCell>
                    <TableCell>0.2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium"> 3 </TableCell>
                    <TableCell>0.7</TableCell>
                    <TableCell>0.3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <span>Времена жизни</span>
              <Table>
                <TableCaption>Времена жизни TAU1, TAU2 для набора</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead> TAU1 </TableHead>
                    <TableHead> TAU2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>1</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 flex w-full justify-end">
        <button
          class="px-6 py-2 rounded-lg border flex gap-4 hover:cursor-pointer bg-linear-30 from-sky-200/50 to-sky-200"
        >
          <img src="/pdficon.svg" class="size-6" />
          Экспортировать в PDF
          <ArrowRightIcon class="size-6 text-black/40" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-background {
  background: #83a4d4; /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #b6fbff, #83a4d4); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #b6fbff,
    #83a4d4
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
