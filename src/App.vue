<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import Toast from 'primevue/toast'
</script>

<template>
  <div id="app">
    <Toast position="top-center" />
    <AppHeader />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>

* {
  font-family: 'Outfit', system-ui, Avenir, Helvetica, Arial, sans-serif;
  /* line-height: 1.5; */
  font-weight: 400;
}

.main-content {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Toast mobile styling */
@media screen and (max-width: 768px) {
  .p-toast {
    width: 90% !important;
    max-width: 90vw !important;
    right: auto !important;
  }

  .p-toast-message {
    margin: 0 1rem;
  }

  .p-toast-top-center {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
}

</style>
