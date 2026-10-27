<template>
  <div class="px-gutter max-w-container-max mx-auto" style="padding-top: 6rem; padding-bottom: 3rem;">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <span class="material-symbols-outlined animate-spin text-primary">sync</span>
      <span class="ml-2 text-on-surface-variant">Memuat data...</span>
    </div>
    <div v-else-if="error" class="bg-error-container text-on-error-container p-stack-md rounded-xl mb-stack-lg">{{ error }}</div>
    <template v-else>
    <div class="mb-stack-lg">
      <h2 class="font-display text-headline-lg text-primary">Rekam Medis Santri</h2>
      <p class="text-on-surface-variant text-body-md">UKS / Klinik Pesantren — Riwayat kesehatan dan rekam medis santri.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
      <div v-for="stat in stats" :key="stat.label" class="glass-card p-stack-md rounded-xl shadow-sm text-center">
        <div class="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" :class="stat.bg">
          <span class="material-symbols-outlined" :class="stat.iconColor">{{ stat.icon }}</span>
        </div>
        <p class="font-display text-headline-md" :class="stat.valueColor">{{ stat.value }}</p>
        <p class="text-label-sm text-on-surface-variant">{{ stat.label }}</p>
      </div>
    </div>
    <div class="glass-card rounded-xl shadow-sm overflow-hidden">
      <div class="p-stack-md border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-stack-md">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-on-surface-variant">calendar_today</span>
            <input type="date" v-model="filterDate" class="bg-surface-container-low border-none rounded-lg text-label-md py-1.5 px-3 focus:ring-primary" />
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-on-surface-variant">search</span>
            <input v-model="filterStudent" class="bg-surface-container-low border-none rounded-lg text-label-md py-1.5 px-3 focus:ring-primary" placeholder="Cari santri..." />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-5 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-md shadow-md hover:brightness-110 active:scale-95 transition-all" @click="openSuratModal">
            <span class="material-symbols-outlined text-sm">description</span> Surat Pengantar Berobat
          </button>
          <button class="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md shadow-md hover:brightness-110 active:scale-95 transition-all" @click="showAddModal = true">
            <span class="material-symbols-outlined text-sm">add</span> Tambah Rekam Medis
          </button>
        </div>
      </div>
      <BulkActionBar :selected-count="selectedCount" @clear="clearSelection">
        <template #actions>
          <button class="flex items-center gap-1 px-3 py-1.5 bg-error text-on-error rounded-lg text-label-sm hover:brightness-110 transition-all" @click="bulkDelete">
            <span class="material-symbols-outlined text-sm">delete</span> Hapus
          </button>
        </template>
      </BulkActionBar>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-surface-container-low">
            <tr>
              <th class="px-4 py-4 text-label-md text-on-surface-variant w-10"><input type="checkbox" :checked="allSelected" @change="toggleAll" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" /></th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Santri</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Tanggal</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Keluhan</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Diagnosa</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Obat</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant">Tindakan</th>
              <th class="px-4 py-3 text-label-sm text-on-surface-variant text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-primary-fixed/5 transition-colors">
              <td class="px-4 py-4"><input type="checkbox" :checked="isSelected(record.id)" @change="toggleOne(record.id)" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" /></td>
              <td class="px-4 py-3 text-label-md font-medium">{{ record.name }}</td>
              <td class="px-4 py-3 text-label-sm text-on-surface-variant">{{ record.date }}</td>
              <td class="px-4 py-3 text-label-sm">{{ record.complaint }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-0.5 rounded text-[11px] font-bold', diagnosisBadge(record.diagnosis)]">{{ record.diagnosis }}</span>
              </td>
              <td class="px-4 py-3 text-label-sm">{{ record.medication }}</td>
              <td class="px-4 py-3 text-label-sm">{{ record.action }}</td>
              <td class="px-4 py-3 text-center">
                <button class="text-error hover:text-red-700 transition-colors" @click="deleteItem(record.id)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="99"  class="px-4 py-8 text-center text-on-surface-variant text-label-md">Tidak ada data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[60] flex items-center justify-center p-gutter bg-black/40 backdrop-blur-sm" @click.self="showAddModal = false">
        <div class="bg-surface rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-modal-enter">
          <div class="bg-primary px-gutter py-stack-md flex justify-between items-center">
            <div class="text-on-primary">
              <h2 class="font-display text-headline-md">Tambah Rekam Medis</h2>
              <p class="text-[11px] text-on-primary opacity-80 uppercase tracking-widest">Kesehatan Module</p>
            </div>
            <button class="text-on-primary/60 hover:text-on-primary p-2" @click="showAddModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form class="p-gutter space-y-stack-md" @submit.prevent="saveItem">
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Nama Santri</label>
              <select v-model="form.name" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" required>
                <option value="">-- Pilih Santri --</option>
                <option v-for="s in students" :key="s.id" :value="s.name">{{ s.name }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Tanggal</label>
              <input type="date" v-model="form.date" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" required />
            </div>
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Keluhan</label>
              <textarea v-model="form.complaint" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" placeholder="Keluhan santri" rows="2" required></textarea>
            </div>
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Diagnosa</label>
              <input v-model="form.diagnosis" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" placeholder="Diagnosa" required />
            </div>
            <div class="grid grid-cols-2 gap-stack-md">
              <div class="space-y-1">
                <label class="text-label-md text-on-surface-variant">Obat</label>
                <input v-model="form.medication" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" placeholder="Obat yang diberikan" />
              </div>
              <div class="space-y-1">
                <label class="text-label-md text-on-surface-variant">Tindakan</label>
                <input v-model="form.action" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" placeholder="Tindakan medis" />
              </div>
            </div>
            <div class="flex justify-end gap-stack-sm pt-stack-sm">
              <button class="px-6 py-2.5 text-on-surface-variant text-label-md hover:bg-surface-container-high rounded-lg" type="button" @click="showAddModal = false">Batal</button>
              <button class="px-8 py-2.5 bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all" type="submit">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showSuratModal" class="fixed inset-0 z-[60] flex items-center justify-center p-gutter bg-black/40 backdrop-blur-sm" @click.self="showSuratModal = false">
        <div class="bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter">
          <div class="bg-secondary px-gutter py-stack-md flex justify-between items-center">
            <div class="text-on-secondary">
              <h2 class="font-display text-headline-md">Surat Pengantar Berobat</h2>
              <p class="text-[11px] text-on-secondary opacity-80 uppercase tracking-widest">Format A5 — 2 salinan per A4</p>
            </div>
            <button class="text-on-secondary/60 hover:text-on-secondary p-2" @click="showSuratModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-gutter space-y-stack-md">
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Mode Surat</label>
              <div class="grid grid-cols-2 gap-stack-sm">
                <button type="button" class="px-4 py-3 rounded-lg text-label-md border transition-all" :class="suratMode === 'blank' ? 'bg-secondary text-on-secondary border-secondary shadow-md' : 'bg-surface-container-low border-outline-variant hover:bg-surface-container-high'" @click="suratMode = 'blank'">
                  <span class="material-symbols-outlined block mb-1">edit_note</span>Kosongan (Template)
                </button>
                <button type="button" class="px-4 py-3 rounded-lg text-label-md border transition-all" :class="suratMode === 'filled' ? 'bg-secondary text-on-secondary border-secondary shadow-md' : 'bg-surface-container-low border-outline-variant hover:bg-surface-container-high'" @click="suratMode = 'filled'">
                  <span class="material-symbols-outlined block mb-1">person</span>Isi Nama Santri
                </button>
              </div>
            </div>
            <div v-if="suratMode === 'filled'" class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Pilih Santri</label>
              <select v-model="suratStudentId" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none">
                <option value="">-- Pilih Santri --</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div v-if="suratMode === 'filled'" class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Keluhan (opsional, diisi otomatis dari rekam medis terakhir)</label>
              <textarea v-model="suratKeluhan" rows="2" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" placeholder="Kosongkan jika ingin garis titik-titik"></textarea>
            </div>
            <div class="space-y-1">
              <label class="text-label-md text-on-surface-variant">Tanggal Surat</label>
              <input type="date" v-model="suratTanggal" class="w-full bg-surface-container-low border-none rounded-lg text-body-md focus:ring-primary p-3 outline-none" />
            </div>
            <div class="flex justify-end gap-stack-sm pt-stack-sm">
              <button class="px-6 py-2.5 text-on-surface-variant text-label-md hover:bg-surface-container-high rounded-lg" type="button" @click="showSuratModal = false">Batal</button>
              <button class="flex items-center gap-2 px-8 py-2.5 bg-secondary text-on-secondary text-label-md rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all" type="button" @click="printSurat">
                <span class="material-symbols-outlined text-sm">print</span> Cetak Surat
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  </div>
</template>

<script setup lang="ts">
import { useTableSelection } from '~/composables/useTableSelection'
import { usePrintKop } from '~/composables/usePrintKop'
const { printCss } = usePrintKop()
const { selected, allSelected, toggleAll, toggleOne, isSelected, clearSelection, selectedCount } = useTableSelection(() => filteredRecords)
definePageMeta({ layout: 'super-admin', requiredRole: 'super_admin' })

const loading = ref(true)
const error = ref('')
const filterDate = ref(new Date().toISOString().split('T')[0])
const filterStudent = ref('')
const showAddModal = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  studentId: '',
  date: new Date().toISOString().split('T')[0],
  complaint: '',
  diagnosis: '',
  medication: '',
  action: '',
})

