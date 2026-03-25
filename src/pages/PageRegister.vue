<template>
  <div class="card bg-base-100 shadow-xl w-full max-w-sm">
    <div class="card-body">
      <h2 class="card-title justify-center mb-2">Регистрация</h2>

      <div v-if="error" class="alert alert-error text-sm py-2">{{ error }}</div>

        <form @submit.prevent="submit" class="space-y-4">
          <div class="form-control">
            <div class="label"><span class="label-text">Email</span></div>
            <input
              v-model="email"
              type="email"
              class="input input-bordered w-full"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-control">
            <div class="label"><span class="label-text">Пароль</span></div>
            <input
              v-model="password"
              type="password"
              class="input input-bordered w-full"
              placeholder="Минимум 8 символов"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Зарегистрироваться
          </button>
        </form>

        <p class="text-center text-sm text-base-content/60 mt-2">
          Уже есть аккаунт?
          <RouterLink to="/login" class="link link-primary">Войти</RouterLink>
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(email.value, password.value)
    router.push('/players')
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string } } }
    error.value = axiosErr.response?.data?.error ?? 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>
