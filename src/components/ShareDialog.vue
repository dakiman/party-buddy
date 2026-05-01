<script setup lang="ts">
import { ref, watch, nextTick, useTemplateRef } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import QRCode from 'qrcode'
import { issueShareLink, rotateShareLink } from '@/services/events'
import type { ShareLink } from '@/types'

const props = defineProps<{
  visible: boolean
  eventId: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const toast = useToast()
const confirm = useConfirm()
const link = ref<ShareLink | null>(null)
const loading = ref(false)
const canvas = useTemplateRef<HTMLCanvasElement>('qrCanvas')

watch(
  () => props.visible,
  async (open) => {
    if (open) {
      await loadOrIssue()
    } else {
      link.value = null
    }
  },
)

async function loadOrIssue() {
  loading.value = true
  try {
    link.value = await issueShareLink(props.eventId)
    await renderQr()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not generate share link.',
      life: 3000,
    })
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}

async function renderQr() {
  if (!link.value) return
  // Wait for Vue to mount the canvas (it only renders in the v-else-if="link" branch)
  await nextTick()
  if (!canvas.value || !link.value) return
  await QRCode.toCanvas(canvas.value, link.value.url, { width: 220, margin: 1 })
}

async function copyLink() {
  if (!link.value) return
  try {
    await navigator.clipboard.writeText(link.value.url)
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Share link copied to clipboard.',
      life: 2000,
    })
  } catch {
    toast.add({
      severity: 'info',
      summary: 'Copy with Ctrl+C',
      detail: 'Clipboard unavailable. Select the link and copy manually.',
      life: 4000,
    })
  }
}

function confirmRotate() {
  confirm.require({
    message: 'This will invalidate the current link. Anyone who has it will lose access. Continue?',
    header: 'Regenerate share link',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Regenerate',
    acceptClass: 'p-button-danger',
    accept: async () => {
      loading.value = true
      try {
        link.value = await rotateShareLink(props.eventId)
        await renderQr()
        toast.add({
          severity: 'success',
          summary: 'Regenerated',
          detail: 'A new share link has been issued.',
          life: 2000,
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not regenerate share link.',
          life: 3000,
        })
      } finally {
        loading.value = false
      }
    },
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    header="Share this event"
    :style="{ width: '28rem' }"
  >
    <div v-if="loading && !link" class="share-loading">Generating link…</div>

    <div v-else-if="link" class="share-content">
      <div class="qr-wrap">
        <canvas ref="qrCanvas" />
      </div>

      <div class="share-link-row">
        <InputText :model-value="link.url" readonly fluid />
        <Button icon="pi pi-copy" aria-label="Copy link" @click="copyLink" />
      </div>

      <Button
        label="Regenerate link"
        icon="pi pi-refresh"
        severity="secondary"
        text
        :loading="loading"
        @click="confirmRotate"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.share-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.qr-wrap {
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
}

.share-link-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.share-loading {
  padding: 2rem;
  text-align: center;
  color: var(--p-text-secondary-color);
}
</style>
