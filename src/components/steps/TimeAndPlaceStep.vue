<script setup lang="ts">
import { ref, computed } from 'vue'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import GoogleMapPicker from '../GoogleMapPicker.vue'
import { useWizardStore } from '@/stores/wizard'

const wizardStore = useWizardStore()
const includeLocation = ref(!!wizardStore.formData.location)
const touched = ref(false)

// Set default event name if it's empty
if (!wizardStore.formData.name) {
    wizardStore.updateFormData({ name: 'My awesome party' })
}

const isValid = computed(() => 
    wizardStore.formData.date !== null && 
    wizardStore.formData.name && 
    wizardStore.formData.name.trim() !== ''
)
const showError = computed(() => touched.value && !wizardStore.formData.date)
const showNameError = computed(() => touched.value && (!wizardStore.formData.name || wizardStore.formData.name.trim() === ''))

const setTouched = () => {
    touched.value = true
}

const updateDate = (value: Date | null) => {
    wizardStore.updateFormData({ date: value })
}

const updateTime = (value: Date | null) => {
    wizardStore.updateFormData({ time: value })
}

const updateLocation = (value: { lat: number; lng: number } | null) => {
    wizardStore.updateFormData({ location: value })
}

const updateLocationDescription = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    wizardStore.updateFormData({ locationDescription: value })
}

const updateName = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    wizardStore.updateFormData({ name: value })
}

const handleNameFocus = () => {
    // Clear the default value when focused if it's still the default
    if (wizardStore.formData.name === 'My awesome party') {
        wizardStore.updateFormData({ name: '' })
    }
}

defineExpose({
    isValid,
    setTouched
})
</script>

<template>
    <div class="time-place-step">
        <div class="form-field">
            <label>What's your event called? <span class="required">*</span></label>
            <input
                type="text"
                :value="wizardStore.formData.name"
                @input="updateName"
                @focus="handleNameFocus"
                placeholder="My awesome party"
                class="p-inputtext"
            />
            <small v-if="showNameError" class="error-text">Event name is required</small>
        </div>

        <div class="form-field">
            <label>What day is your event? <span class="required">*</span></label>
            <Calendar 
                :modelValue="wizardStore.formData.date" 
                @update:modelValue="updateDate" 
                :minDate="new Date()"
                :showIcon="true" 
                dateFormat="dd/mm/yy"
                class="responsive-calendar"
            />
            <small v-if="showError" class="error-text">Date is required</small>
        </div>

        <div class="form-field">
            <label>What time?</label>
            <Calendar :modelValue="wizardStore.formData.time" @update:modelValue="updateTime" showIcon fluid
                iconDisplay="input" timeOnly :stepMinute="15" :defaultTime="{ hours: 12, minutes: 0 }">
                <template #inputicon="slotProps">
                    <i class="pi pi-clock" @click="slotProps.clickCallback" />
                </template>
            </Calendar>

        </div>

        <div class="form-field location-field">
            <div class="location-checkbox">
                <Checkbox v-model="includeLocation" :binary="true" inputId="location" />
                <label for="location">Share location on map?</label>
            </div>

            <transition name="fade">
                <div v-if="includeLocation" class="location-container">
                    <div class="location-description">
                        <small class="helper-text">You can add an optional description for the location (map pin is also optional)</small>
                        <input
                            type="text"
                            :value="wizardStore.formData.locationDescription"
                            @input="updateLocationDescription"
                            placeholder="Location description"
                            class="p-inputtext"
                        />
                    </div>
                    <div class="location-picker">
                        <GoogleMapPicker :modelValue="wizardStore.formData.location" @update:modelValue="updateLocation" />
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<style>
/* Remove previous problematic styles and add these */
.responsive-calendar {
    width: 100%;
}

/* Only style the popup panel, not the input */
.p-datepicker-panel {
    max-width: 95vw !important;
    width: auto !important;
    overflow: auto !important;
}

/* These styles are important for mobile */
@media screen and (max-width: 768px) {
    .p-datepicker table {
        font-size: 0.85rem !important;
    }
    
    .p-datepicker table td, .p-datepicker table th {
        padding: 0.3rem !important;
    }
}

/* Keep existing styles */
.time-place-step {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-field {
    margin-bottom: 0.3rem !important;
}

.form-field label {
    font-weight: 500;
    color: var(--text-color);
}

.required {
    color: #ff4c51;
    margin-left: 0.25rem;
}

.error-text {
    color: #ff4c51 !important;
    font-size: 0.875rem;
}

.location-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.location-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.location-description input {
    width: 100%;
    color: var(--text-color);
    padding: 0.5rem;
    margin-top: 0.5rem;
}

.location-picker {
    margin-top: 1rem;
}

.p-calendar {
    width: 100%;
}

.p-calendar input {
    width: 100%;
    background-color: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
}

.p-calendar .p-button {
    background-color: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
}

.p-checkbox .p-checkbox-box {
    border: 1px solid var(--surface-border);
}

.p-checkbox .p-checkbox-box.p-highlight {
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

.location-description {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.helper-text {
    color: var(--text-secondary-color);
    font-size: 0.875rem;
    margin-left: 0.25rem;
}
</style>