const items = ref<any[]>([])
const students = ref<any[]>([])
const { getIdToken } = useAuth()

async function fetchStudents() {
  try {
    const token = await getIdToken.value?.()
    const res = await $fetch('/api/students', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    students.value = res || []
  } catch (e: any) {
    console.error('Gagal memuat daftar santri', e)
  }
}

async function fetchData() {
  loading.value = true; error.value = ''
  try {
    items.value = await $fetch('/api/kesehatan/medical-records') || []
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7)
  return [
    { label: 'Kunjungan Hari Ini', icon: 'today', bg: 'bg-primary-fixed', iconColor: 'text-primary', valueColor: 'text-primary', value: items.value.filter((r: any) => r.date === today).length },
    { label: 'Kunjungan Bulan Ini', icon: 'date_range', bg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700', value: items.value.filter((r: any) => r.date?.startsWith(month)).length },
    { label: 'Santri Dirawat', icon: 'local_hospital', bg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700', value: items.value.filter((r: any) => r.action?.toLowerCase().includes('rujuk') || r.action?.toLowerCase().includes('rawat')).length },
    { label: 'Total Rekam Medis', icon: 'folder_open', bg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700', value: items.value.length },
  ]
})

const filteredRecords = computed(() => {
  return items.value.filter(r => {
    const matchStudent = !filterStudent.value || (r.name || '').toLowerCase().includes(filterStudent.value.toLowerCase())
    return matchStudent
  })
})

function diagnosisBadge(diagnosis: string) {
  const ringan = ['Flu Biasa', 'Faringitis', 'Luka Lecet']
  const sedang = ['Bronkitis Ringan', 'Gastritis', 'Vertigo', 'Dermatitis']
  if (ringan.includes(diagnosis)) return 'bg-green-100 text-green-700'
  if (sedang.includes(diagnosis)) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function openAddModal() {
  editingId.value = null
  form.name = ''
  form.date = new Date().toISOString().split('T')[0]
  form.complaint = ''
  form.diagnosis = ''
  form.medication = ''
  form.action = ''
  showAddModal.value = true
}

async function saveItem() {
  try {
    if (editingId.value) {
      await $fetch(`/api/kesehatan/medical-records/${editingId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await $fetch('/api/kesehatan/medical-records', { method: 'POST', body: { ...form } })
    }
    showAddModal.value = false; await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menyimpan'
  }
}

async function deleteItem(id: string) {
  if (!confirm('Yakin ingin menghapus?')) return
  try {
    await $fetch(`/api/kesehatan/medical-records/${id}`, { method: 'DELETE' }); await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus'
  }
}

async function bulkDelete() {
  if (!confirm(`Yakin ingin menghapus ${selectedCount} data?`)) return
  try {
    await Promise.all(selected.value.map(id => $fetch(`/api/kesehatan/medical-records/${id}`, { method: 'DELETE' })))
    clearSelection()
    await fetchData()
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus'
  }
}

onMounted(() => { fetchData(); fetchStudents() })

// ===== Surat Pengantar Berobat =====
const showSuratModal = ref(false)
const suratMode = ref<'blank' | 'filled'>('blank')
const suratStudentId = ref('')
const suratKeluhan = ref('')
const suratTanggal = ref(new Date().toISOString().split('T')[0])

function formatTanggalIndo(iso: string) {
  if (!iso) return '...............'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '...............'
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

function openSuratModal() {
  suratMode.value = 'blank'
  suratStudentId.value = ''
  suratKeluhan.value = ''
  suratTanggal.value = new Date().toISOString().split('T')[0]
  showSuratModal.value = true
}

function kopSuratHtml(): string {
  return `<div class="kop-berobat">
    <table style="width:100%;border:none;"><tr>
      <td style="width:60px;text-align:left;border:none;padding:0;">
        <img src="/image/logo.png" style="max-height:52px;" onerror="this.style.display='none'" />
      </td>
      <td style="text-align:left;border:none;padding:0;padding-left:6px;">
        <div style="font-size:14pt;font-weight:bold;font-family:'Book Antiqua','Palatino Linotype',serif;">Pondok Pesantren Al Fatah Panekan</div>
        <div style="font-size:9.5pt;">Desa Turi, Kec. Panekan Kab. Magetan</div>
      </td>
    </tr></table>
    <div style="border-top:3px solid #000;border-bottom:1px solid #000;height:3px;margin-top:4px;"></div>
  </div>`
}

function suratBodyHtml(kosong: boolean): string {
  const santri = kosong ? null : students.value.find(s => s.id === suratStudentId.value)
  const nama = santri ? (santri.name || '...............') : '...............................'
  const tempat = santri?.birthPlace || santri?.tempatLahir || '..............'
  const tglLahir = santri?.birthDate || santri?.tanggalLahir ? formatTanggalIndo(santri.birthDate || santri.tanggalLahir) : '..............'
  const ttl = kosong ? '............................' : `${tempat} / ${tglLahir}`
  const keluhan = (!kosong && suratKeluhan.value.trim())
    ? suratKeluhan.value.trim()
    : '.....................................................................................'
  const tglSurat = formatTanggalIndo(suratTanggal.value)
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const now = suratTanggal.value ? new Date(suratTanggal.value) : new Date()
  const noSrt = kosong
    ? `Nomer&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;/PPKF-Pnk/SP-b/&nbsp;&nbsp;/&nbsp;&nbsp;/20`
    : `Nomer&nbsp;&nbsp;: ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}/PPKF-Pnk/SP-b/${bulanRomawi[now.getMonth()]}/${now.getFullYear()}`

  return `
  <div class="judul">SURAT PENGANTAR BEROBAT</div>
  <div class="nomor">${noSrt}</div>
  <p class="indent">Yang bertandatangan di bawah ini, pengurus Pondok Pesantren Al Fatah Panekan, dengan ini menyatakan bahwa:</p>
  <table class="identitas">
    <tr><td class="dash">-</td><td>Nama</td><td>:</td><td class="isi">${nama}</td></tr>
    <tr><td class="dash">-</td><td>Tempat/Tgl Lahir</td><td>:</td><td class="isi">${ttl}</td></tr>
  </table>
  <p>adalah benar sebagai pelajar/santri di Pondok Pesantren Al Fatah Panekan, saat ini mempunyai keluhan: ${keluhan}</p>
  <p style="margin-bottom:2px;">Selanjutnya mohon untung dapat diberikan pengobatan dan/atau penanganan medis di Puskesmas Panekan.</p>
  <p class="indent">Demikian surat pengantar ini semoga dapat digunakan sebagaimana mestinya, dan atas kerjasamanya kami ucapkan terima kasih.</p>
  <div class="ttd">
    <div style="text-align:left;">
      <div>${kosong ? 'Panekan,&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;- 20' : `Panekan, ${tglSurat}`}</div>
      <div>Pengurus Ponpes Al Fatah Panekan</div>
    </div>
  </div>
  <div class="ttdNama">(&nbsp;${kosong ? '...............................' : (santri?.penanggungJawab || '...............................')}&nbsp;)</div>`
}

function printSurat() {
  if (suratMode.value === 'filled' && !suratStudentId.value) {
    error.value = 'Pilih santri terlebih dahulu'
    return
  }
  const kosong = suratMode.value === 'blank'
  const inner = suratBodyHtml(kosong)
  const win = window.open('', '_blank')
  if (!win) { error.value = 'Pop-up diblokir browser. Izinkan pop-up untuk mencetak.'; return }
  win.document.write(`<!DOCTYPE html><html><head><title>Surat Pengantar Berobat</title>
  <style>
    ${printCss('portrait')}
    @page { size: 210mm 297mm; margin: 8mm; }
    html, body { font-family: Cambria, 'Times New Roman', serif; font-size: 10.5pt; color: #000; margin: 0; padding: 0; }
    .half { height: 139mm; padding: 4mm 8mm 0; box-sizing: border-box; overflow: hidden; page-break-inside: avoid; }
    .half + .half { border-top: 1px dashed #999; margin-top: 2mm; padding-top: 4mm; }
    .kop-berobat { margin-bottom: 8px; }
    .judul { text-align: center; font-weight: bold; font-size: 12pt; text-decoration: underline; margin: 6px 0 0; }
    .nomor { text-align: center; font-size: 10pt; margin-bottom: 8px; }
    p { margin: 5px 0; text-align: justify; line-height: 1.35; }
    p.indent { text-indent: 28px; }
    table.identitas { margin: 6px 0 6px 16px; border-collapse: collapse; }
    table.identitas td { padding: 1px 4px; font-size: 10.5pt; vertical-align: top; }
    table.identitas td.dash { width: 14px; text-align: center; }
    table.identitas td.isi { font-weight: bold; }
    .ttd { margin-top: 18px; font-size: 10.5pt; }
    .ttdNama { margin-top: 52px; font-size: 10.5pt; }
  </style>
  </head><body>
    <div class="half">${kopSuratHtml()}${inner}</div>
    <div class="half">${kopSuratHtml()}${inner}</div>
  </body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 500)
}
</script>
