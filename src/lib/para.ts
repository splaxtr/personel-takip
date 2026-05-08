const formatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPara(tutar: number | null | undefined): string {
  if (tutar == null || isNaN(tutar)) return '0 ₺';
  return formatter.format(tutar);
}

export function parsePara(metin: string): number {
  const temiz = metin.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const sayi = parseFloat(temiz);
  return isNaN(sayi) ? 0 : sayi;
}
