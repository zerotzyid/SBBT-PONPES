// Kop surat terpusat untuk semua template cetak.
// Ganti nama/alamat/logo cukup di sini — halaman cetak cukup panggil
// kopHtml() + printCss() di dalam string template window.open mereka.
export function usePrintKop() {
  const KOP_NAMA_1 = 'YAYASAN PONDOK PESANTREN'
  const KOP_NAMA_2 = 'AL FATAH PANEKAN'
  const KOP_ALAMAT = 'Turi, Panekan, Kabupaten Magetan, Jawa Timur 63352'
  const KOP_LOGO = '/image/logo.png'

  function kopHtml(): string {
    return `<div class="kop">
  <table style="width:100%;"><tr>
    <td style="width:70px;text-align:center;">
      <img src="${KOP_LOGO}" class="logo" style="max-height:55px;" onerror="this.style.display='none'" />
    </td>
    <td style="text-align:center;">
      <div class="kop-title">${KOP_NAMA_1}<br>${KOP_NAMA_2}</div>
      <div class="kop-alamat">${KOP_ALAMAT}</div>
    </td>
  </tr></table>
</div>`
  }

  function ttdHtml(...jabatan: string[]): string {
    const list = jabatan.length ? jabatan : ['Kepala Pondok,']
    const cells = list.map(j => `<div><div class="jabatan">${j}</div><div class="nama">_____________________</div></div>`).join('')
    return `<div class="ttd">${cells}</div>`
  }

  function printCss(orientation: 'landscape' | 'portrait' = 'landscape'): string {
    return `<style>
  @page { size: ${orientation}; margin: 12mm 15mm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; margin: 0; padding: 15px; }
  .kop { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 16px; }
  .kop .logo { max-height: 55px; vertical-align: middle; margin-right: 8px; }
  .kop .kop-title { font-size: 15pt; font-weight: bold; }
  .kop .kop-alamat { font-size: 9pt; }
  h2 { text-align: center; font-size: 13pt; margin: 14px 0 4px; text-decoration: underline; }
  .sub { text-align:center; font-size:10pt; margin-bottom:10px; }
  .info { margin-bottom: 10px; }
  .info td { padding: 2px 6px; font-size: 10pt; }
  table.data { width: 100%; border-collapse: collapse; margin: 10px 0; }
  table.data th { background: #f0f0f0; padding: 6px; border: 1px solid #333; font-size: 10pt; }
  table.data td { padding: 4px 6px; border: 1px solid #333; font-size: 10pt; }
  .ttd { margin-top: 30px; display: flex; justify-content: space-around; }
  .ttd div { text-align: center; width: 180px; }
  .ttd .jabatan { font-size: 10pt; margin-bottom: 50px; }
  .ttd .nama { font-size: 11pt; font-weight: bold; text-decoration: underline; }
</style>`
  }

  return { kopHtml, ttdHtml, printCss }
}
