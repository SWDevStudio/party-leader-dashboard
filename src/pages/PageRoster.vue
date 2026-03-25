<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Ростер</h2>
        <p class="text-sm text-base-content/50 mt-0.5">Идеальный состав на 20 слотов</p>
      </div>
    </div>

    <div class="alert alert-info mb-4 max-w-md text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p>Укажи, <strong>сколько слотов каждого класса</strong> должно быть в идеальном рейде на 20 человек.</p>
        <p class="mt-1 opacity-80">Если на осаде меньше игроков — алгоритм автоматически подберёт лучший состав из тех, кто есть, сохраняя пропорции.</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm w-80">
      <div class="card-body gap-2 p-5">
        <div
          v-for="role in ALL_ROLES"
          :key="role"
          class="flex items-center gap-3"
          data-testid="roster-role-row"
        >
          <span class="badge badge-sm flex-1 justify-start" :class="roleBadgeClass(role)">
            {{ role }}
          </span>
          <div class="flex items-center gap-1">
            <button
              class="btn btn-xs btn-ghost w-7"
              :data-testid="`roster-dec-${role}`"
              @click="decrement(role)"
            >−</button>
            <span class="text-sm w-5 text-center font-mono">{{ rosterStore.config[role] }}</span>
            <button
              class="btn btn-xs btn-ghost w-7"
              :data-testid="`roster-inc-${role}`"
              @click="increment(role)"
            >+</button>
          </div>
        </div>

        <div class="divider my-0"></div>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Итого</span>
          <span class="text-sm font-bold" :class="totalClass">{{ total }} / 20</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ALL_ROLES, type Role } from '@/types'
import { useRosterStore } from '@/store/roster'
import { roleBadgeClass } from '@/utils/roles'

const rosterStore = useRosterStore()

onMounted(() => { rosterStore.fetchRoster() })

const total = computed(() =>
  ALL_ROLES.reduce((sum, role) => sum + (rosterStore.config[role] ?? 0), 0),
)

const totalClass = computed(() => (total.value === 20 ? 'text-success' : 'text-warning'))

function increment(role: Role) {
  rosterStore.setRoleCount(role, (rosterStore.config[role] ?? 0) + 1)
}

function decrement(role: Role) {
  rosterStore.setRoleCount(role, (rosterStore.config[role] ?? 0) - 1)
}
</script>
