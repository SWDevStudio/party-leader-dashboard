<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box max-w-lg">
      <!-- Header -->
      <h3 class="font-bold text-lg">Посещение осады</h3>
      <p v-if="siege" class="text-sm text-base-content/50 mt-0.5 mb-1">
        {{ fmtDate(siege.date) }} · Слотов: {{ siege.totalSlots }}
      </p>

      <!-- Counts legend -->
      <div class="flex gap-3 mb-4 text-xs flex-wrap">
        <span class="flex items-center gap-1">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-success"></span>
          Пришли: <strong>{{ countByState('attended') }}</strong>
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-error/60"></span>
          Не взяли: <strong>{{ countByState('benched') }}</strong>
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-warning/70"></span>
          Пропустил сам: <strong>{{ countByState('absent') }}</strong>
          <span class="text-base-content/30">(не учит. в ротации)</span>
        </span>
      </div>

      <!-- Search + quick actions -->
      <div class="flex gap-2 mb-3">
        <input
          v-model="search"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="Поиск..."
        />
        <button class="btn btn-xs btn-ghost" @click="setAll('attended')">Все пришли</button>
        <button class="btn btn-xs btn-ghost" @click="setAll('benched')">Сброс</button>
      </div>

      <!-- Player list -->
      <div class="max-h-96 overflow-y-auto rounded-box border border-base-200 divide-y divide-base-200">
        <div
          v-for="player in filtered"
          :key="player.id"
          class="flex items-center gap-2 px-3 py-2"
          :class="{
            'bg-success/5':  states[player.id] === 'attended',
            'bg-warning/5':  states[player.id] === 'absent',
          }"
        >
          <!-- Player info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-medium text-sm truncate">{{ player.gameSurname }}</span>
              <span class="text-xs text-base-content/35 truncate">{{ player.discordNick }}</span>
            </div>
            <div class="flex gap-1 mt-0.5 flex-wrap">
              <span
                v-for="role in classRoles(player.classId)"
                :key="role"
                class="badge badge-xs"
                :class="roleBadgeClass(role)"
              >{{ role }}</span>
            </div>
          </div>

          <!-- 3-state toggle -->
          <div class="join shrink-0">
            <button
              class="join-item btn btn-xs"
              :class="states[player.id] === 'attended' ? 'btn-success' : 'btn-ghost opacity-40'"
              title="Пришёл"
              @click="setState(player.id, 'attended')"
            >✓ Пришёл</button>
            <button
              class="join-item btn btn-xs"
              :class="states[player.id] === 'absent' ? 'btn-warning' : 'btn-ghost opacity-40'"
              title="Пропустил сам (не учитывается в ротации)"
              @click="setState(player.id, 'absent')"
            >✗ Пропустил</button>
            <button
              class="join-item btn btn-xs"
              :class="states[player.id] === 'benched' ? 'btn-neutral' : 'btn-ghost opacity-40'"
              title="Не взяли (ротационный пропуск)"
              @click="setState(player.id, 'benched')"
            >— Бенч</button>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="text-center py-6 text-base-content/40 text-sm">
          Никого не найдено
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="close">Отмена</button>
        <button class="btn btn-primary" @click="save">Сохранить</button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop" @submit.prevent="close">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { store, setSiegeAttendance } from '@/store'
import type { SiegeEvent, Role } from '@/types'
import { roleBadgeClass } from '@/utils/roles'

type AttendState = 'attended' | 'absent' | 'benched'

const props = defineProps<{ siege?: SiegeEvent }>()
const emit  = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLDialogElement>()
const search   = ref('')

// player.id → state
const states = reactive<Record<string, AttendState>>({})

watch(
  () => props.siege,
  (s) => {
    // Reset all players to benched, then apply saved states
    for (const p of store.players) states[p.id] = 'benched'
    if (s) {
      for (const id of s.attendees)  states[id] = 'attended'
      for (const id of (s.absentees ?? [])) states[id] = 'absent'
    }
  },
  { immediate: true },
)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.players.filter(
    p => !q || p.gameSurname.toLowerCase().includes(q) || p.discordNick.toLowerCase().includes(q),
  )
})

function setState(id: string, state: AttendState) {
  states[id] = state
}

function setAll(state: AttendState) {
  for (const p of store.players) states[p.id] = state
}

function countByState(state: AttendState): number {
  return store.players.filter(p => states[p.id] === state).length
}

function classRoles(classId: string): Role[] {
  return store.classes.find(c => c.id === classId)?.roles ?? []
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function open() { dialogEl.value?.showModal() }
function close() { dialogEl.value?.close(); emit('close') }

function save() {
  if (props.siege) {
    const attended = store.players.filter(p => states[p.id] === 'attended').map(p => p.id)
    const absent   = store.players.filter(p => states[p.id] === 'absent').map(p => p.id)
    setSiegeAttendance(props.siege.id, attended, absent)
  }
  close()
}

defineExpose({ open })
</script>

