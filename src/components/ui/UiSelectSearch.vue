<template>
  <div ref="containerEl" class="relative w-full" data-testid="ui-select-search">
    <div class="relative">
      <input
        ref="inputEl"
        type="text"
        class="input input-bordered w-full pr-8"
        :value="displayValue"
        :placeholder="placeholder"
        autocomplete="off"
        data-testid="ui-select-search-input"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown.escape.prevent="close"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.arrow-down.prevent="moveHighlight(1)"
        @keydown.arrow-up.prevent="moveHighlight(-1)"
      />
      <span
        class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xs pointer-events-none select-none transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      >▾</span>
    </div>

    <ul
      v-if="isOpen"
      ref="dropdownEl"
      class="absolute z-20 top-full left-0 mt-1 w-full bg-base-200 border border-base-300 rounded-box shadow-lg max-h-60 overflow-y-auto p-1"
      data-testid="ui-select-search-dropdown"
    >
      <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-base-content/40 select-none">
        Ничего не найдено
      </li>
      <li v-for="(opt, i) in filteredOptions" :key="opt.value">
        <button
          type="button"
          class="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="{
            'bg-base-300': i === highlightedIndex && opt.value !== modelValue,
            'bg-primary/15 font-medium': opt.value === modelValue,
          }"
          :data-testid="`ui-select-search-option-${opt.value}`"
          @mousedown.prevent="selectOption(opt.value)"
          @mouseover="highlightedIndex = i"
        >
          <span v-if="opt.class" class="badge badge-sm" :class="opt.class">{{ opt.label }}</span>
          <span v-else>{{ opt.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { SelectOption } from '@/types'

const props = withDefaults(defineProps<{
  options: SelectOption[]
  modelValue: string | null
  placeholder?: string
}>(), {
  placeholder: 'Выберите...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const containerEl      = ref<HTMLElement>()
const dropdownEl       = ref<HTMLElement>()
const inputEl          = ref<HTMLInputElement>()
const isOpen           = ref(false)
const isFocused        = ref(false)
const query            = ref('')
const highlightedIndex = ref(0)

onClickOutside(containerEl, close)

const selectedOption = computed<SelectOption | null>(
  () => props.options.find(o => o.value === props.modelValue) ?? null,
)

const displayValue = computed<string>(() => {
  if (isFocused.value) return query.value
  return selectedOption.value?.label ?? ''
})

const filteredOptions = computed<SelectOption[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function onFocus() {
  isFocused.value = true
  query.value = ''
  highlightedIndex.value = 0
  isOpen.value = true
}

function onBlur() {
  isFocused.value = false
  query.value = ''
}

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  highlightedIndex.value = 0
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  close()
}

function selectHighlighted() {
  const opt = filteredOptions.value[highlightedIndex.value]
  if (opt) selectOption(opt.value)
}

function moveHighlight(delta: number) {
  const len = filteredOptions.value.length
  if (len === 0) return
  highlightedIndex.value = (highlightedIndex.value + delta + len) % len
  nextTick(scrollHighlightedIntoView)
}

function scrollHighlightedIntoView() {
  if (!dropdownEl.value) return
  const item = dropdownEl.value.querySelectorAll('li')[highlightedIndex.value]
  item?.scrollIntoView({ block: 'nearest' })
}

function close() {
  isOpen.value = false
  isFocused.value = false
  query.value = ''
  inputEl.value?.blur()
}
</script>
