<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box w-11/12 max-w-4xl max-h-[90vh]">
      <!-- Header -->
      <h3 class="font-bold text-lg">Посещение осады</h3>
      <p v-if="siege" class="text-sm text-base-content/50 mt-0.5 mb-1">
        {{ fmtDate(siege.date) }} · Слотов: {{ siege.totalSlots }}
      </p>

      <!-- Counts legend -->
      <div class="flex gap-4 mb-4 text-sm flex-wrap">
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
          <span class="text-base-content/30 text-xs">(не учит. в ротации)</span>
        </span>
      </div>

      <!-- Quick actions -->
      <div class="flex gap-2 mb-3 justify-end">
        <button class="btn btn-sm btn-outline btn-primary" data-testid="attendance-auto-rotate" @click="applyRotation">★ Ротация</button>
        <button class="btn btn-sm btn-ghost" data-testid="attendance-set-all-attended" @click="setAll('attended')">Все пришли</button>
        <button class="btn btn-sm btn-ghost" data-testid="attendance-reset" @click="setAll('benched')">Сброс</button>
      </div>

      <!-- Player list -->
      <div class="max-h-96 overflow-y-auto rounded-box border border-base-200 divide-y divide-base-200">
        <div
          v-for="player in sortedPlayers"
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
              <span class="font-medium text-base truncate">{{ player.gameSurname }}</span>
              <span class="text-sm text-base-content/50 truncate">{{ player.discordNick }}</span>
            </div>
            <div class="flex gap-1 mt-0.5 flex-wrap items-center">
              <span
                v-for="role in playersStore.getPlayerRoles(player)"
                :key="role"
                class="badge badge-xs"
                :class="roleBadgeClass(role)"
              >{{ role }}</span>
              <span class="text-sm text-base-content/40 ml-1">
                <template v-if="((statsMap[player.id]?.totalSieges ?? 0) - (statsMap[player.id]?.attended ?? 0)) > 0">
                  {{ (statsMap[player.id]?.totalSieges ?? 0) - (statsMap[player.id]?.attended ?? 0) }}× недопущен
                  <template v-if="(statsMap[player.id]?.consecutiveMisses ?? 0) > 0">
                    &middot; <span class="text-warning">{{ statsMap[player.id].consecutiveMisses }}× подряд</span>
                  </template>
                </template>
              </span>
            </div>
          </div>

          <!-- 3-state toggle -->
          <div class="join shrink-0">
            <button
              class="join-item btn btn-sm"
              :class="states[player.id] === 'attended' ? 'btn-success' : 'btn-ghost opacity-40'"
              title="Пришёл"
              @click="setState(player.id, 'attended')"
            >✓ Пришёл</button>
            <button
              class="join-item btn btn-sm"
              :class="states[player.id] === 'benched' ? 'btn-neutral' : 'btn-ghost opacity-40'"
              title="Не взяли (ротационный пропуск)"
              @click="setState(player.id, 'benched')"
            >— Недопущен</button>
            <button
              class="join-item btn btn-sm"
              :class="states[player.id] === 'absent' ? 'btn-warning' : 'btn-ghost opacity-40'"
              title="Пропустил сам (не учитывается в ротации)"
              @click="setState(player.id, 'absent')"
            >✗ Пропустил</button>
            
          </div>
        </div>

        <div v-if="sortedPlayers.length === 0" class="text-center py-6 text-base-content/40 text-sm">
          Нет игроков
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
import { usePlayersStore } from '@/store/players'
import { useSiegesStore } from '@/store/sieges'
import { useRosterStore } from '@/store/roster'
import type { SiegeEvent } from '@/types'
import { roleBadgeClass } from '@/utils/roles'
import { computeAllStats, sortByPriority, buildRotation } from '@/utils/rotation'

const playersStore = usePlayersStore()
const siegesStore  = useSiegesStore()
const rosterStore  = useRosterStore()

type AttendState = 'attended' | 'absent' | 'benched'

const props = defineProps<{ siege?: SiegeEvent }>()
const emit  = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLDialogElement>()

const allStats = computed(() => computeAllStats(playersStore.players, siegesStore.siegeEvents))
const statsMap = computed(() =>
  Object.fromEntries(allStats.value.map(s => [s.player.id, s]))
)
const sortedPlayers = computed(() =>
  sortByPriority(allStats.value).map(s => s.player)
)

// player.id → state
const states = reactive<Record<string, AttendState>>({})

watch(
  () => props.siege,
  (s) => {
    for (const p of playersStore.players) states[p.id] = 'benched'
    if (s) {
      for (const id of s.attendees)  states[id] = 'attended'
      for (const id of (s.absentees ?? [])) states[id] = 'absent'
    }
  },
  { immediate: true },
)


function setState(id: string, state: AttendState) {
  states[id] = state
}

function setAll(state: AttendState) {
  for (const p of playersStore.players) states[p.id] = state
}

function applyRotation() {
  if (!props.siege) return
  const attending = buildRotation(
    allStats.value,
    rosterStore.config,
    props.siege.totalSlots,
    (player) => playersStore.getPlayerRoles(player),
  )
  for (const p of playersStore.players) {
    states[p.id] = attending.has(p.id) ? 'attended' : 'benched'
  }
}

function countByState(state: AttendState): number {
  return playersStore.players.filter(p => states[p.id] === state).length
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
    const attended = playersStore.players.filter(p => states[p.id] === 'attended').map(p => p.id)
    const absent   = playersStore.players.filter(p => states[p.id] === 'absent').map(p => p.id)
    siegesStore.setSiegeAttendance(props.siege.id, attended, absent)
  }
  close()
}

defineExpose({ open })
</script>

