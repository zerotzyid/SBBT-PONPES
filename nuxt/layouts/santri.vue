<template>
  <div class="min-h-screen bg-background flex" :style="{ minHeight: '100vh', minHeight: '100dvh' }">
    <Sidebar
      :menu-items="roleCfg.menu"
      :role-label="roleCfg.label"
      :variant="roleCfg.variant"
      :mobile-open="sidebarOpen"
      @close="sidebarOpen = false"
    />
    <main class="flex-1 md:ml-64 min-h-screen" :style="{ minHeight: '100vh', minHeight: '100dvh' }">
      <TopBar
        :role-label="roleCfg.label"
        :user-name="userName"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
      <div
        class="pt-16 md:pt-24 pb-12 px-4 md:px-gutter max-w-container-max mx-auto w-full"
        :style="{ paddingTop: 'var(--topbar-height, 4rem)' }"
      >
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const sidebarOpen = ref(false)
const { user, role } = useAuth()

const roleCfg = computed(() => useRoleMenu(role.value || 'wali_santri'))

const userName = computed(() => {
  if (user.value?.displayName) return user.value.displayName
  if (user.value?.email) return user.value.email.split('@')[0]
  return roleCfg.value.label
})
</script>