<template>
  <header
    class="fixed top-0 right-0 left-0 md:left-16 z-topbar h-16 md:h-16 bg-surface/60 backdrop-blur-xl border-b border-white/20 shadow-sm flex justify-between items-center px-4 md:px-gutter"
    :style="{ height: 'var(--topbar-height, 4rem)' }"
    role="banner"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <button class="md:hidden p-2 rounded-lg touch-target text-primary" @click="$emit('toggle-sidebar')" aria-label="Buka menu">
        <span class="material-symbols-outlined text-xl">menu</span>
      </button>

      <div class="relative flex-1 min-w-0">
        <div class="flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30 w-full">
          <span class="material-symbols-outlined text-outline text-sm">search</span>
          <input
            v-model="searchQuery"
            type="text"
            class="bg-transparent border-none focus:ring-0 text-body-md w-full ml-2 placeholder:text-on-surface-variant outline-none"
            placeholder="Cari santri, ustadz, atau konten..."
            @input="onSearchInput"
            @focus="showSearchModal = true"
            @keydown.escape="showSearchModal = false"
            @keydown.down.prevent="highlightNext"
            @keydown.up.prevent="highlightPrev"
            @keydown.enter="navigateHighlighted"
            aria-label="Pencarian global"
            aria-expanded="showSearchModal"
            aria-controls="search-results"
            autocomplete="off"
          />
          <button
            v-if="searchQuery"
            class="text-on-surface-variant hover:text-on-surface ml-1 p-1 touch-target"
            @click="clearSearch"
            aria-label="Hapus pencarian"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <Teleport to="body">
          <div
            v-if="showSearchModal"
            id="search-results"
            class="fixed inset-0 z-[100] md:absolute md:top-full md:left-0 md:right-0 md:inset-auto md:mt-2 bg-surface rounded-2xl md:rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden max-h-[70vh] md:max-h-[70vh] animate-slide-up"
            role="listbox"
            aria-label="Hasil pencarian"
          >
            <div v-if="loading" class="p-6 text-center text-on-surface-variant text-label-md">
              <span class="material-symbols-outlined animate-spin align-middle mr-2 text-sm">refresh</span> Mencari...
            </div>
            <div v-else-if="searchQuery.length < 1" class="p-6 text-center text-on-surface-variant text-label-md">
              Ketik untuk mencari santri, ustadz, atau konten
            </div>
            <div v-else-if="results.students.length === 0 && results.teachers.length === 0" class="p-6 text-center text-on-surface-variant text-label-md">
              Tidak ditemukan hasil untuk "{{ searchQuery }}"
            </div>
            <template v-else>
              <div v-if="results.students.length > 0" class="p-3 pb-0 max-h-[50vh] overflow-y-auto">
                <p class="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold px-3 mb-1">Santri</p>
                <div
                  v-for="(s, i) in results.students"
                  :key="s.id"
                  :class="[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors touch-target',
                    highlightedIndex === i ? 'bg-primary-fixed/20' : 'hover:bg-surface-container-high',
                  ]"
                  @click="navigateToStudent(s)"
                  @mouseenter="highlightedIndex = i"
                  role="option"
                  :aria-selected="highlightedIndex === i"
                >
                  <div class="w-9 h-9 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-label-sm shrink-0">
                    {{ getInitials(s.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-label-md text-on-surface truncate">{{ s.name }}</p>
                    <p class="text-[11px] text-on-surface-variant truncate">NIS: {{ s.nis || '-' }} &bull; {{ s.class || '-' }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" @click.stop>
                    <button class="p-1.5 rounded-lg hover:bg-primary-fixed/20 text-primary transition-colors touch-target" title="Lihat Detail" @click="navigateToStudent(s)">
                      <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="results.teachers.length > 0" class="p-3 max-h-[50vh] overflow-y-auto">
                <p class="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold px-3 mb-1">Ustadz / Guru</p>
                <div
                  v-for="(t, i) in results.teachers"
                  :key="t.id"
                  :class="[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors touch-target',
                    highlightedIndex === results.students.length + i ? 'bg-primary-fixed/20' : 'hover:bg-surface-container-high',
                  ]"
                  @click="navigateToTeacher(t)"
                  @mouseenter="highlightedIndex = results.students.length + i"
                  role="option"
                  :aria-selected="highlightedIndex === results.students.length + i"
                >
                  <div class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-label-sm shrink-0">
                    {{ getInitials(t.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-label-md text-on-surface truncate">{{ t.name }}</p>
                    <p class="text-[11px] text-on-surface-variant truncate">{{ t.specialization || '-' }} &bull; {{ t.status || '-' }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0" @click.stop>
                    <button class="p-1.5 rounded-lg hover:bg-primary-fixed/20 text-primary transition-colors touch-target" title="Lihat Detail" @click="navigateToTeacher(t)">
                      <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </Teleport>
      </div>
    </div>

    <div class="flex items-center gap-2 md:gap-stack-md shrink-0">
      <div
        class="relative hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors select-none touch-target"
        :class="systemStatus.status === 'healthy' ? 'bg-green-50 text-green-700 hover:bg-green-100' : systemStatus.status === 'degraded' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'"
        @click="toggleSystemPopup"
        aria-label="Status sistem"
      >
        <span class="w-2 h-2 rounded-full" :class="systemStatus.status === 'healthy' ? 'bg-green-500 animate-pulse' : systemStatus.status === 'degraded' ? 'bg-red-500' : 'bg-on-surface-variant'" aria-hidden="true"></span>
        <span class="text-label-sm">System</span>
      </div>

      <div class="relative">
        <button
          class="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-colors touch-target relative"
          @click="toggleNotifPopup"
          aria-label="Notifikasi"
          aria-expanded="showNotifPopup"
          aria-controls="notif-popup"
        >
          <span class="material-symbols-outlined text-lg">notifications</span>
          <span
            v-if="notifications.length > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center"
            aria-label="{{ notifications.length }} notifikasi baru"
          >
            {{ notifications.length > 9 ? '9+' : notifications.length }}
          </span>
        </button>

        <Teleport to="body">
          <div
            v-if="showNotifPopup"
            id="notif-popup"
            class="fixed right-4 md:right-0 top-[calc(var(--topbar-height, 4rem) + 8px)] z-[100] w-80 md:w-80 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-slide-up"
            role="menu"
          >
            <div class="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
              <span class="text-label-md font-bold text-on-surface">Notifikasi</span>
              <span class="text-label-sm text-on-surface-variant">{{ notifications.length }} baru</span>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-if="loadingNotif" class="p-6 text-center text-on-surface-variant text-label-md">
                <span class="material-symbols-outlined animate-spin align-middle mr-2 text-sm">refresh</span> Memuat...
              </div>
              <div v-else-if="notifications.length === 0" class="p-6 text-center text-on-surface-variant text-label-md">Tidak ada notifikasi</div>
              <template v-else>
                <div
                  v-for="n in notifications.slice(0, 10)"
                  :key="n.id"
                  class="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-b-0 touch-target"
                  role="menuitem"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :style="{ backgroundColor: n.color || '#e8f0fe' }">
                    <span class="material-symbols-outlined text-sm" :style="{ color: n.color ? '#fff' : '#1a6bff' }">{{ n.icon || 'notifications' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-label-sm text-on-surface truncate">{{ n.action || n.title || '-' }}</p>
                    <p class="text-[11px] text-on-surface-variant truncate">{{ n.description || n.message || '' }}</p>
                    <p class="text-[10px] text-on-surface-variant mt-0.5">{{ timeAgo(n.timestamp || n.createdAt || '') }}</p>
                  </div>
                </div>
              </template>
            </div>
            <div class="px-4 py-2.5 border-t border-outline-variant/20 text-center">
              <NuxtLink to="/notifikasi" class="text-label-sm text-primary hover:underline" @click="showNotifPopup = false">Lihat Semua</NuxtLink>
            </div>
          </div>
        </Teleport>
      </div>

      <div class="relative">
        <button
          class="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-colors touch-target"
          @click="toggleAppsPopup"
          aria-label="Aplikasi"
          aria-expanded="showAppsPopup"
          aria-controls="apps-popup"
        >
          <span class="material-symbols-outlined text-lg">apps</span>
        </button>
        <Teleport to="body">
          <div
            v-if="showAppsPopup"
            id="apps-popup"
            class="fixed right-4 md:right-0 top-[calc(var(--topbar-height, 4rem) + 8px)] z-[100] w-64 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-slide-up p-3"
            role="menu"
          >
            <div class="grid grid-cols-3 gap-2">
              <NuxtLink
                v-for="app in quickApps"
                :key="app.to"
                :to="app.to"
                class="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors touch-target"
                @click="showAppsPopup = false"
                role="menuitem"
              >
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: app.bg }">
                  <span class="material-symbols-outlined text-lg" :style="{ color: app.color }">{{ app.icon }}</span>
                </div>
                <span class="text-[10px] text-on-surface-variant text-center leading-tight">{{ app.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </Teleport>
      </div>

      <div class="hidden md:flex items-center gap-3 ml-2 pl-stack-md border-l border-outline-variant/30">
        <div class="text-right">
          <p class="text-label-md leading-none text-primary">{{ userName }}</p>
          <p v-if="subtitle" class="text-[10px] text-on-surface-variant">{{ subtitle }}</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-label-md touch-target">
          {{ initials }}
        </div>
      </div>

      <div class="md:hidden flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-label-md touch-target">
          {{ initials }}
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showSystemPopup" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showSystemPopup = false" role="dialog" aria-modal="true" aria-labelledby="system-status-title">
        <div class="bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter max-h-[90vh]">
          <div class="px-gutter py-stack-md bg-primary flex justify-between items-center">
            <div class="text-on-primary">
              <h2 id="system-status-title" class="font-display text-headline-md">System Status</h2>
              <p class="text-[11px] text-on-primary opacity-80 uppercase tracking-widest">Firebase & Vercel</p>
            </div>
            <button class="text-on-primary/60 hover:text-on-primary p-2 touch-target" @click="showSystemPopup = false" aria-label="Tutup">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-gutter space-y-stack-md max-h-[60vh] overflow-y-auto">
            <div class="flex items-center justify-between">
              <span class="text-label-md text-on-surface-variant">Overall Status</span>
              <span class="px-3 py-1 rounded-full text-label-sm font-bold" :class="systemStatus.status === 'healthy' ? 'bg-green-100 text-green-700' : systemStatus.status === 'degraded' ? 'bg-red-100 text-red-700' : 'bg-surface-container-low text-on-surface-variant'">
                {{ systemStatus.status === 'healthy' ? '✅ Healthy' : systemStatus.status === 'degraded' ? '⚠ Degraded' : '...' }}
              </span>
            </div>

            <div class="space-y-3">
              <div v-for="(svc, name) in systemStatus.services" :key="name" class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="svc.status === 'ok' ? 'bg-green-500' : 'bg-red-500'" aria-hidden="true"></span>
                  <span class="text-label-md font-medium capitalize">{{ name }}</span>
                </div>
                <span class="text-label-sm" :class="svc.status === 'ok' ? 'text-green-600' : 'text-red-600'">{{ svc.status === 'ok' ? `✓ ${svc.latency}` : '✗' }}</span>
              </div>
            </div>

            <div class="flex justify-between p-3 bg-surface-container-low rounded-lg">
              <span class="text-label-md text-on-surface-variant">Server Uptime</span>
              <span class="text-label-md font-medium">{{ serverUptime }}</span>
            </div>

            <button class="w-full py-2.5 bg-primary text-on-primary text-label-md rounded-lg hover:brightness-110 active:scale-95 transition-all touch-target" @click="navigateTo('/developer')">Detail ke Developer Page</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  roleLabel: string
  userName: string
  subtitle?: string
}>(), {
  subtitle: '',
})

const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const router = useRouter()
const searchQuery = ref('')
const showSearchModal = ref(false)
const loading = ref(false)
const highlightedIndex = ref(-1)
const results = ref<{ students: any[]; teachers: any[] }>({ students: [], teachers: [] })
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const showSystemPopup = ref(false)
const systemStatus = reactive({
  status: 'checking...',
  timestamp: '',
  services: {} as Record<string, any>,
  uptime: 0,
})
const serverUptime = ref('-')

const showNotifPopup = ref(false)
const notifications = ref<any[]>([])
const loadingNotif = ref(false)

const showAppsPopup = ref(false)

const quickApps = [
  { label: 'Santri', icon: 'group', to: '/kesantrian/students', bg: '#e8f0fe', color: '#1a6bff' },
  { label: 'Absensi', icon: 'calendar_month', to: '/attendance', bg: '#e6f7e6', color: '#2e7d32' },
  { label: 'Akademik', icon: 'school', to: '/akademik/menu', bg: '#fce4ec', color: '#c62828' },
  { label: 'Izin', icon: 'passport', to: '/izin', bg: '#f3e5f5', color: '#6a1b9a' },
  { label: 'Developer', icon: 'code', to: '/developer', bg: '#e8eaf6', color: '#283593' },
]

function toggleSystemPopup() {
  showSystemPopup.value = !showSystemPopup.value
  if (showSystemPopup.value) fetchSystemStatus()
}

function toggleNotifPopup() {
  showNotifPopup.value = !showNotifPopup.value
  if (showNotifPopup.value) fetchNotifications()
}

function toggleAppsPopup() {
  showAppsPopup.value = !showAppsPopup.value
}

function fmtUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function timeAgo(ts: string) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins}m yang lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j yang lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}h yang lalu`
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

async function fetchSystemStatus() {
  try {
    const res: any = await $fetch('/api/health')
    systemStatus.status = res.status
    systemStatus.timestamp = res.timestamp
    systemStatus.uptime = res.uptime || 0
    Object.assign(systemStatus.services, res.services)
    serverUptime.value = fmtUptime(res.uptime || 0)
  } catch {
    systemStatus.status = 'degraded'
    systemStatus.services = { api: { status: 'error', message: 'Unreachable' } }
  }
}

async function fetchNotifications() {
  loadingNotif.value = true
  try {
    const data = await $fetch('/api/notifikasi')
    notifications.value = (data || []).sort((a: any, b: any) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime())
  } catch { notifications.value = [] }
  finally { loadingNotif.value = false }
}

async function doSearch(q: string) {
  if (!q || q.trim().length < 1) {
    results.value = { students: [], teachers: [] }
    return
  }
  loading.value = true
  try {
    const data = await $fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
    results.value = data as any
    highlightedIndex.value = -1
  } catch {
    results.value = { students: [], teachers: [] }
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  showSearchModal.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { doSearch(searchQuery.value) }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  results.value = { students: [], teachers: [] }
  showSearchModal.value = false
}

function getInitials(name: string) {
  return (name || 'A').split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
}

function getTotalResults() {
  return results.value.students.length + results.value.teachers.length
}

function highlightNext() {
  const total = getTotalResults()
  if (total === 0) return
  highlightedIndex.value = highlightedIndex.value < total - 1 ? highlightedIndex.value + 1 : 0
}

function highlightPrev() {
  const total = getTotalResults()
  if (total === 0) return
  highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : total - 1
}

function navigateHighlighted() {
  const idx = highlightedIndex.value
  if (idx < 0) return
  const studentCount = results.value.students.length
  if (idx < studentCount) navigateToStudent(results.value.students[idx])
  else navigateToTeacher(results.value.teachers[idx - studentCount])
}

function navigateToStudent(s: any) {
  showSearchModal.value = false
  clearSearch()
  router.push('/kesantrian/information-vector?q=' + encodeURIComponent(s.name || ''))
}

function navigateToTeacher(t: any) {
  showSearchModal.value = false
  clearSearch()
  router.push('/kesantrian/information-vector?q=' + encodeURIComponent(t.name || ''))
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const searchEl = document.querySelector('[aria-controls="search-results"]')?.parentElement
  if (searchEl && !searchEl.contains(target)) {
    showSearchModal.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  fetchSystemStatus()
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})

const initials = computed(() => {
  const name = props.userName || 'A'
  return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'AD'
})
</script>