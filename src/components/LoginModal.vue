<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength } from '@vuelidate/validators'
import { getApiErrorMessage } from '@/utils/errors'

const authStore = useAuthStore()
const toast = useToast()

const visible = ref(false)
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: { 
    required,
    minLength: minLength(3)
  },
  password: { required }
}

const v$ = useVuelidate(rules, form)

async function handleSubmit() {
  loading.value = true
  try {
    const isValid = await v$.value.$validate()
    if (!isValid) return

    await authStore.login(form.value.username, form.value.password)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully', life: 3000 })
    visible.value = false
    resetForm()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: getApiErrorMessage(error, 'Login failed'), life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { username: '', password: '' }
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
    header="Login"
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
        <Password
          id="password"
          v-model="form.password"
          :feedback="false"
          :toggleMask="true"
          placeholder="Password"
          :class="{ 'p-invalid': v$.password.$error }"
        />
        <small class="p-error" v-if="v$.password.$error">
          Password is required
        </small>
      </div>

      <Button
        type="submit"
        label="Login"
        :loading="loading"
        class="login-button"
      />
    </form>
  </Dialog>
</template>

<style scoped>
/* Dialog chrome (.p-dialog*) lives in src/assets/main.css — the dialog
   teleports to <body>, out of reach of scoped styles (R3). */
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

.p-password :deep(input),
.p-inputtext {
  width: 100%;
  padding: 0.75rem;
}

.p-password :deep(i) {
  color: var(--p-text-color);
}

.login-button {
  width: 100%;
  background-color: #7B7EF6;
  border: none;
  padding: 0.75rem;
}

.login-button:hover {
  background-color: #6366F1;
}
</style>
