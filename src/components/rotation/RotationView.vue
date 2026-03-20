<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Ротация</h2>
        <p class="text-sm text-base-content/50 mt-0.5">Расчёт состава на осаду</p>
      </div>
    </div>

    <!-- No players -->
    <div v-if="store.players.length === 0" class="hero min-h-64">
      <div class="hero-content text-center">
        <div>
          <p class="text-4xl mb-3">🔄</p>
          <p class="text-base-content/50">Сначала добавьте игроков.</p>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Configs card -->
      <div class="card bg-base-100 border border-base-200 shadow-sm mb-6">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end">
            <label class="form-control">
              <div class="label py-1"><span class="label-text text-xs">Дата осады</span></div>
              <input v-model="siegeDate" type="date" class="input input-bordered input-sm w-40" />
            </label>

            <label class="form-control">
              <div class="label py-1">
                <span class="label-text text-xs">Слотов (макс {{ store.players.length }})</span>
              </div>
              <input
                v-model.number="slots"
                type="number"
                min="1"
                :max="store.players.length"
                class="input input-bordered input-sm w-24"
              />
            </label>

            <button class="btn btn-primary btn-sm" @click="calculate">
              ⚡ Рассчитать
            </button>

            <button
              v-if="result"
              class="btn btn-success btn-sm"
              @click="saveAsSiege"
            >
              💾 Сохранить как осаду
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <template v-if="result">
        <!-- Role composition summary -->
        <div class="card bg-base-100 border border-base-200 shadow-sm mb-5">
          <div class="card-body py-3">
            <div class="flex items-center flex-wrap gap-x-4 gap-y-2">
              <span class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                Состав ({{ result.selected.length }} игроков):
              </span>
              <span
                v-for="(count, role) in roleComposition"
                :key="role"
                class="badge gap-1"
                :class="roleBadgeClass(role as any)"
              >
                {{ role }}: {{ count }}
              </span>
              <span v-if="Object.keys(roleComposition).length === 0" class="text-base-content/30 text-sm">
                —
              </span>
            </div>
          </div>
        </div>

        <!-- Two columns: Goes / Bench -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">

          <!-- ── ВЫХОДЯТ ── -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-success"></span>
              <h3 class="font-bold">Выходят — {{ result.selected.length }}</h3>
            </div>

            <div class="space-y-2">
              <div
                v-for="(stats, idx) in result.selected"
                :key="stats.player.id"
                class="card bg-base-100 border border-success/25 hover:border-success/60 transition-colors"
              >
                <div class="card-body py-2.5 px-4">
                  <div class="flex items-center gap-2">
                    <!-- rank -->
                    <span class="text-xs text-base-content/30 w-5 text-center shrink-0">
                      {{ idx + 1 }}
                    </span>

                    <!-- info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sm truncate">{{ stats.player.gameSurname }}</span>
                        <span class="text-xs text-base-content/40 truncate">{{ stats.player.discordNick }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span class="text-xs text-base-content/40">{{ className(stats.player.classId) }}</span>
                        <span
                          v-for="role in classRoles(stats.player.classId)"
                          :key="role"
                          class="badge badge-xs"
                          :class="roleBadgeClass(role)"
                        >{{ role }}</span>
                      </div>
                    </div>

                    <!-- mini stats -->
                    <div class="text-right text-xs text-base-content/40 shrink-0 min-w-16">
                      <div class="tabular-nums">{{ stats.attended }}/{{ stats.totalSieges }}</div>
                      <div
                        v-if="stats.consecutiveMisses > 0"
                        class="text-warning font-medium"
                      >{{ stats.consecutiveMisses }}× пропуск</div>
                      <div v-else class="text-success">активен</div>
                    </div>

                    <!-- move to bench -->
                    <button
                      v-if="result.benched.length > 0"
                      class="btn btn-xs btn-ghost text-base-content/20 hover:text-warning ml-1 shrink-0"
                      title="Переместить в бенч"
                      @click="moveToBench(idx)"
                    >⬇</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── БЕНЧ ── -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-error/60"></span>
              <h3 class="font-bold text-base-content/60">Бенч — {{ result.benched.length }}</h3>
            </div>

            <div v-if="result.benched.length === 0" class="text-sm text-base-content/30 py-4">
              Все игроки вмещаются в слоты.
            </div>

            <div class="space-y-2">
              <div
                v-for="(stats, idx) in result.benched"
                :key="stats.player.id"
                class="card bg-base-100 border border-base-200 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div class="card-body py-2.5 px-4">
                  <div class="flex items-center gap-2">
                    <!-- move to active -->
                    <button
                      class="btn btn-xs btn-ghost text-base-content/20 hover:text-success shrink-0"
                      title="Переместить к активным"
                      @click="moveToActive(idx)"
                    >⬆</button>

                    <!-- info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sm truncate">{{ stats.player.gameSurname }}</span>
                        <span class="text-xs text-base-content/40 truncate">{{ stats.player.discordNick }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span class="text-xs text-base-content/40">{{ className(stats.player.classId) }}</span>
                        <span
                          v-for="role in classRoles(stats.player.classId)"
                          :key="role"
                          class="badge badge-xs"
                          :class="roleBadgeClass(role)"
                        >{{ role }}</span>
                      </div>
                    </div>

                    <!-- mini stats -->
                    <div class="text-right text-xs text-base-content/40 shrink-0 min-w-16">
                      <div class="tabular-nums">{{ stats.attended }}/{{ stats.totalSieges }}</div>
                      <div v-if="stats.lastAttendedDate" class="text-success">
                        был {{ fmtDateShort(stats.lastAttendedDate) }}
                      </div>
                      <div v-else class="text-base-content/25">никогда</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { store, addSiege, setSiegeAttendance } from '../../store'
import type { Role } from '../../types'
import { computeAllStats, sortByPriority, type PlayerStats } from '../../utils/rotation'
import { roleBadgeClass } from '../../utils/roles'

interface RotationResult {
  selected: PlayerStats[]
  benched:  PlayerStats[]
}

const today     = new Date().toISOString().split('T')[0]
const siegeDate = ref(today)
const slots     = ref(40)
const result    = ref<RotationResult | null>(null)

function calculate() {
  const all    = computeAllStats(store.players, store.siegeEvents)
  const sorted = sortByPriority(all)
  const take   = Math.min(Math.max(slots.value, 0), store.players.length)
  result.value = {
    selected: sorted.slice(0, take),
    benched:  sorted.slice(take),
  }
}

// Role count breakdown for the selected players
const roleComposition = computed<Partial<Record<Role, number>>>(() => {
  if (!result.value) return {}
  const counts: Partial<Record<Role, number>> = {}
  for (const stats of result.value.selected) {
    const roles = store.classes.find(c => c.id === stats.player.classId)?.roles ?? []
    for (const role of roles) {
      counts[role] = (counts[role] ?? 0) + 1
    }
  }
  return counts
})

// Manual overrides — move player from selected → bench (no swap, slot count changes)
function moveToBench(idx: number) {
  if (!result.value) return
  const [p] = result.value.selected.splice(idx, 1)
  result.value.benched.unshift(p)
}

function moveToActive(idx: number) {
  if (!result.value) return
  const [p] = result.value.benched.splice(idx, 1)
  result.value.selected.push(p)
}

function saveAsSiege() {
  if (!result.value) return
  const siege = addSiege({ date: siegeDate.value, totalSlots: slots.value })
  setSiegeAttendance(siege.id, result.value.selected.map(s => s.player.id), [])
  result.value = null
  alert(
    `Осада от ${new Date(siegeDate.value + 'T12:00:00').toLocaleDateString('ru-RU')} сохранена!`,
  )
}

function className(classId: string): string {
  return store.classes.find(c => c.id === classId)?.name ?? classId
}

function classRoles(classId: string): Role[] {
  return store.classes.find(c => c.id === classId)?.roles ?? []
}

function fmtDateShort(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short',
  })
}
</script>
