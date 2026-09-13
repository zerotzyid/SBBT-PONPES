import { getDatabase } from 'firebase-admin/database'

// ── Rekap absensi per santri untuk dikirim via WA ──
// Sumber data sama dengan halaman attendance (attendance_monthly &
// attendance_program_pm) dan bot WA (wa-bot.ts) — hanya baca, tidak ubah skema.

const CANON: Record<string, string> = {
  present: 'hadir', absent: 'alpa', alpa: 'alpa', sick: 'sakit', permit: 'izin', izin: 'izin',
  hadir: 'hadir', datang: 'datang', bolos: 'bolos', sakit: 'sakit', pulang: 'pulang',
}

export function canonStatus(s: string): string {
  if (!s) return ''
  const low = String(s).trim().toLowerCase()
  return CANON[low] || low
}

const MONTH_ID = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function monthLabel(monthId: string): string {
  const m = String(monthId || '').match(/(\d{4})-(\d{2})/)
  if (!m) return monthId
  return `${MONTH_ID[parseInt(m[2])] || m[2]} ${m[1]}`
}

export interface AbsensiTotals {
  hadir: number; datang: number; bolos: number; alpa: number
  sakit: number; izin: number; pulang: number; total: number
}

export function emptyTotals(): AbsensiTotals {
  return { hadir: 0, datang: 0, bolos: 0, alpa: 0, sakit: 0, izin: 0, pulang: 0, total: 0 }
}

export function countMarks(marks: Record<string, string>): AbsensiTotals {
  const t = emptyTotals()
  for (const raw of Object.values(marks || {})) {
    const v = canonStatus(raw)
    if (!v) continue
    t.total++
    if (v in t) (t as any)[v]++
  }
  return t
}

function normName(s: string): string {
  return String(s || '').toLowerCase().replace(/[-_']/g, ' ').replace(/\s+/g, ' ').trim()
}

function recordMatches(r: any, student: any): boolean {
  if (String(r.studentId || '') === String(student.id)) return true
  if (student.nis && String(r.nis || '') === String(student.nis)) return true
  const rn = normName(r.name)
  const tn = normName(student.name)
  if (rn && tn && rn === tn) return true
  return false
}

// Ambil semua doc satu bulan dari satu collection (dedup: doc terakhir menang).
export async function loadMonthEntries(collection: 'attendance_monthly' | 'attendance_program_pm', monthId: string): Promise<any[]> {
  const db = getDatabase()
  const snap = await db.ref(collection).once('value')
  if (!snap.exists()) return []
  const byKey = new Map<string, any>()
  for (const [key, entry] of Object.entries(snap.val()) as [string, any][]) {
    if (entry.monthId !== monthId) continue
    byKey.set(`${entry.monthId}__${entry.class || ''}__${key}`, entry)
  }
  return [...byKey.values()]
}

export function findStudentMarks(entries: any[], student: any): Record<string, string> | null {
  for (const e of entries) {
    const recs = e.records || []
    const found = recs.find((r: any) => recordMatches(r, student))
    if (found?.marks) return found.marks
  }
  return null
}

function pct(t: AbsensiTotals): number {
  if (!t.total) return 0
  return Math.round((t.hadir / t.total) * 100)
}

function section(title: string, t: AbsensiTotals): string[] {
  return [
    `*${title}:*`,
    `Hadir ${t.hadir} | Datang ${t.datang} | Bolos ${t.bolos} | Alpa ${t.alpa} | Sakit ${t.sakit} | Izin ${t.izin} | Pulang ${t.pulang}`,
    `Kehadiran: ${pct(t)}%`,
    '',
  ]
}

export function buildAbsensiMessage(student: any, monthId: string, diniyah: AbsensiTotals, pm: AbsensiTotals): string {
  const lines = [
    '*LAPORAN ABSENSI SANTRI*',
    'PP Al Fatah Panekan',
    '',
    `Nama: ${student.name}`,
    `Kelas: ${student.class || '-'}`,
    `Bulan: ${monthLabel(monthId)}`,
    '',
  ]
  if (diniyah.total > 0) lines.push(...section('Diniyah', diniyah))
  if (pm.total > 0) lines.push(...section('Pagi-Malam', pm))
  lines.push('_Pesan otomatis SIM-PPT. Hubungi wali kelas untuk konfirmasi._')
  return lines.join('\n')
}
