<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
      @click.self="close"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
    >
      <Transition name="modal">
        <div
          :class="[
            'bg-surface rounded-2xl shadow-2xl overflow-hidden animate-modal-enter w-full',
            modalClasses,
            fullscreenOnMobile ? 'modal-fullscreen' : '',
          ]"
          ref="modalContent"
        >
          <header v-if="!hideHeader" class="flex items-center justify-between gap-4 p-4 md:p-gutter border-b border-outline-variant/20" :class="headerBg">
            <div class="flex-1 min-w-0">
              <h2 :id="titleId" class="font-display text-headline-md truncate" :class="titleClass">
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
              aria-label="Tutup modal"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </header>

          <div
            class="overflow-y-auto"
            :class="[
              'p-4 md:p-gutter',
              maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[70vh] md:max-h-[80vh]',
            ]"
          >
            <slot :close="close" :submit="handleSubmit" :loading="loading" />
          </div>

          <footer v-if="!hideFooter" class="p-4 md:p-gutter border-t border-outline-variant/20 flex flex-col md:flex-row justify-end gap-3">
            <slot name="footer">
              <button
                class="px-4 py-2.5 text-on-surface-variant text-label-md hover:bg-surface-container-high rounded-lg touch-target"
                @click="close"
              >
                Batal
              </button>
              <button
                class="px-6 py-2.5 bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all touch-target flex items-center justify-center gap-2"
                @click="handleSubmit"
                :disabled="loading"
              >
                <span v-if="loading" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                {{ loading ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </slot>
          </footer>
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
  fullscreenOnMobile?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  maxHeight?: string
  closable?: boolean
  hideHeader?: boolean
  hideFooter?: boolean
  headerBg?: string
  titleClass?: string
  subtitleClass?: string
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  fullscreenOnMobile: true,
  maxWidth: 'lg',
  maxHeight: '',
  closable: true,
  hideHeader: false,
  hideFooter: false,
  headerBg: '',
  titleClass: 'text-primary',
  subtitleClass: 'text-on-primary/80',
  persistent: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  submit: []
}>()

const modalContent = ref<HTMLElement | null>(null)
const loading = ref(false)
const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `modal-desc-${Math.random().toString(36).slice(2)}`

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-full',
}

const modalClasses = computed(() => maxWidthClasses[props.maxWidth] || maxWidthClasses.lg)

function close() {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('close')
}

async function handleSubmit() {
  emit('submit')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable && !props.persistent) {
    close()
  }
}

function onClickOutside(e: MouseEvent) {
  if (modalContent.value && !modalContent.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    setTimeout(() => modalContent.value?.focus(), 100)
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>