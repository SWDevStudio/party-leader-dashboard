<template>
  <div class="min-h-screen bg-base-300 flex">
    <AppSidebar />
    <main class="flex-1 min-h-screen overflow-auto p-6 lg:p-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './components/layout/AppSidebar.vue'
</script>
