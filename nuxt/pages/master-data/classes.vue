<template>
  <div>
    <PageHeader
      title="Manajemen Kelas & Tingkatan"
      description="Kelola data kelas dan tingkatan untuk santri."
      :stats="stats"
      :actions="[
        { label: 'Tambah Kelas', icon: 'add', variant: 'primary', handler: openAddModal },
      ]"
    />

    <ResponsiveTable
      :items="items"
      :columns="columns"
      :show-selection="true"
      v-model:selectedRows="selectedRows"
      @selection-change="selectedRows = $event"
      @row-click="openEditModal"
    >
      <template #cell-name="{ item }">
        <span class="text-label-md text-on-surface font-medium">{{ item.name }}</span>
      </template>
      <template #cell-level="{ item }">
        <span class="text-label-sm text-on-surface-variant">{{ item.level }}</span>
      </template>
      <template #cell-group="{ item }">
        <span class="bg-surface-container-low px-2 py-1 rounded text-label-sm text-on-surface-variant">{{ item.group }}</span>
      </template>
      <template #cell-status="{ item }">
        <span :class="['px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider', item.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant']">
          {{ item.active ? 'Aktif' : 'Nonaktif' }}
        </span>
      </template>
      <template #actions="{ item }">
        <button class="p-1.5 rounded-lg hover:bg-primary-fixed/20 text-primary transition-colors touch-target" title="Edit" @click.stop="openEditModal(item)">
          <span class="material-symbols-outlined text-sm">edit</span>
        </button>
        <button class="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors touch-target" title="Hapus" @click.stop="confirmDelete(item)">
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </template>
    </ResponsiveTable>

    <ResponsiveModal
      v-model="showModal"
      :title="isEditing ? 'Edit Kelas' : 'Tambah Kelas'"
      :max-width="'md'"
      @submit="saveItem"
    >
      <form novalidate class="space-y-4" @submit.prevent="saveItem">
        <div>
          <label class="text-label-sm text-on-surface-variant block mb-1">Nama Kelas</label>
          <input v-model="form.name" type="text" class="w-full bg-surface-container-low border-none rounded-lg text-label-md py-2.5 px-3 focus:ring-primary" placeholder="Contoh: 8A" required />
        </div>
        <div>
          <label class="text-label-sm text-on-surface-variant block mb-1">Tingkat</label>
          <select v-model="form.level" class="w-full bg-surface-container-low border-none rounded-lg text-label-md py-2.5 px-3 focus:ring-primary" required>
            <option value="">Pilih Tingkat</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>
        <div>
          <label class="text-label-sm text-on-surface-variant block mb-1">Group</label>
          <select v-model="form.group" class="w-full bg-surface-container-low border-none rounded-lg text-label-md py-2.5 px-3 focus:ring-primary" required>
            <option value="">Pilih Group</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-label-sm text-on-surface-variant">Status Aktif</label>
          <button @click="form.active = !form.active" :class="['w-10 h-5 rounded-full transition-colors relative touch-target', form.active ? 'bg-primary' : 'bg-surface-container-highest']">
            <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.active ? 'translate-x-5' : 'translate-x-0.5']"></span>
          </button>
        </div>
      </form>

      <template #footer>
        <button class="px-4 py-2.5 text-on-surface-variant text-label-md hover:bg-surface-container-high rounded-lg touch-target" @click="closeModal">Batal</button>
        <button class="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 transition-all shadow-sm touch-target" @click="saveItem">Simpan</button>
      </template>
    </ResponsiveModal>

    <ResponsiveModal
      v-model="showDeleteModal"
      title="Hapus Kelas"
      :max-width="'sm'"
      :hide-footer="true"
    >
      <div class="p-6 text-center">
        <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-red-500 text-3xl">warning</span>
        </div>
        <h3 class="font-display text-title-lg text-on-surface mb-2">Hapus Kelas</h3>
        <p class="text-on-surface-variant text-label-md mb-1">Apakah Anda yakin ingin menghapus kelas berikut?</p>
        <p class="font-bold text-on-surface text-body-md">{{ deleteTarget?.name }}</p>
      </div>
      <template #footer>
        <button class="w-full md:w-auto px-4 py-2 bg-surface-container-low text-on-surface rounded-lg text-label-md hover:bg-surface-container-higher transition-all touch-target" @click="showDeleteModal = false">Batal</button>
        <button class="w-full md:w-auto px-4 py-2 bg-error text-on-error rounded-lg text-label-md hover:brightness-110 transition-all shadow-sm touch-target" @click="doDelete">Hapus</button>
      </template>
    </ResponsiveModal>
  </div>
</template>

<script setup lang="ts">
import { useTableSelection } from '~/composables/useTableSelection'
import PageHeader from '~/components/PageHeader.vue'
import ResponsiveTable from '~/components/ResponsiveTable.vue'
import ResponsiveModal from '~/components/ResponsiveModal.vue'

const { selected: selectedRows, selectedCount } = useTableSelection(() => items)
definePageMeta({ layout: 'super-admin', requiredRole: 'super_admin' })

interface ClassItem {
  id: string
  name: string
  level: string
  group: string
  active: boolean
}

const loading = ref(true)
const error = ref('')
const items = ref<ClassItem[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const deleteTarget = ref<ClassItem | null>(null)

const columns = [
  { key: 'name', label: 'Nama Kelas', minWidth: '120px' },
  { key: 'level', label: 'Tingkat', align: 'center' as const, minWidth: '80px' },
  { key: 'group', label: 'Group', align: 'center' as const, minWidth: '80px' },
  { key: 'status', label: 'Status', align: 'center' as const, minWidth: '100px', render: (item: ClassItem) => item.active ? 'Aktif' : 'Nonaktif' },
]

const stats = computed(() => {
  const total = items.value.length
  const levels = new Set(items.value.map(i => i.level)).size
  return [
    { label: 'Total Kelas', icon: 'meeting_room', iconColor: 'text-primary', valueColor: 'text-primary', value: String(total) },
    { label: 'Total Santri', icon: 'groups', iconColor: 'text-secondary', valueColor: 'text-secondary', value: '-' },
    { label: 'Tingkatan', icon: 'layers', iconColor: 'text-tertiary', valueColor: 'text-on-background', value: String(levels) },
  ]
})

const defaultForm = () => ({
  name: '',
  level: '',
  group: '',
  active: true,
})

const form = reactive(defaultForm())

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch('/api/master-data/classes')
    items.value = data || []
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

async function saveItem() {
  if (!form.name || !form.level || !form.group) return
  try {
    const { id, ...payload } = form as any
    if (isEditing.value) {
      await $fetch(`/api/master-data/classes/${id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/master-data/classes', { method: 'POST', body: payload })
    }
    showModal.value = false
    await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menyimpan'
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/master-data/classes/${deleteTarget.value.id}`, { method: 'DELETE' })
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus'
  }
}

function openAddModal() {
  isEditing.value = false
  Object.assign(form, defaultForm())
  showModal.value = true
}

function openEditModal(item: ClassItem) {
  isEditing.value = true
  Object.assign(form, { ...item })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function confirmDelete(item: ClassItem) {
  deleteTarget.value = item
  showDeleteModal.value = true
}

async function bulkDelete() {
  if (!selectedRows.value.length) return
  if (!confirm(`Yakin ingin menghapus ${selectedRows.value.length} data?`)) return
  try {
    await Promise.all(selectedRows.value.map(id => $fetch(`/api/master-data/classes/${id}`, { method: 'DELETE' })))
    selectedRows.value = []
    await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus'
  }
}

onMounted(() => {
  fetchData()
})
</script>