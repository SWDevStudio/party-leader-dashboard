<template>
  <div class="card bg-base-100 shadow-xl w-full max-w-sm">
    <div class="card-body text-center">
      <div v-if="loading" class="py-6">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-3 text-base-content/60">Подтверждение email...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <p class="text-4xl">❌</p>
        <h2 class="card-title justify-center">Ссылка недействительна</h2>
        <p class="text-base-content/60 text-sm">{{ error }}</p>
        <RouterLink to="/login" class="btn btn-ghost btn-sm">Перейти ко входу</RouterLink>
      </div>

      <div v-else class="space-y-4 py-4">
        <p class="text-4xl">✅</p>
        <h2 class="card-title justify-center">Email подтверждён!</h2>
        <p class="text-base-content/60 text-sm">Вы автоматически войдёте в систему.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    loading.value = false
    error.value = 'Токен не указан'
    return
  }

  try {
    await auth.verifyEmail(token)
    loading.value = false
    setTimeout(() => router.push('/players'), 1500)
  } catch (err: unknown) {
    loading.value = false
    const axiosErr = err as { response?: { data?: { error?: string } } }
    error.value = axiosErr.response?.data?.error ?? 'Не удалось подтвердить email'
  }
})
</script>
