<script setup lang="ts">
import { defineEmits } from 'vue'

import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  FormField,
  Form,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

import { Switch } from '@/components/ui/switch/'

import { Input } from '@/components/ui/input'
import type { TDataSet, CurveInputEmits } from './types'
import Button from '@/components/ui/button/Button.vue'

const emits = defineEmits<CurveInputEmits>()

const formSchema = toTypedSchema(
  z.object({
    a1: z.coerce.number().min(0.1).max(0.9),
    tau1: z.coerce.number(),
    tau2: z.coerce.number(),
    dt: z.coerce.number(),
    num_points: z.coerce.number(),
    apply_convolution: z.boolean(),
    add_noise: z.boolean(),
  }),
)

const { isSubmitting, ...form } = useForm({
  validationSchema: formSchema,
  initialValues: {
    a1: 0.1,
    tau1: 1,
    tau2: 3,
    dt: 0.05,
    num_points: 511,
    apply_convolution: true,
    add_noise: true,
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  const resp: { plots: TDataSet } = await fetch('/api/tasks/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      a1: values.a1,
      tau1: values.tau1,
      tau2: values.tau2,
      dt: values.dt,
      num_points: values.num_points,
      apply_convolution: values.apply_convolution,
      add_noise: values.add_noise,
    }),
  }).then((res) => res.json())

  emits('trigger:curve-data', resp.plots)
})
</script>

<template>
  <h1 class="leading-7 font-semibold text-xl text-gray-600 mb-4">Параметры кривой</h1>
  <form
    class="flex flex-col gap-8 py-4 px-8 rounded-lg bg-white shadow-gray-300 shadow-md"
    @submit.prevent="onSubmit"
  >
    <FormField name="a1" v-slot="{ componentField }" :validate-on-blur="true">
      <FormItem>
        <FormLabel>a1</FormLabel>
        <FormControl>
          <NumberField v-bind="componentField" :step="0.1" :max="0.9" :min="0.1">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="tau1" v-slot="{ componentField }" :validate-on-blur="true">
      <FormItem>
        <FormLabel>TAU1</FormLabel>
        <FormControl>
          <NumberField v-bind="componentField" :step="0.1">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="tau2" v-slot="{ componentField }" :validate-on-blur="true">
      <FormItem>
        <FormLabel>TAU2</FormLabel>
        <FormControl>
          <NumberField v-bind="componentField" :step="0.1">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="dt" v-slot="{ componentField }" :validate-on-blur="true">
      <FormItem>
        <FormLabel>dt</FormLabel>
        <FormControl>
          <NumberField v-bind="componentField" :step="0.01">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="num_points" v-slot="{ componentField }" :validate-on-blur="true">
      <FormItem>
        <FormLabel>Кол-во точек</FormLabel>
        <FormControl>
          <NumberField v-bind="componentField" :step="10">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="flex justify-center gap-5 w-full">
      <FormField name="apply_convolution" v-slot="{ componentField }" :validate-on-blur="true">
        <FormItem class="flex items-center space-x-2">
          <FormControl>
            <Switch />
          </FormControl>
          <FormLabel v-bind="componentField">Свертка </FormLabel>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="add_noise" v-slot="{ componentField }" :validate-on-blur="true">
        <FormItem class="flex items-center space-x-2">
          <FormControl>
            <Switch v-bind="componentField" />
          </FormControl>
          <FormLabel>Шум</FormLabel>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <Button type="submit">Сохранить</Button>
  </form>

  <!-- <Form class="w-1/2 text-sm" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <Label for="a1">a1</Label>
        <NumberFieldRoot id="a1" class="flex gap-2" :min="0.1" :max="0.9" :step="0.1" v-model="a1">
          <NumberFieldDecrement
            class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
          >
            <ChevronDownIcon class="size-4" />
          </NumberFieldDecrement>
          <NumberFieldInput class="rounded-md border-gray-600 border px-3 text-center" />
          <NumberFieldIncrement
            class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
          >
            <ChevronUpIcon class="size-4" />
          </NumberFieldIncrement>
        </NumberFieldRoot>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="tau1">tau1</Label>
        <NumberFieldRoot id="a1" class="flex gap-2" :min="0.1" :step="0.1" v-model="tau1">
          <NumberFieldDecrement
            class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
          >
            <ChevronDownIcon class="size-4" />
          </NumberFieldDecrement>
          <NumberFieldInput class="rounded-md border-gray-600 border px-3 text-center" />
          <NumberFieldIncrement
            class="bg-amber-300 size-6 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200"
          >
            <ChevronUpIcon class="size-4" />
          </NumberFieldIncrement>
        </NumberFieldRoot>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="tau2">tau2</Label>
        <input name="tau2" class="rounded-md border-gray-600 border px-3" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="dt">dt</Label>
        <input name="dt" class="rounded-md border-gray-600 border px-3" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="num_points">Кол-во точек</Label>
        <input name="num_points" class="rounded-md border-gray-600 border px-3" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="apply_convolution">Добавить свертку</Label>
        <input name="a1" class="rounded-md border-gray-600 border px-3" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="add_noise">Добавить шум</Label>
        <input name="add_noise" class="rounded-md border-gray-600 border px-3" />
      </div>
    </div>

    <button
      type="submit"
      class="bg-amber-300 rounded-md text-white flex justify-center items-center cursor-pointer hover:bg-amber-200 mt-8 py-2 px-4 font-bold"
    >
      Сгенерировать
    </button>
  </Form> -->
</template>
