import { db } from '../client';
import type { PersonelOdemesi } from '../../types';

export const personelOdemesiDao = {
  personelinOdemeleri(personel_id: number): PersonelOdemesi[] {
    return db().getAllSync<PersonelOdemesi>(
      `SELECT * FROM personel_odemeleri WHERE personel_id = ? ORDER BY tarih DESC, id DESC;`,
      [personel_id]
    );
  },

  bul(id: number): PersonelOdemesi | null {
    return db().getFirstSync<PersonelOdemesi>('SELECT * FROM personel_odemeleri WHERE id = ?;', [id]) ?? null;
  },

  ekle(o: { personel_id: number; tutar: number; tarih: string; notlar?: string | null }): number {
    const r = db().runSync(
      `INSERT INTO personel_odemeleri (personel_id, tutar, tarih, notlar) VALUES (?, ?, ?, ?);`,
      [o.personel_id, o.tutar, o.tarih, o.notlar ?? null]
    );
    return r.lastInsertRowId;
  },

  guncelle(id: number, o: { tutar: number; tarih: string; notlar?: string | null }) {
    db().runSync(
      `UPDATE personel_odemeleri SET tutar = ?, tarih = ?, notlar = ? WHERE id = ?;`,
      [o.tutar, o.tarih, o.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM personel_odemeleri WHERE id = ?;', [id]);
  },

  buAyToplam(bas: string, son: string): number {
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(tutar) AS toplam FROM personel_odemeleri WHERE tarih BETWEEN ? AND ?;`,
      [bas, son]
    );
    return r?.toplam ?? 0;
  },
};
