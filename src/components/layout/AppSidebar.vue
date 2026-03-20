<template>
  <aside class="w-56 bg-base-100 min-h-screen flex flex-col border-r border-base-200 shrink-0">
    <!-- Logo -->
    <div class="px-5 py-5 border-b border-base-200">
      <div class="flex items-center gap-2">
        <span class="text-2xl">⚔️</span>
        <div>
          <p class="font-bold text-base leading-tight">Guild HQ</p>
          <p class="text-xs text-base-content/40 leading-tight">Node War Manager</p>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <button
        v-for="item in NAV"
        :key="item.view"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          modelValue === item.view
            ? 'bg-primary text-primary-content'
            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
        "
        @click="$emit('update:modelValue', item.view)"
      >
        <span class="text-lg leading-none">{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </nav>

    <!-- Footer stats -->
    <div class="px-5 py-3 border-t border-base-200 text-xs text-base-content/40 space-y-0.5">
      <div>{{ store.players.length }} игроков</div>
      <div>{{ store.siegeEvents.length }} осад</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { store } from '../../store'
import type { AppView } from '../../types'

defineProps<{ modelValue: AppView }>()
defineEmits<{ 'update:modelValue': [view: AppView] }>()

const NAV: { view: AppView; icon: string; label: string }[] = [
  { view: 'players',  icon: '👥', label: 'Игроки'  },
  { view: 'sieges',   icon: '🏰', label: 'Осады'   },
  { view: 'rotation', icon: '🔄', label: 'Ротация' },
]
</script>
