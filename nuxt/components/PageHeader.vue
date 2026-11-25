<template>
  <header class="space-y-4 md:space-y-6 mb-6 md:mb-gutter">
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="font-display text-responsive-headline-lg text-primary truncate">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="description" class="text-responsive-body-md text-on-surface-variant mt-1.5">
          <slot name="description">{{ description }}</slot>
        </p>
        <div v-if="breadcrumbs.length" class="flex items-center gap-1.5 mt-3 text-[11px] text-on-surface-variant">
          <NuxtLink
            v-for="(crumb, i) in breadcrumbs"
            :key="crumb.to"
            :to="crumb.to"
            class="hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span v-if="i > 0" class="material-symbols-outlined text-[10px]">chevron_right</span>
            <span :class="i === breadcrumbs.length - 1 ? 'font-medium text-on-surface' : ''">
              {{ crumb.label }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="actions || $slots.actions" class="flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
        <slot name="actions">
          <template v-if="actions">
            <button
              v-for="action in actions"
              :key="action.label"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-md font-medium transition-all touch-target',
                action.variant === 'primary' ? 'bg-primary text-on-primary hover:brightness-110 shadow-md' : '',
                action.variant === 'secondary' ? 'bg-secondary-container text-on-secondary-container hover:brightness-110' : '',
                action.variant === 'outline' ? 'bg-surface-container-lowest text-primary border border-primary/30 hover:bg-primary-fixed/20' : '',
                action.variant === 'ghost' ? 'text-on-surface-variant hover:bg-surface-container-high' : '',
                action.variant === 'danger' ? 'bg-error text-on-error hover:brightness-110' : '',
              ]"
              @click="action.handler"
              :disabled="action.disabled"
            >
              <span v-if="action.icon" class="material-symbols-outlined text-sm">{{ action.icon }}</span>
              <span class="hidden xs:inline">{{ action.label }}</span>
            </button>
          </template>
        </slot>
      </div>
    </div>

    <div v-if="stats && stats.length" class="grid grid-responsive-4" role="list">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="glass-card p-4 md:p-gutter rounded-xl shadow-sm"
        role="listitem"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-on-surface-variant text-label-md">{{ stat.label }}</span>
          <span class="material-symbols-outlined" :class="stat.iconColor">{{ stat.icon }}</span>
        </div>
        <p class="font-display text-headline-md" :class="stat.valueColor">{{ stat.value }}</p>
        <div v-if="stat.badge" class="flex items-center gap-1 mt-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="stat.badgeClass">{{ stat.badge }}</span>
          <span class="text-on-surface-variant text-[10px]">{{ stat.subtext }}</span>
        </div>
      </div>
    </div>

    <div v-if="filters && filters.length" class="flex flex-wrap gap-2 md:gap-3" role="search">
      <slot name="filters">
        <template v-for="filter in filters" :key="filter.key">
          <div :class="['flex items-center gap-2', filter.class]">
            <label v-if="filter.label" class="text-label-sm text-on-surface-variant hidden sm:block">{{ filter.label }}</label>
            <component
              :is="filter.type"
              v-model="filter.modelValue"
              :options="filter.options"
              :placeholder="filter.placeholder"
              class="bg-surface-container-low border-none rounded-lg text-label-md py-2 px-3 focus:ring-primary outline-none"
              :class="filter.inputClass"
            />
          </div>
        </template>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Stat {
  label: string
  value: string | number
  icon: string
  iconColor: string
  valueColor: string
  badge?: string
  badgeClass?: string
  subtext?: string
}

interface Action {
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  handler: () => void
  disabled?: boolean
}

interface Filter {
  key: string
  label?: string
  type: 'select' | 'input' | 'date'
  modelValue: any
  options?: { label: string; value: any }[]
  placeholder?: string
  class?: string
  inputClass?: string
}

interface Breadcrumb {
  label: string
  to: string
}

const props = withDefaults(defineProps<{
  title: string
  description?: string
  stats?: Stat[]
  actions?: Action[]
  filters?: Filter[]
  breadcrumbs?: Breadcrumb[]
}>(), {
  title: '',
  description: '',
  stats: () => [],
  actions: () => [],
  filters: () => [],
  breadcrumbs: () => [],
})
</script>