import { db } from '../client';
import type { MusteriTahsilati } from '../../types';

export const musteriTahsilatiDao = {
  isinTahsilatlari(is_id: number): MusteriTahsilati[] {
    return db().getAllSync<MusteriTahsilati>(
      `SELECT * FROM musteri_tahsilatlari WHERE is_id = ? ORDER BY tarih DESC, id DESC;`,
      [is_id]
    );
  },

  bul(id: number): MusteriTahsilati | null {
    return db().getFirstSync<MusteriTahsilati>('SELECT * FROM musteri_tahsilatlari WHERE id = ?;', [id]) ?? null;
  },

  ekle(t: { is_id: number; tutar: number; tarih: string; notlar?: string | null }): number {
    const r = db().runSync(
      `INSERT INTO musteri_tahsilatlari (is_id, tutar, tarih, notlar) VALUES (?, ?, ?, ?);`,
      [t.is_id, t.tutar, t.tarih, t.notlar ?? null]
    );
    return r.lastInsertRowId;
  },

  guncelle(id: number, t: { tutar: number; tarih: string; notlar?: string | null }) {
    db().runSync(
      `UPDATE musteri_tahsilatlari SET tutar = ?, tarih = ?, notlar = ? WHERE id = ?;`,
      [t.tutar, t.tarih, t.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM musteri_tahsilatlari WHERE id = ?;', [id]);
  },

  buAyToplam(bas: string, son: string): number {
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(tutar) AS toplam FROM musteri_tahsilatlari WHERE tarih BETWEEN ? AND ?;`,
      [bas, son]
    );
    return r?.toplam ?? 0;
  },
};
