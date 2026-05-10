<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import { ApiError } from '@/api/client'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const handleSubmit = async () => {
  errorMessage.value = null
  if (!username.value || !password.value) {
    errorMessage.value = 'Заполните все поля'
    return
  }

  isLoading.value = true
  try {
    const tokens = await login({ username: username.value, password: password.value })
    auth.setTokens(tokens.access_token, tokens.refresh_token)
    router.push('/')
  } catch (e) {
    if (e instanceof ApiError) {
      errorMessage.value =
        e.status === 401 || e.status === 400
          ? 'Неверный логин или пароль'
          : `Ошибка сервера (${e.status}): ${e.message}`
    } else {
      errorMessage.value = 'Не удалось подключиться к серверу'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <RouterLink to="/" class="inline-flex items-center gap-3 mb-6">
          <div class="size-12 rounded-2xl bg-sky-900 text-white flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div class="leading-tight text-left">
            <div class="text-2xl font-bold text-slate-900">Analyzer</div>
            <div class="text-sm text-slate-500">Фазовый анализ кривых</div>
          </div>
        </RouterLink>
        <h1 class="text-3xl font-bold text-slate-900">Вход в систему</h1>
        <p class="text-slate-500 mt-2">Введите данные аккаунта для продолжения</p>
      </div>

      <div class="rounded-3xl border border-slate-100 bg-white shadow-xl shadow-sky-100 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="username">
              Имя пользователя
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="username"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="password">
              Пароль
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <div
            v-if="errorMessage"
            class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-800 transition disabled:opacity-60"
          >
            {{ isLoading ? 'Входим...' : 'Войти' }}
          </button>
        </form>

        <p class="text-center text-sm text-slate-500 mt-6">
          Нет аккаунта?
          <RouterLink to="/register" class="font-semibold text-sky-700 hover:text-sky-900">
            Зарегистрироваться
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
