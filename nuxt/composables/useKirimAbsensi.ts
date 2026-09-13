import type { Ref } from 'vue'

// Composable bersama untuk kirim rekap absensi ke WA wali santri
// via POST /api/wa-gateway/kirim-absensi. Dipakai halaman
// attendance/index.vue (bulanan) & attendance/pagi-malam.vue.
export function useKirimAbsensi(opts: { error: Ref<string>; success: Ref<string> }) {
  const { getIdToken } = useAuth()
  const kirimLoading = ref(false)

  async function kirimAbsensi(payload: { month: string; scope: 'kelas' | 'semua'; class?: string; source?: string }) {
    kirimLoading.value = true
    opts.error.value = ''
    opts.success.value = ''
    try {
      const token = await getIdToken()
      const res = await fetch('/api/wa-gateway/kirim-absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source: 'semua', ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || data.statusMessage || `HTTP ${res.status}`)
      const skip = [
        data.dilewati_tanpa_wa ? `${data.dilewati_tanpa_wa} santri tanpa No. HP wali` : '',
        data.dilewati_tanpa_data?.length ? `${data.dilewati_tanpa_data.length} santri tanpa data absensi` : '',
      ].filter(Boolean).join(', ')
      opts.success.value = `Terkirim ${data.success} WA wali (${data.label || data.month}), gagal ${data.failed || 0}${skip ? ` — ${skip}` : ''}`
    } catch (e: any) {
      opts.error.value = e.message || 'Gagal mengirim WA'
    } finally {
      kirimLoading.value = false
    }
    setTimeout(() => { opts.success.value = '' }, 8000)
  }

  return { kirimLoading, kirimAbsensi }
}
