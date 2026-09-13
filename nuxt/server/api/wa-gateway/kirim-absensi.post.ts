import { getDatabase } from 'firebase-admin/database'
import { sendWaBulk } from '~/server/utils/wa-gateway'
import { buildAbsensiMessage, countMarks, findStudentMarks, loadMonthEntries, monthLabel } from '~/server/utils/wa-absensi'

// POST /api/wa-gateway/kirim-absensi
// Body: { month: 'YYYY-MM', scope: 'kelas' | 'semua', class?: string, source?: 'diniyah' | 'pm' | 'semua', delayMs?: number }
// Mengirim rekap absensi per santri ke WA wali (students.parentPhone) via provider aktif.
// Auth: session cookie / Bearer (middleware) — role super_admin | kesantrian.
export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.uid) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (!['super_admin', 'kesantrian'].includes(auth.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Hanya super_admin / kesantrian' })
  }

  const body = await readBody(event)
  const month: string = body.month
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    throw createError({ statusCode: 400, statusMessage: 'month wajib format YYYY-MM' })
  }
  const scope: string = body.scope === 'semua' ? 'semua' : 'kelas'
  const source: string = ['diniyah', 'pm', 'semua'].includes(body.source) ? body.source : 'semua'
  if (scope === 'kelas' && !body.class) {
    throw createError({ statusCode: 400, statusMessage: 'class wajib diisi untuk scope kelas' })
  }

  const db = getDatabase()
  const snap = await db.ref('students').once('value')
  const all = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...(v as object) })) as any[]

  const targets = all.filter((s) => {
    if (s.status && s.status !== 'Active') return false
    if (!s.parentPhone) return false
    if (scope === 'kelas' && s.class !== body.class) return false
    return true
  })

  const diniyahEntries = source !== 'pm' ? await loadMonthEntries('attendance_monthly', month) : []
  const pmEntries = source !== 'diniyah' ? await loadMonthEntries('attendance_program_pm', month) : []

  const recipients: { phone: string; message: string }[] = []
  const tanpaData: string[] = []
  const tanpaWa: number = all.filter((s) => {
    if (s.status && s.status !== 'Active') return false
    if (scope === 'kelas' && s.class !== body.class) return false
    return !s.parentPhone
  }).length

  for (const s of targets) {
    const dm = source !== 'pm' ? findStudentMarks(diniyahEntries, s) : null
    const pm = source !== 'diniyah' ? findStudentMarks(pmEntries, s) : null
    const dt = dm ? countMarks(dm) : { hadir: 0, datang: 0, bolos: 0, alpa: 0, sakit: 0, izin: 0, pulang: 0, total: 0 }
    const pt = pm ? countMarks(pm) : { hadir: 0, datang: 0, bolos: 0, alpa: 0, sakit: 0, izin: 0, pulang: 0, total: 0 }
    if (dt.total === 0 && pt.total === 0) {
      tanpaData.push(s.name)
      continue
    }
    recipients.push({ phone: s.parentPhone, message: buildAbsensiMessage(s, month, dt, pt) })
  }

  if (recipients.length === 0) {
    return {
      success: 0, failed: 0, errors: [],
      month, label: monthLabel(month),
      dilewati_tanpa_data: tanpaData,
      dilewati_tanpa_wa: tanpaWa,
      info: 'Tidak ada penerima — pastikan absensi bulan ini sudah disimpan dan santri punya No. HP Orang Tua.',
    }
  }

  const result = await sendWaBulk(recipients, { uid: auth.uid, name: auth.name || auth.email }, { delayMs: body.delayMs || 2000 })
  return { ...result, month, label: monthLabel(month), dilewati_tanpa_data: tanpaData, dilewati_tanpa_wa: tanpaWa }
})
