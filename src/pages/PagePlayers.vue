<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Игроки</h2>
        <p class="text-sm text-base-content/50 mt-0.5">{{ playersStore.players.length }} участников</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openAdd">
        + Добавить игрока
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="playersStore.players.length === 0" class="hero min-h-64">
      <div class="hero-content text-center">
        <div>
          <p class="text-4xl mb-3">👥</p>
          <p class="text-base-content/50">Нет игроков. Добавьте первого!</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto rounded-box border border-base-200">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th class="w-10">#</th>
            <th>Игровая фамилия</th>
            <th>Discord</th>
            <th class="cursor-pointer select-none" data-testid="sort-class" @click="toggleSort('class')">
              Класс <span class="ml-1 text-xs" :class="sortCol === 'class' ? 'opacity-100 text-primary' : 'opacity-30'">{{ sortArrow('class') }}</span>
            </th>
            <th class="cursor-pointer select-none" data-testid="sort-roles" @click="toggleSort('roles')">
              Роли <span class="ml-1 text-xs" :class="sortCol === 'roles' ? 'opacity-100 text-primary' : 'opacity-30'">{{ sortArrow('roles') }}</span>
            </th>
            <th class="cursor-pointer select-none" data-testid="sort-raid" @click="toggleSort('raid')">
              Рейд <span class="ml-1 text-xs" :class="sortCol === 'raid' ? 'opacity-100 text-primary' : 'opacity-30'">{{ sortArrow('raid') }}</span>
            </th>
            <th class="cursor-pointer select-none" data-testid="sort-joined" @click="toggleSort('joinedAt')">
              Вступил <span class="ml-1 text-xs" :class="sortCol === 'joinedAt' ? 'opacity-100 text-primary' : 'opacity-30'">{{ sortArrow('joinedAt') }}</span>
            </th>
            <th class="w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, idx) in sortedPlayers" :key="player.id">
            <td class="text-base-content/30 text-sm">{{ idx + 1 }}</td>
            <td class="font-semibold">{{ player.gameSurname }}</td>
            <td class="text-base-content/60">{{ player.discordNick }}</td>
            <td class="text-sm">{{ className(player.classId) }}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in playersStore.getPlayerRoles(player)"
                  :key="role"
                  class="badge badge-xs"
                  :class="roleBadgeClass(role)"
                >{{ role }}</span>
              </div>
            </td>
            <td>
              <div v-if="raidsStore.getPlayerRaids(player.id).length === 0" class="text-base-content/30 text-sm">—</div>
              <div v-else class="flex flex-wrap gap-1">
                <span
                  v-for="raid in raidsStore.getPlayerRaids(player.id)"
                  :key="raid.id"
                  class="badge badge-sm badge-outline"
                >{{ raid.name }}</span>
              </div>
            </td>
            <td class="text-xs text-base-content/40">{{ fmtDate(player.joinedAt) }}</td>
            <td>
              <div class="flex gap-1 justify-end">
                <button
                  class="btn btn-xs btn-ghost"
                  title="Редактировать"
                  @click="openEdit(player)"
                >✎</button>
                <button
                  class="btn btn-xs btn-ghost text-error"
                  title="Удалить"
                  @click="askDelete(player)"
                >✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit modal -->
    <PlayerModal ref="modalRef" :player="editingPlayer" @close="editingPlayer = undefined" />

    <!-- Delete confirm modal -->
    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Удалить игрока?</h3>
        <p class="py-4 text-base-content/70">
          Игрок <strong>{{ deletingPlayer?.gameSurname }}</strong> будет удалён вместе
          со всеми записями посещаемости.
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="deleteDialog?.close()">Отмена</button>
          <button class="btn btn-error" @click="confirmDelete">Удалить</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayersStore } from '@/store/players'
import { useSiegesStore } from '@/store/sieges'
import { useRaidsStore } from '@/store/raids'
import type { Player } from '@/types'
import { roleBadgeClass } from '@/utils/roles'
import PlayerModal from '@/components/players/PlayerModal.vue'

type SortCol = 'class' | 'roles' | 'raid' | 'joinedAt'
type SortDir = 'asc' | 'desc'

const playersStore = usePlayersStore()
const siegesStore  = useSiegesStore()
const raidsStore   = useRaidsStore()

onMounted(() => {
  playersStore.fetchPlayers()
  raidsStore.fetchRaids()
})

const sortCol = ref<SortCol>('joinedAt')
const sortDir = ref<SortDir>('asc')

function toggleSort(col: SortCol) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = col
    sortDir.value = 'asc'
  }
}

const sortedPlayers = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...playersStore.players].sort((a, b) => {
    let av = ''
    let bv = ''
    if (sortCol.value === 'class') {
      av = className(a.classId)
      bv = className(b.classId)
    } else if (sortCol.value === 'roles') {
      av = playersStore.getPlayerRoles(a)[0] ?? ''
      bv = playersStore.getPlayerRoles(b)[0] ?? ''
    } else if (sortCol.value === 'raid') {
      av = raidsStore.getPlayerRaids(a.id)[0]?.name ?? ''
      bv = raidsStore.getPlayerRaids(b.id)[0]?.name ?? ''
    } else {
      av = a.joinedAt
      bv = b.joinedAt
    }
    return av.localeCompare(bv, 'ru') * dir
  })
})

const modalRef      = ref<InstanceType<typeof PlayerModal>>()
const deleteDialog   = ref<HTMLDialogElement>()

const editingPlayer  = ref<Player | undefined>()
const deletingPlayer = ref<Player | undefined>()

function openAdd() {
  editingPlayer.value = undefined
  modalRef.value?.open()
}

function openEdit(p: Player) {
  editingPlayer.value = p
  modalRef.value?.open()
}

function askDelete(p: Player) {
  deletingPlayer.value = p
  deleteDialog.value?.showModal()
}

async function confirmDelete() {
  if (deletingPlayer.value) {
    await playersStore.deletePlayer(deletingPlayer.value.id)
    siegesStore.removePlayerFromAll(deletingPlayer.value.id)
    deletingPlayer.value = undefined
  }
  deleteDialog.value?.close()
}

function sortArrow(col: SortCol): string {
  if (sortCol.value !== col) return '▲'
  return sortDir.value === 'asc' ? '▲' : '▼'
}

function className(classId: string): string {
  return playersStore.classes.find(c => c.id === classId)?.name ?? classId
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}
</script>
