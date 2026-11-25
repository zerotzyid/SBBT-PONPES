<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-bottom-sheet flex items-end md:items-center md:justify-center"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
    >
      <Transition name="bottom-sheet">
        <div
          class="bottom-sheet-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm z-[199]"
          @click="close"
          aria-hidden="true"
        />
      </Transition>

      <Transition name="bottom-sheet-content">
        <div
          ref="sheetContent"
          class="bottom-sheet-content w-full md:max-w-lg md:rounded-2xl md:max-h-[80vh] bg-surface shadow-2xl flex flex-col"
          role="document"
        >
          <header v-if="!hideHeader" class="flex items-center justify-between p-4 md:p-gutter border-b border-outline-variant/20 sticky top-0 bg-surface/95 backdrop-blur z-10 rounded-t-2xl md:rounded-2xl">
            <div class="flex-1 min-w-0">
              <h2 :id="titleId" class="font-display text-title-lg truncate" :class="titleClass">
                <slot name="title">{{ title }}</slot>
              </h2>
              <p v-if="description" :id="descriptionId" class="text-[11px] mt-0.5 truncate" :class="subtitleClass">
                <slot name="description">{{ description }}</slot>
              </p>
            </div>
            <button
              v-if="closable"
              class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors touch-target flex-shrink-0"
              @click="close"
              aria-label="Tutup"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </header>

          <div
            class="flex-1 overflow-y-auto p-4 md:p-gutter"
            :class="maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[70vh] md:max-h-[80vh]'"
          >
            <slot :close="close" :submit="handleSubmit" :loading="loading" />
          </div>

          <footer v-if="!hideFooter" class="p-4 md:p-gutter border-t border-outline-variant/20 flex flex-col md:flex-row justify-end gap-3 sticky bottom-0 bg-surface/95 backdrop-blur z-10 rounded-b-2xl md:rounded-2xl">
            <slot name="footer">
              <button
                class="w-full md:w-auto px-4 py-2.5 text-on-surface-variant text-label-md hover:bg-surface-container-high rounded-lg touch-target"
                @click="close"
              >
                Batal
              </button>
              <button
                class="w-full md:w-auto px-6 py-2.5 bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all touch-target flex items-center justify-center gap-2"
                @click="handleSubmit"
                :disabled="loading"
              >
                <span v-if="loading" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                {{ loading ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </slot>
          </footer>

          <div v-if="showDragHandle" class="md:hidden flex justify-center pt-2 pb-3">
            <div class="w-10 h-1 bg-surface-container-highest rounded-full" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  maxHeight?: string
  closable?: boolean
  hideHeader?: boolean
  hideFooter?: boolean
  titleClass?: string
  subtitleClass?: string
  persistent?: boolean
  showDragHandle?: boolean
  swipeToClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  maxHeight: '',
  closable: true,
  hideHeader: false,
  hideFooter: false,
  titleClass: 'text-on-surface',
  subtitleClass: 'text-on-surface-variant',
  persistent: false,
  showDragHandle: true,
  swipeToClose: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  submit: []
}>()

const sheetContent = ref<HTMLElement | null>(null)
const loading = ref(false)
const titleId = `bottom-sheet-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `bottom-sheet-desc-${Math.random().toString(36).slice(2)}`

let touchStartY = 0
let touchStartX = 0
let isDragging = false

function close() {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('close')
}

async function handleSubmit() {
  emit('submit')
}

function onTouchStart(e: TouchEvent) {
  if (!props.swipeToClose) return
  touchStartY = e.touches[0].clientY
  touchStartX = e.touches[0].clientX
  isDragging = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging || !sheetContent.value) return
  const touchY = e.touches[0].clientY
  const touchX = e.touches[0].clientX
  const deltaY = touchY - touchStartY
  const deltaX = Math.abs(touchX - touchStartX)

  if (deltaY > 0 && deltaX < 50) {
    sheetContent.value.style.transform = `translateY(${Math.min(deltaY, 200)}px)`
    sheetContent.value.style.transition = 'none'
  }
}

function onTouchEnd(e: TouchEvent) {
  if (!isDragging || !sheetContent.value) return
  isDragging = false
  const touchY = e.changedTouches[0].clientY
  const deltaY = touchY - touchStartY

  sheetContent.value.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'

  if (deltaY > 100) {
    close()
  } else {
    sheetContent.value.style.transform = 'translateY(0)'
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  if (sheetContent.value) {
    sheetContent.value.addEventListener('touchstart', onTouchStart, { passive: true })
    sheetContent.value.addEventListener('touchmove', onTouchMove, { passive: true })
    sheetContent.value.addEventListener('touchend', onTouchEnd)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  if (sheetContent.value) {
    sheetContent.value.removeEventListener('touchstart', onTouchStart)
    sheetContent.value.removeEventListener('touchmove', onTouchMove)
    sheetContent.value.removeEventListener('touchend', onTouchEnd)
  }
})

watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    setTimeout(() => sheetContent.value?.focus(), 100)
  } else {
    document.body.style.overflow = ''
    if (sheetContent.value) {
      sheetContent.value.style.transform = ''
      sheetContent.value.style.transition = ''
    }
  }
})
</script>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-content-enter-active,
.bottom-sheet-content-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bottom-sheet-content-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.bottom-sheet-content-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.bottom-sheet-backdrop-enter-active,
.bottom-sheet-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.bottom-sheet-backdrop-enter-from,
.bottom-sheet-backdrop-leave-to {
  opacity: 0;
}
</style>