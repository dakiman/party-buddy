<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './LoginModal.vue'
import RegisterModal from './RegisterModal.vue'
import PendingBadge from './PendingBadge.vue'

const authStore = useAuthStore()
const loginModal = ref()
const registerModal = ref()
const menu = ref()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const username = computed(() => authStore.user?.username || '')

const menuItems = ref([
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => {
      // Handle profile navigation
    }
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => {
      // Handle settings navigation
    }
  },
  {
    separator: true
  },
  {
    label: 'Logout',
    icon: 'pi pi-power-off',
    command: () => {
      authStore.logout()
    }
  }
])

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

const emit = defineEmits(['showLogin', 'showRegister'])

function showLogin() {
  emit('showLogin')
}

function showRegister() {
  emit('showRegister')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <img src="@/assets/logo.webp" alt="Party Buddy logo" class="logo-image" />
          <span class="wordmark">Party&nbsp;<span class="pb-gradient-text">Buddy</span></span>
        </router-link>
      </div>

      <nav class="header-nav">
        <router-link to="/discover" class="nav-link">Discover</router-link>
      </nav>

      <div class="header-actions">
        <template v-if="isLoggedIn">
          <PendingBadge class="pending-badge" />
          <Button
            icon="pi pi-bars"
            class="menu-button p-button-text p-button-rounded"
            @click="toggleMenu($event)"
            aria-label="Open navigation menu"
          />
          <div class="user-info">
            <Avatar 
              :label="username.charAt(0)"
              class="user-avatar"
              shape="circle"
            />
            <span class="username">{{ username }}</span>
            <Button
              icon="pi pi-chevron-down"
              class="p-button-text p-button-rounded desktop-menu-trigger"
              @click="toggleMenu($event)"
              aria-label="Open user menu"
            />
          </div>
          <Menu 
            ref="menu"
            :model="menuItems" 
            :popup="true" 
            class="user-menu"
            :pt="{
              root: { class: 'surface-ground' }
            }"
            appendTo="body"
          />
        </template>
        <template v-else>
          <div class="auth-buttons">
            <Button 
              label="Login"
              class="p-button-text"
              @click="showLogin"
            />
            <Button 
              label="Register"
              class="p-button-outlined"
              @click="showRegister"
            />
          </div>
        </template>
      </div>
    </div>
  </header>

  <LoginModal ref="loginModal" />
  <RegisterModal ref="registerModal" />
</template>

<style scoped>
/* .user-menu rules live in src/assets/main.css — the popup Menu
   teleports to <body> (appendTo="body"), out of reach of scoped styles (R3). */
.app-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--p-surface-950) 78%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--p-content-border-color);
  padding: 0.5rem 1rem;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.wordmark {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--p-text-color);
  white-space: nowrap;
}

.wordmark .pb-gradient-text {
  font-weight: 800;
}

@media screen and (max-width: 420px) {
  .wordmark {
    display: none;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-image {
  height: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header .pending-badge {
  margin-right: 0.25rem;
}

.app-header .user-info {
  display: none;
  align-items: center;
  gap: 0.5rem;
}

.app-header .user-avatar {
  background: var(--pb-accent-grad);
  color: #fff;
  font-weight: 600;
}

.app-header .menu-button {
  display: inline-flex;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.desktop-menu-trigger {
  padding: 0.5rem;
}

.desktop-menu-trigger:hover {
  background-color: var(--p-content-hover-background);
}

/* Tablet and up */
@media screen and (min-width: 768px) {
  .app-header .user-info {
    display: flex;
  }

  .app-header .menu-button {
    display: none;
  }
}

.header-nav {
  display: flex;
  gap: 1rem;
  margin-left: 1.5rem;
  flex: 1;
}

.header-nav .nav-link {
  position: relative;
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
}

.header-nav .nav-link:hover {
  color: var(--p-text-color);
  background-color: var(--p-content-hover-background);
}

.header-nav .nav-link.router-link-active {
  color: var(--p-text-color);
}

.header-nav .nav-link.router-link-active::after {
  content: '';
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: -2px;
  height: 2px;
  border-radius: 2px;
  background: var(--pb-accent-grad);
}
</style> 