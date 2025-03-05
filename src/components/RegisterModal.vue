<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'

const authStore = useAuthStore()
const toast = useToast()

const visible = ref(false)
const loading = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: { required, minLength: minLength(3) },
  email: { required, email },
  password: { required, minLength: minLength(8) },
  confirmPassword: { 
    required,
    sameAsPassword: (value: string) => value === form.value.password 
  }
}

const v$ = useVuelidate(rules, form)

async function handleSubmit() {
  loading.value = true
  try {
    const isValid = await v$.value.$validate()
    if (!isValid) return

    await authStore.register(
      form.value.email,
      form.value.password,
      form.value.username
    )
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Registered successfully', life: 3000 })
    visible.value = false
    resetForm()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Registration failed', life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { username: '', email: '', password: '', confirmPassword: '' }
  v$.value.$reset()
}

defineExpose({
  show: () => { visible.value = true }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Register"
    :style="{ width: '90vw', maxWidth: '350px' }"
    class="auth-dialog"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-field">
        <InputText
          id="username"
          v-model="form.username"
          :class="{ 'p-invalid': v$.username.$error }"
          placeholder="Username"
        />
        <small class="p-error" v-if="v$.username.$error">
          Username must be at least 3 characters long
        </small>
      </div>

      <div class="form-field">
        <InputText
          id="email"
          v-model="form.email"
          :class="{ 'p-invalid': v$.email.$error }"
          placeholder="Email"
        />
        <small class="p-error" v-if="v$.email.$error">
          Please enter a valid email address
        </small>
      </div>

      <div class="form-field">
        <Password
          id="password"
          v-model="form.password"
          :feedback="false"
          :toggleMask="true"
          placeholder="Password"
          :class="{ 'p-invalid': v$.password.$error }"
        />
        <small class="p-error" v-if="v$.password.$error">
          Password must be at least 8 characters long
        </small>
      </div>

      <div class="form-field">
        <Password
          id="confirm-password"
          v-model="form.confirmPassword"
          :feedback="false"
          :toggleMask="true"
          placeholder="Confirm Password"
          :class="{ 'p-invalid': v$.confirmPassword.$error }"
        />
        <small class="p-error" v-if="v$.confirmPassword.$error">
          Passwords must match
        </small>
      </div>

      <Button
        type="submit"
        label="Register"
        :loading="loading"
        class="register-button"
      />
    </form>
  </Dialog>
</template>

<style>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-password input,
.p-inputtext {
  width: 100%;
  padding: 0.75rem;
}

.p-password i {
  color: var(--text-color);
}

.register-button {
  width: 100%;
  background-color: #7B7EF6;
  border: none;
  padding: 0.75rem;
}

.register-button:hover {
  background-color: #6366F1;
}

.p-dialog {
  background-color: #1E1E1E;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.p-dialog-header {
  padding: 1.5rem;
  background-color: transparent;
  border-bottom: none;
  color: var(--text-color);
  font-family: 'Outfit', sans-serif;
}

.p-dialog-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background-color: transparent;
}

.p-dialog-header-close {
  color: var(--text-color);
}

.p-dialog-header-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
}
</style> 