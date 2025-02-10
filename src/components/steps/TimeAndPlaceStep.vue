<script setup lang="ts">
import { ref, computed } from 'vue'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'

const date = ref(null)
const time = ref(null)
const includeLocation = ref(false)
const touched = ref(false)

const isValid = computed(() => date.value !== null)
const showError = computed(() => touched.value && !date.value)

const setTouched = () => {
  touched.value = true
}

defineExpose({
  isValid,
  setTouched
})
</script>

<template>
    <div class="time-place-step">
        <div class="form-field">
            <label>What day is your event? <span class="required">*</span></label>
            <Calendar v-model="date" :minDate="new Date()" :showIcon="true" dateFormat="dd/mm/yy" class="w-full" />
            <small v-if="showError" class="error-text">Date is required</small>
        </div>

        <div class="form-field">
            <label>What time?</label>
            <Calendar v-model="time" showIcon fluid iconDisplay="input" timeOnly>
                <template #inputicon="slotProps">
                    <i class="pi pi-clock" @click="slotProps.clickCallback" />
                </template>
            </Calendar>
        </div>

        <div class="form-field location-field">
            <div class="location-checkbox">
                <Checkbox v-model="includeLocation" :binary="true" inputId="location" />
                <label for="location">Location?</label>
            </div>

            <transition name="fade">
                <div v-if="includeLocation" class="location-picker">
                    Pick location
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>
.time-place-step {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-weight: 500;
    color: var(--text-color);
}

.required {
    color: var(--red-500);
    margin-left: 0.25rem;
}

.error-text {
    color: var(--red-500);
    font-size: 0.875rem;
}

.location-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.location-picker {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 6px;
}

:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-calendar input) {
    width: 100%;
    background-color: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
}

:deep(.p-calendar .p-button) {
    background-color: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
}

:deep(.p-checkbox .p-checkbox-box) {
    background-color: transparent;
    border: 1px solid var(--surface-border);
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
    background-color: #7B7EF6;
    border-color: #7B7EF6;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>