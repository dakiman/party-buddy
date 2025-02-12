<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps<{
    modelValue?: { lat: number; lng: number } | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: { lat: number; lng: number } | null]
}>()

const mapDiv = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const marker = ref<google.maps.Marker | null>(null)

const defaultCenter = { lat: 51.5074, lng: -0.1278 } // London as fallback center

// Get user's current location
const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => {
                console.warn('Error getting location:', error)
                resolve(defaultCenter) // Fallback to default if user denies or error occurs
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
    })
}

// Initialize Google Maps
onMounted(async () => {
    const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
    })

    try {
        const google = await loader.load()

        // Get initial center (user location or default)
        const initialCenter = props.modelValue || await getCurrentLocation()

        map.value = new google.maps.Map(mapDiv.value!, {
            center: initialCenter,
            zoom: 13,
        })

        // If we have an initial location, show the marker
        if (props.modelValue) {
            marker.value = new google.maps.Marker({
                position: props.modelValue,
                map: map.value,
                draggable: true
            })
        }

        // Add click listener to map
        map.value.addListener('click', (e: google.maps.MapMouseEvent) => {
            const latLng = e.latLng!

            if (marker.value) {
                marker.value.setPosition(latLng)
            } else {
                marker.value = new google.maps.Marker({
                    position: latLng,
                    map: map.value!,
                    draggable: true
                })
            }

            emit('update:modelValue', {
                lat: latLng.lat(),
                lng: latLng.lng()
            })
        })

        // Add drag end listener to marker
        if (marker.value) {
            marker.value.addListener('dragend', () => {
                const latLng = marker.value!.getPosition()!
                emit('update:modelValue', {
                    lat: latLng.lat(),
                    lng: latLng.lng()
                })
            })
        }
    } catch (error) {
        console.error('Error loading Google Maps:', error)
    }
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
    if (!map.value || !newValue) return

    if (marker.value) {
        marker.value.setPosition(newValue)
    } else {
        marker.value = new google.maps.Marker({
            position: newValue,
            map: map.value,
            draggable: true
        })
    }

    map.value.panTo(newValue)
}, { deep: true })
</script>

<template>
    <div ref="mapDiv" class="map-container"></div>
</template>

<style scoped>
.map-container {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
}
</style>