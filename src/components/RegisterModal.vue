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
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  name: { required, minLength: minLength(2) },
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

    await authStore.register(form.value.email, form.value.password, form.value.name)
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
  form.value = { name: '', email: '', password: '', confirmPassword: '' }
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
          id="name"
          v-model="form.name"
          :class="{ 'p-invalid': v$.name.$error }"
          placeholder="Name"
        />
        <small class="p-error" v-if="v$.name.$error">
          Name must be at least 2 characters long
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

<style scoped>
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

:deep(.p-password input),
:deep(.p-inputtext) {
  width: 100%;
  background-color: transparent;
  border: 1px solid var(--surface-border);
  color: var(--text-color);
  padding: 0.75rem;
}

:deep(.p-password-input) {
  background-color: transparent !important;
}

:deep(.p-password i) {
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

:deep(.p-dialog) {
  background-color: #1E1E1E;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

:deep(.p-dialog-header) {
  padding: 1.5rem;
  background-color: transparent;
  border-bottom: none;
  color: var(--text-color);
  font-family: 'Outfit', sans-serif;
}

:deep(.p-dialog-content) {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background-color: transparent;
}

:deep(.p-dialog-header-close) {
  color: var(--text-color);
}

:deep(.p-dialog-header-close:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.p-error) {
  color: #ef4444;
  font-size: 0.875rem;
}
</style> 