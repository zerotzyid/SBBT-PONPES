<template>
  <div class="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-variant/50">
    <slot name="toolbar" />

    <div class="overflow-x-auto table-responsive" ref="tableWrapper">
      <table class="w-full text-left border-collapse" ref="table">
        <thead class="bg-surface-container-low sticky top-0 z-10">
          <tr>
            <th v-if="showSelection" class="px-4 py-4 text-label-md text-on-surface-variant w-12">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
                class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary touch-target"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-4 text-label-md text-on-surface-variant font-medium',
                col.align ? `text-${col.align}` : '',
                col.width ? `w-${col.width}` : '',
                col.minWidth ? `min-w-[${col.minWidth}]` : '',
                col.sticky ? 'sticky left-0 bg-surface-container-low z-10' : '',
              ]"
            >
              <slot :name="`header-${col.key}`">{{ col.label }}</slot>
            </th>
            <th v-if="actionsSlot" class="px-4 py-4 text-label-md text-on-surface-variant w-24">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-variant/30">
          <tr v-if="loading" class="hover:bg-transparent">
            <td :colspan="colspan" class="px-6 py-12 text-center text-on-surface-variant text-label-md">
              <div class="flex items-center justify-center gap-2">
                <span class="material-symbols-outlined animate-spin">refresh</span>
                <span>{{ loadingText }}</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredItems.length === 0" class="hover:bg-transparent">
            <td :colspan="colspan" class="px-6 py-12 text-center text-on-surface-variant text-label-md">
              {{ emptyText }}
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="item in filteredItems"
              :key="getKey(item)"
              class="hover:bg-primary-fixed/5 transition-colors group"
              :class="{
                'bg-primary-fixed/10': isRowSelected(item),
                'bg-error/5': isRowDeleted(item),
              }"
            >
              <td v-if="showSelection" class="px-4 py-4">
                <input
                  type="checkbox"
                  :checked="isRowSelected(item)"
                  @change="toggleRow(item)"
                  class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary touch-target"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'px-4 py-4',
                  col.align ? `text-${col.align}` : '',
                  col.width ? `w-${col.width}` : '',
                ]"
              >
                <slot :name="`cell-${col.key}`" :item="item" :index="filteredItems.indexOf(item)">
                  {{ getCellValue(item, col.key) }}
                </slot>
              </td>
              <td v-if="actionsSlot" class="px-4 py-4">
                <div class="flex items-center gap-1.5">
                  <slot name="actions" :item="item" :index="filteredItems.indexOf(item)" />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showMobileCards" class="md:hidden space-y-3 p-4" role="list">
      <div
        v-for="item in filteredItems"
        :key="getKey(item)"
        class="card-row"
        role="listitem"
        :class="{ 'ring-2 ring-primary': isRowSelected(item) }"
      >
        <div v-if="showSelection" class="flex items-center justify-between">
          <div class="card-row-field">
            <input
              type="checkbox"
              :checked="isRowSelected(item)"
              @change="toggleRow(item)"
              class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary touch-target"
            />
          </div>
        </div>
        <template v-for="col in columns" :key="col.key">
          <div v-if="col.showInCard !== false" class="card-row-field">
            <span class="card-row-label">{{ col.label }}</span>
            <span class="card-row-value">
              <slot :name="`cell-${col.key}`" :item="item" :index="filteredItems.indexOf(item)">
                {{ getCellValue(item, col.key) }}
              </slot>
            </span>
          </div>
        </template>
        <div v-if="actionsSlot" class="card-row-field pt-2 border-t border-surface-variant/30">
          <div class="flex items-center gap-2 flex-wrap" style="margin-left: 80px;">
            <slot name="actions" :item="item" :index="filteredItems.indexOf(item)" />
          </div>
        </div>
      </div>
    </div>

    <slot name="footer" :items="filteredItems" :selected="selectedRows" />

    <div v-if="showPagination" class="p-4 border-t border-surface-variant/30 flex items-center justify-between gap-4 flex-wrap">
      <div class="text-on-surface-variant text-label-md">
        Menampilkan {{ paginatedItems.length }} dari {{ filteredItems.length }} data
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 bg-surface-container-low text-on-surface rounded-lg text-label-sm hover:bg-surface-container-high transition-colors touch-target"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        <span class="text-label-md text-on-surface">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="px-3 py-1.5 bg-surface-container-low text-on-surface rounded-lg text-label-sm hover:bg-surface-container-high transition-colors touch-target"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  minWidth?: string
  sticky?: boolean
  showInCard?: boolean
  render?: (item: any, index: number) => any
}

