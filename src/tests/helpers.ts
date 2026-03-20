import { createTestingPinia as _createTestingPinia } from '@pinia/testing'
import { mount, type MountingOptions } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Component } from 'vue'

export { _createTestingPinia as createTestingPinia }

export function mountWithPlugins(component: Component, options: MountingOptions<object> = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  return mount(component, {
    global: {
      plugins: [_createTestingPinia(), router],
      ...options.global,
    },
    ...options,
  })
}
