<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Осады</h2>
        <p class="text-sm text-base-content/50 mt-0.5">{{ siegesStore.siegeEvents.length }} событий</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openAdd">+ Добавить осаду</button>
    </div>

    <!-- Empty state -->
    <div v-if="siegesStore.siegeEvents.length === 0" class="hero min-h-64">
      <div class="hero-content text-center">
        <div>
          <p class="text-4xl mb-3">🏰</p>
          <p class="text-base-content/50">Нет осад. Добавьте первую!</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto rounded-box border border-base-200">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Слоты</th>
            <th>Посещаемость</th>
            <th>Заметки</th>
            <th class="w-28"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="siege in sorted" :key="siege.id">
            <td class="font-semibold whitespace-nowrap">{{ fmtDate(siege.date) }}</td>
            <td>{{ siege.totalSlots }}</td>
            <td>
              <div class="flex items-center gap-2">
                <progress
                  class="progress w-20"
                  :class="pct(siege) >= 1 ? 'progress-success' : 'progress-warning'"
                  :value="siege.attendees.length"
                  :max="siege.totalSlots"
                />
                <span class="text-sm tabular-nums">
                  {{ siege.attendees.length }}/{{ siege.totalSlots }}
                  <span v-if="siege.absentees?.length" class="text-warning text-xs ml-1" :title="siege.absentees.length + ' пропустили сами'">
                    · {{ siege.absentees.length }}🚫
                  </span>
                </span>
              </div>
            </td>
            <td class="text-xs text-base-content/40 max-w-xs truncate">
              {{ siege.notes ?? '—' }}
            </td>
            <td>
              <div class="flex gap-1 justify-end">
                <button
                  class="btn btn-xs btn-ghost"
                  title="Отметить посещение"
                  @click="openAttendance(siege)"
                >📋</button>
                <button
                  class="btn btn-xs btn-ghost"
                  title="Редактировать"
                  @click="openEdit(siege)"
                >✎</button>
                <button
                  class="btn btn-xs btn-ghost text-error"
                  title="Удалить"
                  @click="askDelete(siege)"
                >✕</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <SiegeFormModal ref="formRef"   :siege="editingSiege"   @close="editingSiege = undefined" />
    <AttendanceModal ref="attendRef" :siege="attendSiege"   @close="attendSiege  = undefined" />

    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Удалить осаду?</h3>
        <p class="py-4 text-base-content/70">
          Удалить осаду от
          <strong>{{ deletingSiege ? fmtDate(deletingSiege.date) : '' }}</strong>?
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
import { useSiegesStore } from '@/store/sieges'
import { usePlayersStore } from '@/store/players'
import type { SiegeEvent } from '@/types'
import SiegeFormModal  from '@/components/sieges/SiegeFormModal.vue'
import AttendanceModal from '@/components/sieges/AttendanceModal.vue'

const siegesStore = useSiegesStore()
const playersStore = usePlayersStore()

onMounted(() => {
  siegesStore.fetchSieges()
  playersStore.fetchPlayers()
})

const formRef    = ref<InstanceType<typeof SiegeFormModal>>()
const attendRef  = ref<InstanceType<typeof AttendanceModal>>()
const deleteDialog = ref<HTMLDialogElement>()

const editingSiege  = ref<SiegeEvent | undefined>()
const attendSiege   = ref<SiegeEvent | undefined>()
const deletingSiege = ref<SiegeEvent | undefined>()

const sorted = computed(() =>
  [...siegesStore.siegeEvents].sort((a, b) => b.date.localeCompare(a.date)),
)

function openAdd() {
  editingSiege.value = undefined
  formRef.value?.open()
}

function openEdit(s: SiegeEvent) {
  editingSiege.value = s
  formRef.value?.open()
}

function openAttendance(s: SiegeEvent) {
  attendSiege.value = s
  attendRef.value?.open()
}

function askDelete(s: SiegeEvent) {
  deletingSiege.value = s
  deleteDialog.value?.showModal()
}

function confirmDelete() {
  if (deletingSiege.value) {
    siegesStore.deleteSiege(deletingSiege.value.id)
    deletingSiege.value = undefined
  }
  deleteDialog.value?.close()
}

function pct(s: SiegeEvent): number {
  return s.totalSlots > 0 ? s.attendees.length / s.totalSlots : 0
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
