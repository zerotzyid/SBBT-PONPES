// Cetak data santri (semua / per kelas / per kota / per alamat)
// memakai kop surat terpusat dari usePrintKop.
export type PrintSantriMode = 'semua' | 'kelas' | 'kota' | 'alamat'

export interface PrintSantriOptions {
  students: any[]
  mode: PrintSantriMode
  class?: string
  city?: string
  address?: string
  status?: string
}

export function usePrintSantri() {
  const { kopHtml, ttdHtml, printCss } = usePrintKop()

  function esc(v: any): string {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function filterStudents(opts: PrintSantriOptions) {
    let list = [...(opts.students || [])]
    if (opts.status) list = list.filter(s => (s.status || '') === opts.status)
    if (opts.mode === 'kelas' && opts.class) {
      list = list.filter(s => (s.class || '').toLowerCase() === opts.class!.toLowerCase())
    } else if (opts.mode === 'kota' && opts.city) {
      list = list.filter(s => (s.city || '').toLowerCase() === opts.city!.toLowerCase())
    } else if (opts.mode === 'alamat' && opts.address) {
      const q = opts.address.toLowerCase()
      list = list.filter(s => (s.address || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      const ka = opts.mode === 'kota' ? (a.city || '') : opts.mode === 'alamat' ? (a.address || '') : (a.class || '')
      const kb = opts.mode === 'kota' ? (b.city || '') : opts.mode === 'alamat' ? (b.address || '') : (b.class || '')
      return ka.localeCompare(kb) || (a.name || '').localeCompare(b.name || '')
    })
    return list
  }

  function subtitle(opts: PrintSantriOptions): string {
    if (opts.mode === 'kelas') return `Kelas: ${opts.class || '-'}`
    if (opts.mode === 'kota') return `Kota/Kabupaten: ${opts.city || '-'}`
    if (opts.mode === 'alamat') return `Alamat: ${opts.address || '-'}`
    return 'Semua Data Santri'
  }

  function printSantri(opts: PrintSantriOptions) {
    const list = filterStudents(opts)
    if (!list.length) {
      alert('Tidak ada data santri untuk dicetak.')
      return
    }

    const rows = list.map((s, i) => `<tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${esc(s.nis || '-')}</td>
      <td>${esc(s.name || '-')}</td>
      <td>${esc(s.class || '-')}</td>
      <td>${esc(s.roomName || s.dormitoryName || '-')}</td>
      <td style="text-align:center;">${esc((s.gender || '-').charAt(0))}</td>
      <td>${esc(s.city || '-')}</td>
      <td>${esc(s.address || '-')}</td>
      <td>${esc(s.phone || '-')}</td>
      <td>${esc(s.parentName || '-')}</td>
      <td>${esc(s.parentPhone || '-')}</td>
      <td style="text-align:center;">${esc(s.status || '-')}</td>
    </tr>`).join('')

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
<html><head><title>Data Santri — ${esc(subtitle(opts))}</title>
${printCss('landscape')}
<style>
  table.data th, table.data td { vertical-align: top; }
  table.data tr { page-break-inside: avoid; }
</style>
</head><body>
${kopHtml()}

<h2>DATA SANTRI</h2>
<div class="sub">${esc(subtitle(opts))}</div>

<table class="info">
  <tr><td>Jumlah Santri</td><td>: ${list.length}</td></tr>
  <tr><td>Tanggal Cetak</td><td>: ${esc(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }))}</td></tr>
</table>

<table class="data">
  <thead>
    <tr>
      <th style="width:30px;">No</th>
      <th style="width:70px;">NIS</th>
      <th>Nama Santri</th>
      <th style="width:75px;">Kelas</th>
      <th style="width:80px;">Kamar</th>
      <th style="width:30px;">L/P</th>
      <th style="width:85px;">Kota</th>
      <th>Alamat</th>
      <th style="width:85px;">No. HP</th>
      <th style="width:95px;">Nama Wali</th>
      <th style="width:85px;">HP Wali</th>
      <th style="width:55px;">Status</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

${ttdHtml('Kepala Pondok,')}
</body></html>
`)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
  }

  return { printSantri, filterStudents }
}
