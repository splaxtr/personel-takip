import { db } from '../client';
import type { Is, IsBakiye, IsDurum } from '../../types';

export const isDao = {
  listeMusteriIle(musteri_id: number): IsBakiye[] {
    return db().getAllSync<IsBakiye>(
      `SELECT * FROM v_is_bakiye WHERE musteri_id = ? ORDER BY id DESC;`,
      [musteri_id]
    );
  },

  hepsi(): IsBakiye[] {
    return db().getAllSync<IsBakiye>(`SELECT * FROM v_is_bakiye ORDER BY id DESC;`);
  },

  bul(id: number): Is | null {
    return db().getFirstSync<Is>('SELECT * FROM isler WHERE id = ?;', [id]) ?? null;
  },

  bakiye(id: number): IsBakiye | null {
    return db().getFirstSync<IsBakiye>('SELECT * FROM v_is_bakiye WHERE id = ?;', [id]) ?? null;
  },

  ekle(i: {
    musteri_id: number;
    baslik: string;
    anlasilan_tutar: number;
    baslangic_tarihi?: string | null;
    durum?: IsDurum;
    notlar?: string | null;
  }): number {
    const r = db().runSync(
      `INSERT INTO isler (musteri_id, baslik, anlasilan_tutar, baslangic_tarihi, durum, notlar)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        i.musteri_id,
        i.baslik,
        i.anlasilan_tutar,
        i.baslangic_tarihi ?? null,
        i.durum ?? 'devam',
        i.notlar ?? null,
      ]
    );
    return r.lastInsertRowId;
  },

  guncelle(
    id: number,
    i: {
      baslik: string;
      anlasilan_tutar: number;
      baslangic_tarihi?: string | null;
      durum: IsDurum;
      notlar?: string | null;
    }
  ) {
    db().runSync(
      `UPDATE isler SET baslik = ?, anlasilan_tutar = ?, baslangic_tarihi = ?, durum = ?, notlar = ?
       WHERE id = ?;`,
      [i.baslik, i.anlasilan_tutar, i.baslangic_tarihi ?? null, i.durum, i.notlar ?? null, id]
    );
  },

  sil(id: number) {
    db().runSync('DELETE FROM isler WHERE id = ?;', [id]);
  },

  maliyet(is_id: number): number {
    const r = db().getFirstSync<{ maliyet: number | null }>(
      `SELECT COALESCE(SUM(gunluk_ucret), 0) AS maliyet
       FROM calisma_gunleri WHERE is_id = ?;`,
      [is_id]
    );
    return r?.maliyet ?? 0;
  },

  toplamAlacak(): number {
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(kalan) AS toplam FROM v_is_bakiye WHERE kalan > 0;`
    );
    return r?.toplam ?? 0;
  },

  toplamMusteriBorcu(): number {
    // kalan < 0 → müşteri fazla ödemiş, biz borçluyuz
    const r = db().getFirstSync<{ toplam: number | null }>(
      `SELECT SUM(-kalan) AS toplam FROM v_is_bakiye WHERE kalan < 0;`
    );
    return r?.toplam ?? 0;
  },
};
