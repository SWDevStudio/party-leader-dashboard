<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box w-96">
      <h3 class="font-bold text-lg mb-5">
        {{ isEdit ? 'Редактировать осаду' : 'Добавить осаду' }}
      </h3>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="form-control w-full">
          <div class="label"><span class="label-text">Дата осады</span></div>
          <input
            v-model="date"
            v-bind="dateAttrs"
            type="date"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.date }"
            data-testid="siege-modal-date"
          />
          <div v-if="errors.date" class="label">
            <span class="label-text-alt text-error">{{ errors.date }}</span>
          </div>
        </div>

        <div class="form-control w-full">
          <div class="label"><span class="label-text">Кол-во слотов</span></div>
          <input
            v-model="totalSlots"
            v-bind="totalSlotsAttrs"
            type="number"
            min="1"
            max="500"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.totalSlots }"
            data-testid="siege-modal-slots"
          />
          <div v-if="errors.totalSlots" class="label">
            <span class="label-text-alt text-error">{{ errors.totalSlots }}</span>
          </div>
        </div>

        <div class="form-control w-full">
          <div class="label"><span class="label-text">Заметки (необязательно)</span></div>
          <textarea
            v-model="notes"
            v-bind="notesAttrs"
            class="textarea textarea-bordered w-full"
            rows="2"
            maxlength="256"
            data-testid="siege-modal-notes"
          />
        </div>

        <div class="modal-action pt-2">
          <button type="button" class="btn btn-ghost" data-testid="siege-modal-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn btn-primary" data-testid="siege-modal-submit">
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
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { addSiege, updateSiege } from '@/store'
import type { SiegeEvent } from '@/types'

const props = defineProps<{ siege?: SiegeEvent }>()
const emit  = defineEmits<{ close: [] }>()

const siegeSchema = toTypedSchema(z.object({
  date:       z.string().min(1, 'Укажите дату'),
  totalSlots: z.coerce.number().int().min(1, 'Минимум 1').max(500, 'Максимум 500'),
  notes:      z.string().max(256).default(''),
}))

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema: siegeSchema,
})

const [date, dateAttrs]               = defineField('date')
const [totalSlots, totalSlotsAttrs]   = defineField('totalSlots')
const [notes, notesAttrs]             = defineField('notes')

const dialogEl = ref<HTMLDialogElement>()
const isEdit   = computed(() => !!props.siege)
const today    = new Date().toISOString().split('T')[0]

watch(
  () => props.siege,
  (s) => {
    resetForm({
      values: s
        ? { date: s.date, totalSlots: s.totalSlots, notes: s.notes ?? '' }
        : { date: today, totalSlots: 40, notes: '' },
    })
  },
  { immediate: true },
)

function open()  { dialogEl.value?.showModal() }
function close() { dialogEl.value?.close(); emit('close') }

const submit = handleSubmit((values) => {
  const payload = {
    date:       values.date,
    totalSlots: values.totalSlots,
    notes:      values.notes?.trim() || undefined,
  }
  if (isEdit.value && props.siege) {
    updateSiege(props.siege.id, payload)
  } else {
    addSiege(payload)
  }
  close()
})

defineExpose({ open })
</script>

<style scoped></style>
