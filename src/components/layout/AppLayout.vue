<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background-color: #f0f2f8;
}

.app-layout__content {
  display: flex;
  justify-content: center;
  padding: 1rem 1rem;
}

@media (max-width: 767px) {
  .app-layout__content {
    padding: 1rem;
  }
}
</style>
