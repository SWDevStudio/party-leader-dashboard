<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Игроки</h2>
        <p class="text-sm text-base-content/50 mt-0.5">{{ store.players.length }} участников</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openAdd">
        + Добавить игрока
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="store.players.length === 0" class="hero min-h-64">
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
            <th>Класс</th>
            <th>Роли</th>
            <th>Создан</th>
            <th class="w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, idx) in store.players" :key="player.id">
            <td class="text-base-content/30 text-sm">{{ idx + 1 }}</td>
            <td class="font-semibold">{{ player.gameSurname }}</td>
            <td class="text-base-content/60">{{ player.discordNick }}</td>
            <td class="text-sm">{{ className(player.classId) }}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in classRoles(player.classId)"
                  :key="role"
                  class="badge badge-xs"
                  :class="roleBadgeClass(role)"
                >{{ role }}</span>
              </div>
            </td>
            <td class="text-xs text-base-content/40">{{ fmtDate(player.createdAt) }}</td>
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
import { ref } from 'vue'
import { store, deletePlayer } from '../../store'
import type { Player, Role } from '../../types'
import { roleBadgeClass } from '../../utils/roles'
import PlayerModal from './PlayerModal.vue'

const modalRef   = ref<InstanceType<typeof PlayerModal>>()
const deleteDialog = ref<HTMLDialogElement>()

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

function confirmDelete() {
  if (deletingPlayer.value) {
    deletePlayer(deletingPlayer.value.id)
    deletingPlayer.value = undefined
  }
  deleteDialog.value?.close()
}

function className(classId: string): string {
  return store.classes.find(c => c.id === classId)?.name ?? classId
}

function classRoles(classId: string): Role[] {
  return store.classes.find(c => c.id === classId)?.roles ?? []
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}
</script>
