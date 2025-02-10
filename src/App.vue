<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
* {
  font-family: 'Outfit', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
  line-height: 1.5;
  font-weight: 400;
}

.main-content {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
