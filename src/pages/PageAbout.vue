<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <h2 class="text-2xl font-bold">О проекте</h2>
      <p class="text-sm text-base-content/50 mt-0.5">Guild HQ — Node War Manager</p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Что это?</h3>
          <p class="text-sm text-base-content/80">
            Инструмент для лидера гильдии в Black Desert Online. Помогает управлять составом
            на нодовых войнах: вести учёт игроков, планировать ротацию и фиксировать посещаемость осад.
          </p>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Возможности</h3>
          <ul class="text-sm text-base-content/80 flex flex-col gap-1.5 list-none">
            <li class="flex gap-2"><span>👥</span><span><strong>Игроки</strong> — список участников гильдии с ролями и классами</span></li>
            <li class="flex gap-2"><span>🏰</span><span><strong>Осады</strong> — журнал нодовых войн, посещаемость, отметка пришедших</span></li>
            <li class="flex gap-2"><span>⚡</span><span><strong>Авторотация</strong> — алгоритм автоматически подбирает состав: сначала закрывает нужные роли, затем добирает по количеству пропусков</span></li>
            <li class="flex gap-2"><span>📋</span><span><strong>Ростер</strong> — настройка идеального состава по ролям на 20 слотов</span></li>
          </ul>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Как работает ротация</h3>
          <p class="text-sm text-base-content/80">
            Сначала алгоритм заполняет слоты по ролям из ростера: для каждой роли выбираются
            игроки с наибольшим количеством пропусков. Если игроков нужной роли не хватает —
            оставшиеся слоты добираются из общего пула по приоритету: больше пропусков подряд,
            ниже общая посещаемость. Игроки, пропустившие осаду по своей инициативе, не учитываются в статистике.
          </p>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <h3 class="card-title text-base">Хранение данных</h3>
          <p class="text-sm text-base-content/80">
            Все данные хранятся локально в браузере (localStorage). Никаких серверов и аккаунтов.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
