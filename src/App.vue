<template>
  <div class="min-h-screen bg-base-300 flex">
    <AppSidebar v-model="view" />
    <main class="flex-1 min-h-screen overflow-auto p-6 lg:p-8">
      <PlayersView  v-if="view === 'players'"  />
      <SiegesView   v-else-if="view === 'sieges'"   />
      <RotationView v-else-if="view === 'rotation'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AppView } from './types'
import AppSidebar   from './components/layout/AppSidebar.vue'
import PlayersView  from './components/players/PlayersView.vue'
import SiegesView   from './components/sieges/SiegesView.vue'
import RotationView from './components/rotation/RotationView.vue'

const view = ref<AppView>('players')
</script>
