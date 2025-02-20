<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import Toast from 'primevue/toast'
import LoginModal from '@/components/LoginModal.vue'
import RegisterModal from '@/components/RegisterModal.vue'

const loginModal = ref()
const registerModal = ref()

const handleShowLogin = () => {
  loginModal.value?.show()
}

const handleShowRegister = () => {
  registerModal.value?.show()
}
</script>

<template>
  <div id="app">
    <Toast position="top-center" />
    <AppHeader @show-login="handleShowLogin" @show-register="handleShowRegister" />
    <main class="main-content">
      <router-view @show-login="handleShowLogin" @show-register="handleShowRegister"></router-view>
    </main>
    <LoginModal ref="loginModal" />
    <RegisterModal ref="registerModal" />
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

</style>
