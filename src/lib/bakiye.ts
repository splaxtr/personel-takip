// Bakiye gösterim mantığı tek yerde:
// - Personel: kalan > 0 → bize borç (ödenecek). kalan < 0 → avans verilmiş, personel bize borçlu.
// - Müşteri/İş: kalan > 0 → bize alacak (tahsil edilecek). kalan < 0 → fazla tahsilat, müşteriye borçluyuz.

export type BakiyeRenk = 'borc' | 'alacak' | 'notr';

export type BakiyeDurum = {
  etiket: string;     // listelerde kısa: "Borç" | "Avans" | "Alacak" | "Borçluyuz" | "Sıfır"
  uzunBaslik: string; // detay BakiyeKart için: "KALAN BORÇ" | "VERİLEN AVANS" | ...
  tutar: number;      // her zaman pozitif (mutlak değer)
  renk: BakiyeRenk;
  ham: number;        // orijinal işaretli değer
};

const EPS = 0.005;

export function personelBakiye(kalan: number): BakiyeDurum {
  if (kalan > EPS) {
    return { etiket: 'Borç', uzunBaslik: 'Kalan Borç', tutar: kalan, renk: 'borc', ham: kalan };
  }
  if (kalan < -EPS) {
    return { etiket: 'Avans', uzunBaslik: 'Verilen Avans', tutar: -kalan, renk: 'alacak', ham: kalan };
  }
  return { etiket: 'Sıfır', uzunBaslik: 'Bakiye Sıfır', tutar: 0, renk: 'notr', ham: 0 };
}

export function musteriBakiye(kalan: number): BakiyeDurum {
  if (kalan > EPS) {
    return { etiket: 'Alacak', uzunBaslik: 'Kalan Alacak', tutar: kalan, renk: 'alacak', ham: kalan };
  }
  if (kalan < -EPS) {
    return { etiket: 'Borçluyuz', uzunBaslik: 'Müşteriye Borç', tutar: -kalan, renk: 'borc', ham: kalan };
  }
  return { etiket: 'Sıfır', uzunBaslik: 'Bakiye Sıfır', tutar: 0, renk: 'notr', ham: 0 };
}
