import { db } from '../client';
import type { CalismaGunu } from '../../types';

export type CalismaGunuDetay = CalismaGunu & {
  personel_ad: string;
  is_baslik: string | null;
  musteri_ad: string | null;
};

export const calismaGunuDao = {
  personelinGunleri(personel_id: number): CalismaGunuDetay[] {
    return db().getAllSync<CalismaGunuDetay>(
      `SELECT g.*, p.ad AS personel_ad, i.baslik AS is_baslik, m.ad AS musteri_ad
       FROM calisma_gunleri g
       JOIN personeller p ON p.id = g.personel_id
       LEFT JOIN isler i ON i.id = g.is_id
       LEFT JOIN musteriler m ON m.id = i.musteri_id
       WHERE g.personel_id = ?
       ORDER BY g.tarih DESC, g.id DESC;`,
      [personel_id]
    );
  },

  isinGunleri(is_id: number): CalismaGunuDetay[] {
    return db().getAllSync<CalismaGunuDetay>(
      `SELECT g.*, p.ad AS personel_ad, i.baslik AS is_baslik, m.ad AS musteri_ad
       FROM calisma_gunleri g
       JOIN personeller p ON p.id = g.personel_id
       LEFT JOIN isler i ON i.id = g.is_id
       LEFT JOIN musteriler m ON m.id = i.musteri_id
       WHERE g.is_id = ?
       ORDER BY g.tarih DESC, g.id DESC;`,
      [is_id]
    );
  },

  bul(id: number): CalismaGunu | null {
    return db().getFirstSync<CalismaGunu>('SELECT * FROM calisma_gunleri WHERE id = ?;', [id]) ?? null;
  },

  ekle(g: {
    personel_id: number;
    is_id: number | null;
    tarih: string;
    gunluk_ucret: number;
    notlar?: string | null;
  }): number {
    const r = db().runSync(
      `INSERT INTO calisma_gunleri (personel_id, is_id, tarih, gunluk_ucret, notlar)
       VALUES (?, ?, ?, ?, ?);`,
      [g.personel_id, g.is_id, g.tarih, g.gunluk_ucret, g.notlar ?? null]
    );
    return r.lastInsertRowId;
  },

  guncelle(
    id: number,
    g: {
      personel_id: number;
      is_id: number | null;
      tarih: string;
      gunluk_ucret: number;
      notlar?: string | null;
    }
  ) {
    db().runSync(
      `UPDATE calisma_gunleri
       SET personel_id = ?, is_id = ?, tarih = ?, gunluk_ucret = ?, notlar = ?
       WHERE id = ?;`,
      [g.personel_id, g.is_id, g.tarih, g.gunluk_ucret, g.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM calisma_gunleri WHERE id = ?;', [id]);
  },

  buHaftaToplamGun(bas: string, son: string): number {
    const r = db().getFirstSync<{ adet: number }>(
      `SELECT COUNT(*) AS adet FROM calisma_gunleri WHERE tarih BETWEEN ? AND ?;`,
      [bas, son]
    );
    return r?.adet ?? 0;
  },
};
