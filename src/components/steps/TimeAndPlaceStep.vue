<script setup lang="ts">
import { ref, computed } from 'vue'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import GoogleMapPicker from '../GoogleMapPicker.vue'
import { useWizardStore } from '@/stores/wizard'

const wizardStore = useWizardStore()
const includeLocation = ref(!!wizardStore.formData.location)
const touched = ref(false)
const showCustomTime = ref(false)

const isValid = computed(() =>
    wizardStore.formData.date !== null &&
    wizardStore.formData.name &&
    wizardStore.formData.name.trim() !== ''
)
const showError = computed(() => touched.value && !wizardStore.formData.date)
const showNameError = computed(() => touched.value && (!wizardStore.formData.name || wizardStore.formData.name.trim() === ''))

const setTouched = () => { touched.value = true }

function startOfDay(d: Date): Date {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
}

function sameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate()
}

const today = computed(() => startOfDay(new Date()))

interface DateChip { key: string; label: string; icon: string; date: Date }

const dateChips = computed<DateChip[]>(() => {
    const now = new Date()
    const t = today.value
    const dow = t.getDay() // 0 = Sun .. 6 = Sat
    const chips: DateChip[] = []

    if (now.getHours() < 22) {
        chips.push({ key: 'tonight', label: 'Tonight', icon: 'pi pi-moon', date: new Date(t) })
    }

    const tomorrow = new Date(t)
    tomorrow.setDate(tomorrow.getDate() + 1)
    chips.push({ key: 'tomorrow', label: 'Tomorrow', icon: 'pi pi-sun', date: tomorrow })

    if (dow >= 1 && dow <= 4) {
        const fri = new Date(t)
        fri.setDate(t.getDate() + (5 - dow))
        chips.push({ key: 'this-fri', label: 'This Fri', icon: 'pi pi-calendar', date: fri })
    }

    if (dow >= 1 && dow <= 5) {
        const sat = new Date(t)
        sat.setDate(t.getDate() + (6 - dow))
        chips.push({ key: 'this-sat', label: 'This Sat', icon: 'pi pi-star', date: sat })
    }

    const nextFri = new Date(t)
    const daysToNextFri = dow <= 5 ? (5 - dow) + 7 : (5 - dow + 7) + 7
    nextFri.setDate(t.getDate() + daysToNextFri)
    chips.push({ key: 'next-fri', label: 'Next Fri', icon: 'pi pi-calendar', date: nextFri })

    const nextSat = new Date(t)
    const daysToNextSat = dow === 6 ? 7 : (6 - dow) + 7
    nextSat.setDate(t.getDate() + daysToNextSat)
    chips.push({ key: 'next-sat', label: 'Next Sat', icon: 'pi pi-star', date: nextSat })

    const inTwoWeeks = new Date(t)
    inTwoWeeks.setDate(t.getDate() + 14)
    chips.push({ key: 'in-2-weeks', label: 'In 2 weeks', icon: 'pi pi-forward', date: inTwoWeeks })

    return chips
})

function selectDateChip(chip: DateChip) {
    wizardStore.updateFormData({ date: chip.date })
}

const isDateChipActive = (chip: DateChip): boolean =>
    sameDay(wizardStore.formData.date, chip.date)

interface TimeChip { label: string; hours: number; minutes: number }

const timeChips: TimeChip[] = [
    { label: '17:00', hours: 17, minutes: 0 },
    { label: '18:00', hours: 18, minutes: 0 },
    { label: '19:00', hours: 19, minutes: 0 },
    { label: '20:00', hours: 20, minutes: 0 },
    { label: '21:00', hours: 21, minutes: 0 },
    { label: '22:00', hours: 22, minutes: 0 },
    { label: '23:00', hours: 23, minutes: 0 },
]

function selectTimeChip(chip: TimeChip) {
    const t = new Date()
    t.setHours(chip.hours, chip.minutes, 0, 0)
    wizardStore.updateFormData({ time: t })
    showCustomTime.value = false
}

function isTimeChipActive(chip: TimeChip): boolean {
    const t = wizardStore.formData.time
    if (!t) return false
    return t.getHours() === chip.hours && t.getMinutes() === chip.minutes
}

const isCustomTime = computed(() => {
    const t = wizardStore.formData.time
    if (!t) return false
    return !timeChips.some(c => c.hours === t.getHours() && c.minutes === t.getMinutes())
})

