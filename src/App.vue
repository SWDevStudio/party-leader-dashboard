<template>
  <div v-if="authStore.isAuthenticated" class="min-h-screen bg-base-300 flex">
    <AppSidebar />
    <main class="flex-1 min-h-screen overflow-auto p-6 lg:p-8">
      <RouterView />
    </main>
  </div>
  <div v-else class="min-h-screen bg-base-300 flex items-center justify-center p-4">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import AppSidebar from './components/layout/AppSidebar.vue'

const authStore = useAuthStore()
</script>
