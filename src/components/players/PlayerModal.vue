<template>
  <dialog ref="dialogEl" class="modal">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-5">
        {{ isEdit ? 'Редактировать игрока' : 'Добавить игрока' }}
      </h3>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- Game surname -->
        <div class="form-control w-full">
          <div class="label"><span class="label-text">Игровая фамилия</span></div>
          <input
            v-model="gameSurname"
            v-bind="gameSurnameAttrs"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.gameSurname }"
            placeholder="Ivanov"
            maxlength="64"
            data-testid="player-modal-surname"
          />
          <div v-if="errors.gameSurname" class="label">
            <span class="label-text-alt text-error">{{ errors.gameSurname }}</span>
          </div>
        </div>

        <!-- Discord nick -->
        <div class="form-control w-full">
          <div class="label"><span class="label-text">Ник в Discord</span></div>
          <input
            v-model="discordNick"
            v-bind="discordNickAttrs"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.discordNick }"
            placeholder="ivanov"
            maxlength="64"
            data-testid="player-modal-discord"
          />
          <div v-if="errors.discordNick" class="label">
            <span class="label-text-alt text-error">{{ errors.discordNick }}</span>
          </div>
        </div>

        <!-- Class -->
        <div class="form-control w-full">
          <div class="label"><span class="label-text">Класс</span></div>
          <UiSelectSearch
            :model-value="classId ?? null"
            :options="classOptions"
            placeholder="Начните вводить название..."
            data-testid="player-modal-class"
            @update:model-value="(v) => { classId = v ?? '' }"
          />
          <div v-if="errors.classId" class="label">
            <span class="label-text-alt text-error">{{ errors.classId }}</span>
          </div>
        </div>

        <!-- Joined at -->
        <div class="form-control w-full">
          <div class="label"><span class="label-text">Дата вступления</span></div>
          <input
            v-model="joinedAt"
            v-bind="joinedAtAttrs"
            type="date"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.joinedAt }"
            data-testid="player-modal-joined-at"
          />
          <div v-if="errors.joinedAt" class="label">
            <span class="label-text-alt text-error">{{ errors.joinedAt }}</span>
          </div>
        </div>

        <!-- Roles -->
        <div class="form-control w-full">
          <div class="label">
            <span class="label-text">Роли</span>
            <button
              v-if="hasRoleOverride"
              type="button"
              class="label-text-alt btn btn-xs btn-ghost"
              data-testid="player-modal-roles-reset"
              @click="resetRoles"
            >↺ Сбросить к классу</button>
          </div>
          <UiSelect
            :model-value="effectiveRoles"
            :options="roleOptions"
            mode="multiple"
            placeholder="Роли не выбраны"
            data-testid="player-modal-roles"
            @update:model-value="handleRolesChange"
          />
        </div>

        <div class="modal-action pt-2">
          <button type="button" class="btn btn-ghost" data-testid="player-modal-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn btn-primary" data-testid="player-modal-submit">
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
import { usePlayersStore } from '@/store/players'

const playersStore = usePlayersStore()
import { ALL_ROLES } from '@/types'
import type { Player, Role, SelectOption } from '@/types'
import { roleBadgeClass } from '@/utils/roles'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiSelectSearch from '@/components/ui/UiSelectSearch.vue'

const props = defineProps<{ player?: Player }>()
const emit = defineEmits<{ close: [] }>()

const today = new Date().toISOString().split('T')[0]

const playerSchema = toTypedSchema(z.object({
  gameSurname: z.string().min(1, 'Обязательное поле').max(64),
  discordNick:  z.string().min(1, 'Обязательное поле').max(64),
  classId:      z.string().min(1, 'Выберите класс'),
  joinedAt:     z.string().min(1, 'Укажите дату'),
  roles:        z.array(z.string()).default([]),
}))

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema: playerSchema,
})

const [gameSurname, gameSurnameAttrs] = defineField('gameSurname')
const [discordNick, discordNickAttrs]  = defineField('discordNick')
const [classId]                        = defineField('classId')
const [joinedAt, joinedAtAttrs]        = defineField('joinedAt')
const [roles]                          = defineField('roles')

const dialogEl = ref<HTMLDialogElement>()
const isEdit = computed(() => !!props.player)

watch(
  () => props.player,
  (p) => {
    resetForm({
      values: p
        ? { gameSurname: p.gameSurname, discordNick: p.discordNick, classId: p.classId, joinedAt: p.joinedAt, roles: p.roles ?? [] }
        : { gameSurname: '', discordNick: '', classId: '', joinedAt: today, roles: [] },
    })
  },
  { immediate: true },
)

const classOptions = computed<SelectOption[]>(() =>
  playersStore.classes.map(c => ({ value: c.id, label: c.name }))
)

const classDefaultRoles = computed<Role[]>(
  () => playersStore.classes.find(c => c.id === classId.value)?.roles ?? [],
)

const hasRoleOverride = computed(() => (roles.value?.length ?? 0) > 0)

const effectiveRoles = computed<string[]>(
  () => hasRoleOverride.value ? (roles.value as string[]) : classDefaultRoles.value,
)

const roleOptions = computed<SelectOption[]>(() =>
  ALL_ROLES.map(r => ({ value: r, label: r, class: roleBadgeClass(r) })),
)

function handleRolesChange(value: string | string[] | null) {
  roles.value = Array.isArray(value) ? value : []
}

function resetRoles() {
  roles.value = []
}

function open() {
  dialogEl.value?.showModal()
}

function close() {
  dialogEl.value?.close()
  emit('close')
}

const submit = handleSubmit((values) => {
  const rolesOverride = (values.roles?.length ?? 0) > 0 ? values.roles as Role[] : undefined
  if (isEdit.value && props.player) {
    playersStore.updatePlayer(props.player.id, {
      gameSurname: values.gameSurname,
      discordNick:  values.discordNick,
      classId:      values.classId,
      joinedAt:     values.joinedAt,
      roles:        rolesOverride,
    })
  } else {
    playersStore.addPlayer({
      gameSurname: values.gameSurname,
      discordNick:  values.discordNick,
      classId:      values.classId,
      joinedAt:     values.joinedAt,
      roles:        rolesOverride,
    })
  }
  close()
})

defineExpose({ open })
</script>

<style scoped></style>
