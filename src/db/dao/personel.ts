import { db } from '../client';
import type { Personel, PersonelBakiye } from '../../types';

export const personelDao = {
  liste(): Personel[] {
    return db().getAllSync<Personel>(
      'SELECT * FROM personeller ORDER BY aktif DESC, ad ASC;'
    );
  },

  bakiyeListe(): PersonelBakiye[] {
    return db().getAllSync<PersonelBakiye>(
      `SELECT b.* FROM v_personel_bakiye b
       JOIN personeller p ON p.id = b.id
       ORDER BY p.aktif DESC, b.ad ASC;`
    );
  },

  bul(id: number): Personel | null {
    return db().getFirstSync<Personel>('SELECT * FROM personeller WHERE id = ?;', [id]) ?? null;
  },

  bakiye(id: number): PersonelBakiye | null {
    return (
      db().getFirstSync<PersonelBakiye>(
        'SELECT * FROM v_personel_bakiye WHERE id = ?;',
        [id]
      ) ?? null
    );
  },

  ekle(p: { ad: string; telefon?: string | null; gunluk_ucret: number; notlar?: string | null }): number {
    const r = db().runSync(
      `INSERT INTO personeller (ad, telefon, gunluk_ucret, notlar) VALUES (?, ?, ?, ?);`,
      [p.ad, p.telefon ?? null, p.gunluk_ucret, p.notlar ?? null]
    );
    return r.lastInsertRowId;
  },

  guncelle(id: number, p: { ad: string; telefon?: string | null; gunluk_ucret: number; aktif: number; notlar?: string | null }) {
    db().runSync(
      `UPDATE personeller SET ad = ?, telefon = ?, gunluk_ucret = ?, aktif = ?, notlar = ? WHERE id = ?;`,
      [p.ad, p.telefon ?? null, p.gunluk_ucret, p.aktif, p.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM personeller WHERE id = ?;', [id]);
  },

  toplamBorc(): number {
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(kalan) AS toplam FROM v_personel_bakiye WHERE kalan > 0;`
    );
    return r?.toplam ?? 0;
  },

  toplamAvans(): number {
    // kalan < 0 → fazla ödeme yapılmış, personel bize borçlu
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(-kalan) AS toplam FROM v_personel_bakiye WHERE kalan < 0;`
    );
    return r?.toplam ?? 0;
  },
};
