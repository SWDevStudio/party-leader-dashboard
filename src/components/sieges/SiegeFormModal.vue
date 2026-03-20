<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box w-96">
      <h3 class="font-bold text-lg mb-5">
        {{ isEdit ? 'Редактировать осаду' : 'Добавить осаду' }}
      </h3>

      <form @submit.prevent="submit" class="space-y-4">
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Дата осады</span></div>
          <input
            v-model="form.date"
            type="date"
            class="input input-bordered w-full"
            required
          />
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">Кол-во слотов</span></div>
          <input
            v-model.number="form.totalSlots"
            type="number"
            min="1"
            max="500"
            class="input input-bordered w-full"
            required
          />
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">Заметки (необязательно)</span></div>
          <textarea
            v-model="form.notes"
            class="textarea textarea-bordered w-full"
            rows="2"
            maxlength="256"
          />
        </label>

        <div class="modal-action pt-2">
          <button type="button" class="btn btn-ghost" @click="close">Отмена</button>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop" @submit.prevent="close">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { addSiege, updateSiege } from '../../store'
import type { SiegeEvent } from '../../types'

const props = defineProps<{ siege?: SiegeEvent }>()
const emit  = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLDialogElement>()
const isEdit   = computed(() => !!props.siege)

const today = new Date().toISOString().split('T')[0]

const form = ref({ date: today, totalSlots: 40, notes: '' })

watch(
  () => props.siege,
  (s) => {
    form.value = s
      ? { date: s.date, totalSlots: s.totalSlots, notes: s.notes ?? '' }
      : { date: today, totalSlots: 40, notes: '' }
  },
  { immediate: true },
)

function open() { dialogEl.value?.showModal() }
function close() { dialogEl.value?.close(); emit('close') }

function submit() {
  const payload = {
    date:       form.value.date,
    totalSlots: form.value.totalSlots,
    notes:      form.value.notes.trim() || undefined,
  }
  if (isEdit.value && props.siege) {
    updateSiege(props.siege.id, payload)
  } else {
    addSiege(payload)
  }
  close()
}

defineExpose({ open })
</script>
