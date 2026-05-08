import { db } from '../client';
import type { Musteri } from '../../types';

export const musteriDao = {
  liste(): Musteri[] {
    return db().getAllSync<Musteri>('SELECT * FROM musteriler ORDER BY ad ASC;');
  },

  bul(id: number): Musteri | null {
    return db().getFirstSync<Musteri>('SELECT * FROM musteriler WHERE id = ?;', [id]) ?? null;
  },

  ekle(m: { ad: string; telefon?: string | null; adres?: string | null; notlar?: string | null }): number {
    const r = db().runSync(
      `INSERT INTO musteriler (ad, telefon, adres, notlar) VALUES (?, ?, ?, ?);`,
      [m.ad, m.telefon ?? null, m.adres ?? null, m.notlar ?? null]
    );
    return r.lastInsertRowId;
  },

  guncelle(id: number, m: { ad: string; telefon?: string | null; adres?: string | null; notlar?: string | null }) {
    db().runSync(
      `UPDATE musteriler SET ad = ?, telefon = ?, adres = ?, notlar = ? WHERE id = ?;`,
      [m.ad, m.telefon ?? null, m.adres ?? null, m.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM musteriler WHERE id = ?;', [id]);
  },

  bakiyeOzeti(id: number): { toplam: number; tahsil: number; kalan: number } {
    const r = db().getFirstSync<{ toplam: number | null; tahsil: number | null; kalan: number | null }>(
      `SELECT
        SUM(anlasilan_tutar) AS toplam,
        SUM(tahsil_edilen) AS tahsil,
        SUM(kalan) AS kalan
       FROM v_is_bakiye WHERE musteri_id = ?;`,
      [id]
    );
    return {
      toplam: r?.toplam ?? 0,
      tahsil: r?.tahsil ?? 0,
      kalan: r?.kalan ?? 0,
    };
  },
};
