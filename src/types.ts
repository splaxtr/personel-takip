export type Personel = {
  id: number;
  ad: string;
  telefon: string | null;
  gunluk_ucret: number;
  aktif: number;
  notlar: string | null;
  created_at: string;
};

export type Musteri = {
  id: number;
  ad: string;
  telefon: string | null;
  adres: string | null;
  notlar: string | null;
  created_at: string;
};

export type IsDurum = 'devam' | 'tamamlandi' | 'iptal';

export type Is = {
  id: number;
  musteri_id: number;
  baslik: string;
  anlasilan_tutar: number;
  baslangic_tarihi: string | null;
  durum: IsDurum;
  notlar: string | null;
  created_at: string;
};

export type CalismaGunu = {
  id: number;
  personel_id: number;
  is_id: number | null;
  tarih: string;
  gunluk_ucret: number;
  notlar: string | null;
  created_at: string;
};

export type PersonelOdemesi = {
  id: number;
  personel_id: number;
  tutar: number;
  tarih: string;
  notlar: string | null;
  created_at: string;
};

export type MusteriTahsilati = {
  id: number;
  is_id: number;
  tutar: number;
  tarih: string;
  notlar: string | null;
  created_at: string;
};

export type PersonelBakiye = {
  id: number;
  ad: string;
  hak_edilen: number;
  odenen: number;
  kalan: number;
};

export type IsBakiye = {
  id: number;
  musteri_id: number;
  baslik: string;
  anlasilan_tutar: number;
  tahsil_edilen: number;
  kalan: number;
};