function toggleCustomTime() {
    showCustomTime.value = !showCustomTime.value
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

const selectionSummary = computed(() => {
    const d = wizardStore.formData.date
    if (!d) return ''
    const dayOfWeek = d.toLocaleDateString(undefined, { weekday: 'long' })
    const monthDay = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    const t = wizardStore.formData.time
    if (!t) return `${dayOfWeek}, ${monthDay}`
    const hh = String(t.getHours()).padStart(2, '0')
    const mm = String(t.getMinutes()).padStart(2, '0')
    return `${dayOfWeek}, ${monthDay} · ${hh}:${mm}`
})

defineExpose({ isValid, setTouched })
</script>

<template>
    <div class="time-place-step">
        <div class="form-field">
            <label>What's your event called? <span class="required">*</span></label>
            <input
                type="text"
                :value="wizardStore.formData.name"
                @input="updateName"
                placeholder="My awesome party"
                class="p-inputtext"
            />
            <small v-if="showNameError" class="error-text">Event name is required</small>
        </div>

        <div class="form-field">
            <label>When's the party? <span class="required">*</span></label>
            <div class="when-card" :class="{ 'has-error': showError }">
                <div class="when-card-left">
                    <div class="chip-row chip-row-dates">
                        <button
                            v-for="chip in dateChips"
                            :key="chip.key"
                            type="button"
                            class="chip chip-date"
                            :class="{ 'chip-active': isDateChipActive(chip) }"
                            @click="selectDateChip(chip)"
                        >
                            <i :class="chip.icon" />
                            <span>{{ chip.label }}</span>
                        </button>
                    </div>

                    <Calendar
                        :modelValue="wizardStore.formData.date"
                        @update:modelValue="updateDate"
                        :minDate="today"
                        :inline="true"
                        class="when-calendar"
                    />
                </div>

                <div class="when-card-right">
                    <div class="time-row">
                        <span class="time-label">Time</span>
                        <div class="chip-row chip-row-times">
                            <button
                                v-for="chip in timeChips"
                                :key="chip.label"
                                type="button"
                                class="chip chip-time"
                                :class="{ 'chip-active': isTimeChipActive(chip) }"
                                @click="selectTimeChip(chip)"
                            >{{ chip.label }}</button>
                            <button
                                type="button"
                                class="chip chip-time"
                                :class="{ 'chip-active': isCustomTime || showCustomTime }"
                                @click="toggleCustomTime"
                            >Custom…</button>
                        </div>
                    </div>

                    <div v-if="showCustomTime || isCustomTime" class="custom-time">
                        <Calendar
                            :modelValue="wizardStore.formData.time"
                            @update:modelValue="updateTime"
                            timeOnly
                            :stepMinute="15"
                            :defaultTime="{ hours: 20, minutes: 0 }"
                            showIcon
                            iconDisplay="input"
                            appendTo="body"
                        >
                            <template #inputicon="slotProps">
                                <i class="pi pi-clock" @click="slotProps.clickCallback" />
                            </template>
                        </Calendar>
                    </div>

                    <div class="selection-summary" :class="{ 'is-empty': !selectionSummary }">
                        <template v-if="selectionSummary">
                            <i class="pi pi-check-circle" />
                            <span>{{ selectionSummary }}</span>
                        </template>
                        <template v-else>
                            <i class="pi pi-calendar" />
                            <span>Pick a day to get started</span>
                        </template>
                    </div>
                </div>
            </div>
            <small v-if="showError" class="error-text">Date is required</small>
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

.when-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    margin-top: 0.5rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
}

.when-card.has-error {
    border-color: #ff4c51;
}

.when-card-left,
.when-card-right {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}

.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.825rem;
    line-height: 1.2;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.chip .pi {
    font-size: 0.8rem;
    color: #7B7EF6;
    transition: color 0.15s;
}

.chip:hover {
    border-color: #7B7EF6;
}

.chip-active {
    background: #7B7EF6;
    border-color: #7B7EF6;
    color: white;
}

.chip-active .pi {
    color: white;
}

.chip-time {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    min-width: 3.25rem;
    justify-content: center;
}

.when-calendar {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
}

.when-calendar .p-datepicker,
.when-calendar .p-datepicker-panel {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border: none;
    background: transparent;
    box-sizing: border-box;
}

.when-calendar .p-datepicker table,
.when-calendar .p-datepicker-panel table {
    width: 100%;
    table-layout: fixed;
    font-size: 0.85rem;
}

.when-calendar .p-datepicker table th,
.when-calendar .p-datepicker table td,
.when-calendar .p-datepicker-panel table th,
.when-calendar .p-datepicker-panel table td {
    padding: 0.25rem 0.1rem;
    text-align: center;
}

.when-calendar .p-datepicker-header,
.when-calendar .p-datepicker-panel .p-datepicker-header {
    flex-wrap: wrap;
    padding: 0.25rem 0;
    font-size: 0.9rem;
}

.time-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.time-label {
    font-size: 0.875rem;
    color: var(--text-secondary-color);
}

.custom-time {
    display: flex;
}

.selection-summary {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    background: #7B7EF6;
    border: 1px solid #7B7EF6;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.2;
}

.selection-summary .pi {
    font-size: 0.9rem;
    color: white;
}

.selection-summary.is-empty {
    background: transparent;
    border-color: var(--surface-border);
    border-style: dashed;
    color: var(--text-secondary-color);
    font-weight: 500;
}

.selection-summary.is-empty .pi {
    color: var(--text-secondary-color);
}

/* Desktop: two-column layout — calendar left, chips/time/summary right */
@media screen and (min-width: 640px) {
    .when-card {
        flex-direction: row;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .when-card-left {
        flex: 0 0 300px;
        max-width: 300px;
    }

    .when-card-right {
        flex: 1;
    }
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

@media screen and (max-width: 639px) {
    .when-card {
        padding: 0.75rem;
    }
    .when-calendar .p-datepicker table,
    .when-calendar .p-datepicker-panel table {
        font-size: 0.8rem;
    }
}
</style>
