<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './LoginModal.vue'
import RegisterModal from './RegisterModal.vue'

const authStore = useAuthStore()
const loginModal = ref()
const registerModal = ref()
const menu = ref()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const username = computed(() => authStore.user?.name || '')

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

function showLogin() {
  loginModal.value.show()
}

function showRegister() {
  registerModal.value.show()
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/logo.webp" alt="Logo" class="logo-image" />
        </router-link>
      </div>

      <div class="header-actions">
        <template v-if="isLoggedIn">
          <Button
            icon="pi pi-bars"
            class="menu-button p-button-text p-button-rounded"
            @click="toggleMenu($event)"
            aria-label="Menu"
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
              aria-label="Menu"
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

<style>
.app-header {
  width: 100%;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 0.5rem 1rem;
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

.user-info {
  display: none;
  align-items: center;
  gap: 0.5rem;
}

.menu-button {
  display: block;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.desktop-menu-trigger {
  padding: 0.5rem;
}

.desktop-menu-trigger:hover {
  background-color: var(--surface-hover);
}

.user-menu {
  background-color: #1E1E1E;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  padding: 0.5rem;
  min-width: 200px;
  z-index: 1000;
}

.user-menu .p-menuitem-link {
  padding: 0.75rem 1rem;
  color: var(--text-color);
  border-radius: 4px;
}

.user-menu .p-menuitem-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-menu .p-menuitem-icon {
  color: var(--text-color);
  margin-right: 0.75rem;
}

.user-menu .p-menuitem-text {
  color: var(--text-color);
}

.user-menu .p-separator {
  border-top: 1px solid var(--surface-border);
  margin: 0.5rem 0;
}

/* Tablet and up */
@media screen and (min-width: 768px) {
  .user-info {
    display: flex;
  }

  .menu-button {
    display: none;
  }
}
</style> 