<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Рейды</h2>
        <p class="text-sm text-base-content/50 mt-0.5">{{ raidsStore.raids.length }} рейдов</p>
      </div>
      <button class="btn btn-primary btn-sm" data-testid="add-raid-btn" @click="openAdd">
        + Создать рейд
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="raidsStore.raids.length === 0" class="hero min-h-64">
      <div class="hero-content text-center">
        <div>
          <p class="text-4xl mb-3">⚔️</p>
          <p class="text-base-content/50">Нет рейдов. Создайте первый!</p>
        </div>
      </div>
    </div>

    <!-- List -->
    <div v-else class="overflow-x-auto rounded-box border border-base-200">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th class="w-10">#</th>
            <th>Название</th>
            <th>Игроки</th>
            <th class="w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(raid, idx) in raidsStore.raids" :key="raid.id" data-testid="raid-row">
            <td class="text-base-content/30 text-sm">{{ idx + 1 }}</td>
            <td class="font-semibold">{{ raid.name }}</td>
            <td>
              <div v-if="raid.playerIds.length === 0" class="text-base-content/40 text-sm">Нет игроков</div>
              <div v-else class="flex flex-wrap gap-1">
                <span
                  v-for="playerId in raid.playerIds"
                  :key="playerId"
                  class="badge badge-sm badge-ghost"
                  data-testid="raid-player-badge"
                >{{ playerName(playerId) }}</span>
              </div>
            </td>
            <td>
              <div class="flex gap-1 justify-end">
                <button
                  class="btn btn-xs btn-ghost"
                  title="Редактировать"
                  data-testid="edit-raid-btn"
                  @click="openEdit(raid)"
                >✎</button>
                <button
                  class="btn btn-xs btn-ghost text-error"
                  title="Удалить"
                  data-testid="delete-raid-btn"
                  @click="askDelete(raid)"
                >✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit modal -->
    <dialog ref="modalDialog" class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="font-bold text-lg mb-4">{{ editingRaid ? 'Редактировать рейд' : 'Создать рейд' }}</h3>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Название рейда</span></label>
          <input
            v-model="form.name"
            type="text"
            class="input input-bordered w-full"
            placeholder="Например: Рейд А"
            data-testid="raid-name-input"
          />
        </div>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Игроки ({{ form.playerIds.length }} выбрано)</span></label>
          <div class="border border-base-300 rounded-box max-h-64 overflow-y-auto p-2 space-y-1">
            <div v-if="playersStore.players.length === 0" class="text-base-content/40 text-sm p-2">
              Сначала добавьте игроков на странице «Игроки»
            </div>
            <label
              v-for="player in playersStore.players"
              :key="player.id"
              class="flex items-center gap-2 p-1.5 rounded hover:bg-base-200 cursor-pointer"
              :data-testid="`player-checkbox-${player.id}`"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                :value="player.id"
                :checked="form.playerIds.includes(player.id)"
                @change="togglePlayer(player.id)"
              />
              <span class="text-sm font-medium">{{ player.gameSurname }}</span>
              <span class="text-sm text-base-content/50">{{ player.discordNick }}</span>
            </label>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" data-testid="cancel-raid-btn" @click="closeModal">Отмена</button>
          <button class="btn btn-primary" data-testid="save-raid-btn" :disabled="!form.name.trim()" @click="save">
            {{ editingRaid ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <!-- Delete confirm modal -->
    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Удалить рейд?</h3>
        <p class="py-4 text-base-content/70">
          Рейд <strong>{{ deletingRaid?.name }}</strong> будет удалён.
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" data-testid="cancel-delete-btn" @click="deleteDialog?.close()">Отмена</button>
          <button class="btn btn-error" data-testid="confirm-delete-btn" @click="confirmDelete">Удалить</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRaidsStore } from '@/store/raids'
import { usePlayersStore } from '@/store/players'
import type { Raid } from '@/types'

const raidsStore = useRaidsStore()
const playersStore = usePlayersStore()

onMounted(() => {
  raidsStore.fetchRaids()
  playersStore.fetchPlayers()
})

const modalDialog = ref<HTMLDialogElement>()
const deleteDialog = ref<HTMLDialogElement>()

const editingRaid = ref<Raid | undefined>()
const deletingRaid = ref<Raid | undefined>()

const form = reactive({ name: '', playerIds: [] as string[] })

function openAdd() {
  editingRaid.value = undefined
  form.name = ''
  form.playerIds = []
  modalDialog.value?.showModal()
}

function openEdit(raid: Raid) {
  editingRaid.value = raid
  form.name = raid.name
  form.playerIds = [...raid.playerIds]
  modalDialog.value?.showModal()
}

function closeModal() {
  modalDialog.value?.close()
}

function togglePlayer(playerId: string) {
  const idx = form.playerIds.indexOf(playerId)
  if (idx === -1) {
    form.playerIds.push(playerId)
  } else {
    form.playerIds.splice(idx, 1)
  }
}

async function save() {
  if (!form.name.trim()) return
  if (editingRaid.value) {
    await raidsStore.updateRaid(editingRaid.value.id, { name: form.name, playerIds: form.playerIds })
  } else {
    await raidsStore.addRaid({ name: form.name, playerIds: form.playerIds })
  }
  closeModal()
}

function askDelete(raid: Raid) {
  deletingRaid.value = raid
  deleteDialog.value?.showModal()
}

async function confirmDelete() {
  if (deletingRaid.value) {
    await raidsStore.deleteRaid(deletingRaid.value.id)
    deletingRaid.value = undefined
  }
  deleteDialog.value?.close()
}

function playerName(playerId: string): string {
  return playersStore.players.find(p => p.id === playerId)?.gameSurname ?? playerId
}
</script>
