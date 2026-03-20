<template>
  <div class="relative w-full" ref="containerEl" data-testid="ui-select">
    <div
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      class="input input-bordered w-full flex items-center flex-wrap gap-1.5 min-h-10 h-auto py-1.5 px-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
      data-testid="ui-select-trigger"
      @click="toggleOpen"
      @keydown.enter.prevent="toggleOpen"
      @keydown.space.prevent="toggleOpen"
      @keydown.escape="closeDropdown"
    >
      <template v-if="props.mode === 'multiple'">
        <span
          v-for="opt in selectedMultiple"
          :key="opt.value"
          class="badge badge-sm gap-0.5"
          :class="opt.class"
        >
          {{ opt.label }}
          <button
            type="button"
            class="opacity-60 hover:opacity-100 leading-none"
            :data-testid="`ui-select-deselect-${opt.value}`"
            @click.stop="deselect(opt.value)"
          >✕</button>
        </span>
        <span
          v-if="selectedMultiple.length === 0"
          class="text-base-content/40 text-sm select-none"
        >{{ placeholder }}</span>
      </template>

      <template v-else>
        <span v-if="selectedSingle" class="text-sm" :class="selectedSingle.class">
          {{ selectedSingle.label }}
        </span>
        <span v-else class="text-base-content/40 text-sm select-none">{{ placeholder }}</span>
      </template>

      <span class="ml-auto shrink-0 text-base-content/40 select-none text-xs transition-transform" :class="isOpen ? 'rotate-180' : ''">▾</span>
    </div>

    <Transition name="ui-select-dropdown">
      <ul
        v-if="isOpen"
        class="absolute z-20 top-full left-0 mt-1 w-full bg-base-200 border border-base-300 rounded-box shadow-lg max-h-60 overflow-y-auto p-1"
        data-testid="ui-select-dropdown"
      >
        <li v-for="opt in props.options" :key="opt.value">
          <label
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-base-300 select-none"
            :data-testid="`ui-select-option-${opt.value}`"
          >
            <input
              v-if="props.mode === 'multiple'"
              type="checkbox"
              class="checkbox checkbox-xs shrink-0"
              :checked="isSelected(opt.value)"
              @change="toggleMultiple(opt.value)"
            />
            <input
              v-else
              type="radio"
              class="radio radio-xs shrink-0"
              :checked="isSelected(opt.value)"
              @change="selectSingle(opt.value)"
            />
            <span class="badge badge-sm" :class="opt.class ?? ''">{{ opt.label }}</span>
          </label>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { SelectOption } from '@/types'

const props = withDefaults(defineProps<{
  options: SelectOption[]
  modelValue: string | string[] | null
  mode?: 'single' | 'multiple'
  placeholder?: string
}>(), {
  mode: 'single',
  placeholder: 'Выберите...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | null]
}>()

const containerEl = ref<HTMLElement>()
const isOpen = ref(false)

onClickOutside(containerEl, closeDropdown)

const selectedMultiple = computed<SelectOption[]>(() => {
  if (!Array.isArray(props.modelValue)) return []
  return props.options.filter(o => (props.modelValue as string[]).includes(o.value))
})

const selectedSingle = computed<SelectOption | null>(() => {
  if (typeof props.modelValue !== 'string') return null
  return props.options.find(o => o.value === props.modelValue) ?? null
})

function isSelected(value: string): boolean {
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(value)
  return props.modelValue === value
}

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function toggleMultiple(value: string) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

function selectSingle(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function deselect(value: string) {
  const current = Array.isArray(props.modelValue)
    ? props.modelValue.filter(v => v !== value)
    : []
  emit('update:modelValue', current)
}
</script>

<style scoped>
.ui-select-dropdown-enter-active,
.ui-select-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.ui-select-dropdown-enter-from,
.ui-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
