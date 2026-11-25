<template>
  <aside
    :class="[
      'h-screen w-64 fixed left-0 top-0 flex flex-col py-stack-md shadow-xl z-sidebar transition-transform duration-300 ease-out',
      sidebarBg,
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0',
    ]"
    :style="{ height: '100vh', height: '100dvh' }"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="px-gutter mb-stack-lg flex items-center gap-3">
      <div :class="iconWrapperClass">
        <span class="material-symbols-outlined text-2xl" :class="iconTextClass">school</span>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="font-display text-headline-md font-bold leading-tight truncate" :class="titleClass">SIM-PPT</h1>
        <p class="text-[10px] tracking-widest uppercase truncate" :class="subtitleClass">{{ roleLabel }}</p>
      </div>
      <button class="md:hidden p-2 rounded-lg touch-target" :class="closeBtnClass" @click="$emit('close')" aria-label="Tutup sidebar">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <nav class="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-hide custom-scrollbar" role="navigation" aria-label="Menu navigasi">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :class="navLinkClass(item.to)"
        @click="$emit('close')"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group touch-target"
      >
        <span class="material-symbols-outlined text-lg" :class="{ [activeIconClass]: isActive(item.to) }">{{ item.icon }}</span>
        <span class="text-label-md truncate">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-auto px-3 space-y-1 border-t border-white/10 pt-stack-md">
      <button
        class="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 touch-target"
        :class="actionBtnClass"
        @click="handleLogout"
      >
        <span class="material-symbols-outlined text-lg">logout</span>
        <span class="text-label-md">Logout</span>
      </button>
    </div>
  </aside>

  <div
    v-if="mobileOpen"
    class="fixed inset-0 bg-black/30 z-[49] md:hidden"
    @click="$emit('close')"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface MenuItem {
  label: string
  icon: string
  to: string
}

type SidebarVariant = 'admin' | 'ustadz' | 'alumni' | 'walisantri' | 'santri'

const props = withDefaults(defineProps<{
  menuItems: MenuItem[]
  roleLabel: string
  variant?: SidebarVariant
  mobileOpen?: boolean
}>(), {
  variant: 'admin',
  mobileOpen: false,
})

defineEmits<{ close: [] }>()

const route = useRoute()

const variantConfig: Record<SidebarVariant, {
  bg: string
  title: string
  subtitle: string
  closeBtn: string
  iconWrapper: string
  iconText: string
  activeBg: string
  activeBorder: string
  activeText: string
  activeIcon: string
  inactiveText: string
  inactiveHover: string
  actionBtn: string
}> = {
  admin: {
    bg: 'bg-primary-container',
    title: 'text-on-primary',
    subtitle: 'text-on-primary/60',
    closeBtn: 'text-on-primary/70 hover:text-on-primary',
    iconWrapper: 'w-10 h-10 rounded-lg bg-primary flex items-center justify-center',
    iconText: 'text-on-primary',
    activeBg: 'bg-white/10',
    activeBorder: 'border-l-4 border-secondary-container',
    activeText: 'text-on-primary font-bold',
    activeIcon: 'text-secondary-container',
    inactiveText: 'text-on-primary/70',
    inactiveHover: 'hover:text-on-primary hover:bg-white/5',
    actionBtn: 'text-on-primary/70 hover:text-on-primary hover:bg-white/5',
  },
  ustadz: {
    bg: 'bg-[#1a3a5c]',
    title: 'text-white',
    subtitle: 'text-white/60',
    closeBtn: 'text-white/70 hover:text-white',
    iconWrapper: 'w-10 h-10 rounded-lg bg-[#2d6a9f] flex items-center justify-center',
    iconText: 'text-white',
    activeBg: 'bg-white/10',
    activeBorder: 'border-l-4 border-[#fbbf24]',
    activeText: 'text-white font-bold',
    activeIcon: 'text-[#fbbf24]',
    inactiveText: 'text-white/70',
    inactiveHover: 'hover:text-white hover:bg-white/5',
    actionBtn: 'text-white/70 hover:text-white hover:bg-white/5',
  },
  alumni: {
    bg: 'bg-[#374151]',
    title: 'text-white',
    subtitle: 'text-white/60',
    closeBtn: 'text-white/70 hover:text-white',
    iconWrapper: 'w-10 h-10 rounded-lg bg-[#6366f1] flex items-center justify-center',
    iconText: 'text-white',
    activeBg: 'bg-white/10',
    activeBorder: 'border-l-4 border-[#a5b4fc]',
    activeText: 'text-white font-bold',
    activeIcon: 'text-[#a5b4fc]',
    inactiveText: 'text-white/70',
    inactiveHover: 'hover:text-white hover:bg-white/5',
    actionBtn: 'text-white/70 hover:text-white hover:bg-white/5',
  },
  walisantri: {
    bg: 'bg-primary',
    title: 'text-on-primary',
    subtitle: 'text-on-primary/60',
    closeBtn: 'text-on-primary/70 hover:text-on-primary',
    iconWrapper: 'w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center',
    iconText: 'text-on-primary',
    activeBg: 'bg-white/10',
    activeBorder: 'border-l-4 border-secondary-container',
    activeText: 'text-on-primary font-bold',
    activeIcon: 'text-secondary-container',
    inactiveText: 'text-on-primary/70',
    inactiveHover: 'hover:text-on-primary hover:bg-white/5',
    actionBtn: 'text-on-primary/70 hover:text-on-primary hover:bg-white/5',
  },
  santri: {
    bg: 'bg-[#0f4c3a]',
    title: 'text-white',
    subtitle: 'text-white/60',
    closeBtn: 'text-white/70 hover:text-white',
    iconWrapper: 'w-10 h-10 rounded-lg bg-[#2e7d5e] flex items-center justify-center',
    iconText: 'text-white',
    activeBg: 'bg-white/10',
    activeBorder: 'border-l-4 border-[#4caf50]',
    activeText: 'text-white font-bold',
    activeIcon: 'text-[#4caf50]',
    inactiveText: 'text-white/70',
    inactiveHover: 'hover:text-white hover:bg-white/5',
    actionBtn: 'text-white/70 hover:text-white hover:bg-white/5',
  },
}

const cfg = computed(() => variantConfig[props.variant])

const sidebarBg = computed(() => cfg.value.bg)
const titleClass = computed(() => cfg.value.title)
const subtitleClass = computed(() => cfg.value.subtitle)
const closeBtnClass = computed(() => cfg.value.closeBtn)
const iconWrapperClass = computed(() => cfg.value.iconWrapper)
const iconTextClass = computed(() => cfg.value.iconText)
const activeIconClass = computed(() => cfg.value.activeIcon)
const actionBtnClass = computed(() => cfg.value.actionBtn)

function navLinkClass(to: string) {
  const active = isActive(to)
  return [
    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group touch-target',
    active ? cfg.value.activeBg : cfg.value.inactiveText + ' ' + cfg.value.inactiveHover,
    active ? cfg.value.activeBorder : '',
    active ? cfg.value.activeText : '',
  ]
}

function isActive(path: string) {
  if (path === '/super-admin/dashboard' || path === '/wali-santri/dashboard' || path === '/student/dashboard') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

async function handleLogout() {
  const { logout } = useAuth()
  await logout()
  navigateTo('/auth/login')
}

let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function onTouchMove(e: TouchEvent) {
  if (!props.mobileOpen) return
  const touchX = e.touches[0].clientX
  const deltaX = touchX - touchStartX
  if (deltaX < -50) {
    emit('close')
  }
}

function onTouchEnd() {
  touchStartX = 0
}

watch(() => props.mobileOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>