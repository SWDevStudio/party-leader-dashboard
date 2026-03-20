<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box w-96">
      <h3 class="font-bold text-lg mb-5">
        {{ isEdit ? 'Редактировать игрока' : 'Добавить игрока' }}
      </h3>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- Game surname -->
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Игровая фамилия</span></div>
          <input
            v-model.trim="form.gameSurname"
            type="text"
            class="input input-bordered w-full"
            placeholder="Ivanov"
            required
            maxlength="64"
          />
        </label>

        <!-- Discord nick -->
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Ник в Discord</span></div>
          <input
            v-model.trim="form.discordNick"
            type="text"
            class="input input-bordered w-full"
            placeholder="ivanov"
            required
            maxlength="64"
          />
        </label>

        <!-- Class -->
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Класс</span></div>
          <select v-model="form.classId" class="select select-bordered w-full" required>
            <option value="" disabled>Выберите класс...</option>
            <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </label>

        <!-- Role preview -->
        <div v-if="selectedRoles.length" class="flex flex-wrap gap-1 -mt-1">
          <span
            v-for="role in selectedRoles"
            :key="role"
            class="badge badge-sm"
            :class="roleBadgeClass(role)"
          >{{ role }}</span>
        </div>

        <div class="modal-action pt-2">
          <button type="button" class="btn btn-ghost" @click="close">Отмена</button>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Click outside to close -->
    <form method="dialog" class="modal-backdrop" @submit.prevent="close">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { store, addPlayer, updatePlayer } from '../../store'
import type { Player } from '../../types'
import { roleBadgeClass } from '../../utils/roles'

const props = defineProps<{ player?: Player }>()
const emit = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLDialogElement>()
const isEdit = computed(() => !!props.player)

const form = ref({ gameSurname: '', discordNick: '', classId: '' })

watch(
  () => props.player,
  (p) => {
    form.value = p
      ? { gameSurname: p.gameSurname, discordNick: p.discordNick, classId: p.classId }
      : { gameSurname: '', discordNick: '', classId: '' }
  },
  { immediate: true },
)

const selectedRoles = computed(
  () => store.classes.find(c => c.id === form.value.classId)?.roles ?? [],
)

function open() {
  dialogEl.value?.showModal()
}

function close() {
  dialogEl.value?.close()
  emit('close')
}

function submit() {
  if (isEdit.value && props.player) {
    updatePlayer(props.player.id, {
      gameSurname: form.value.gameSurname,
      discordNick:  form.value.discordNick,
      classId:      form.value.classId,
    })
  } else {
    addPlayer({
      gameSurname: form.value.gameSurname,
      discordNick:  form.value.discordNick,
      classId:      form.value.classId,
    })
  }
  close()
}

defineExpose({ open })
</script>
