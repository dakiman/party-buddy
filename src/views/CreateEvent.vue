<script setup lang="ts">
import { useRouter } from 'vue-router'
import EventWizard from '@/components/EventWizard.vue'

const router = useRouter()
</script>

<template>
  <EventWizard @cancel="router.push('/')" />
</template>