interface Props {
  items: any[]
  columns: Column[]
  filter?: (items: any[], query: string) => any[]
  searchQuery?: string
  getKey?: (item: any) => string | number
  showSelection?: boolean
  loading?: boolean
  loadingText?: string
  emptyText?: string
  pagination?: boolean
  pageSize?: number
  modelValue?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  filter: (items) => items,
  searchQuery: '',
  getKey: (item) => item.id,
  showSelection: false,
  loading: false,
  loadingText: 'Memuat data...',
  emptyText: 'Tidak ada data',
  pagination: false,
  pageSize: 10,
  modelValue: () => [],
})

const emit = defineEmits<{
  'selection-change': [any[]]
  'row-click': [any, number]
  'page-change': [number]
  'update:modelValue': [any[]]
}>()

const selectedRows = ref<any[]>([])
const currentPage = ref(1)
const showMobileCards = ref(false)
const tableWrapper = ref<HTMLElement | null>(null)
const table = ref<HTMLTableElement | null>(null)

watch(() => props.modelValue, (val) => {
  if (val) selectedRows.value = val
}, { deep: true })

const filteredItems = computed(() => {
  let result = props.items
  if (props.searchQuery) {
    result = props.filter!(result, props.searchQuery)
  }
  return result
})

const paginatedItems = computed(() => {
  if (!props.pagination) return filteredItems.value
  const start = (currentPage.value - 1) * props.pageSize!
  return filteredItems.value.slice(start, start + props.pageSize!)
})

const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil(filteredItems.value.length / props.pageSize!)
})

const allSelected = computed(() => {
  const items = props.pagination ? paginatedItems.value : filteredItems.value
  return items.length > 0 && selectedRows.value.length === items.length
})

const colspan = computed(() => {
  return props.columns.length + (props.showSelection ? 1 : 0) + (slots.actions ? 1 : 0)
})

const slots = useSlots()
const actionsSlot = computed(() => !!slots.actions)

function getKey(item: any) {
  return props.getKey!(item)
}

function getCellValue(item: any, key: string) {
  const col = props.columns.find(c => c.key === key)
  if (col?.render) return col.render(item, filteredItems.value.indexOf(item))
  return item[key] ?? '-'
}

function isRowSelected(item: any) {
  return selectedRows.value.some(s => props.getKey!(s) === props.getKey!(item))
}

function isRowDeleted(item: any) {
  return item._deleted === true
}

function toggleAll() {
  const items = props.pagination ? paginatedItems.value : filteredItems.value
  if (allSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      s => !items.some(i => props.getKey!(i) === props.getKey!(s))
    )
  } else {
    selectedRows.value = [
      ...selectedRows.value,
      ...items.filter(i => !selectedRows.value.some(s => props.getKey!(s) === props.getKey!(i)))
    ]
  }
  emit('selection-change', selectedRows.value)
  emit('update:modelValue', selectedRows.value)
}

function toggleRow(item: any) {
  const key = props.getKey!(item)
  const idx = selectedRows.value.findIndex(s => props.getKey!(s) === key)
  if (idx === -1) {
    selectedRows.value.push(item)
  } else {
    selectedRows.value.splice(idx, 1)
  }
  emit('selection-change', selectedRows.value)
  emit('update:modelValue', selectedRows.value)
}

function selectRow(item: any, index: number) {
  emit('row-click', item, index)
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    emit('page-change', currentPage.value)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    emit('page-change', currentPage.value)
  }
}

function checkTableOverflow() {
  if (!tableWrapper.value || !table.value) return
  const hasOverflow = table.value.scrollWidth > tableWrapper.value.clientWidth
  showMobileCards.value = hasOverflow && window.innerWidth < 768
}

onMounted(() => {
  checkTableOverflow()
  window.addEventListener('resize', checkTableOverflow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkTableOverflow)
})

watch(() => props.items, checkTableOverflow, { deep: true })
watch(() => filteredItems.value.length, checkTableOverflow)
</script>