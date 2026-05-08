import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { dbSifirla } from '../db/client';

const DB_DIZIN = `${FileSystem.documentDirectory}SQLite/`;
const DB_DOSYA = `${DB_DIZIN}personel-takip.db`;

export async function yedekAl(): Promise<void> {
  const bilgi = await FileSystem.getInfoAsync(DB_DOSYA);
  if (!bilgi.exists) {
    throw new Error('Veritabanı dosyası bulunamadı.');
  }
  const paylasilabilir = await Sharing.isAvailableAsync();
  if (!paylasilabilir) {
    throw new Error('Bu cihazda paylaşma desteği yok.');
  }
  // Tarihli bir kopya oluştur, daha okunabilir bir dosya adıyla paylaş.
  const tarih = new Date().toISOString().slice(0, 10);
  const hedef = `${FileSystem.cacheDirectory}personel-takip-${tarih}.db`;
  await FileSystem.copyAsync({ from: DB_DOSYA, to: hedef });
  await Sharing.shareAsync(hedef, {
    mimeType: 'application/x-sqlite3',
    dialogTitle: 'Personel Takip yedeği',
    UTI: 'public.database',
  });
}

export async function yedekGeriYukle(): Promise<boolean> {
  const sonuc = await DocumentPicker.getDocumentAsync({
    type: ['application/x-sqlite3', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
  });
  if (sonuc.canceled || !sonuc.assets?.[0]) return false;
  const kaynak = sonuc.assets[0].uri;

  // Dizin yoksa oluştur.
  const dizinBilgi = await FileSystem.getInfoAsync(DB_DIZIN);
  if (!dizinBilgi.exists) {
    await FileSystem.makeDirectoryAsync(DB_DIZIN, { intermediates: true });
  }

  // Mevcut bağlantıyı kapat ki dosya kilidi olmasın.
  dbSifirla();

  // Mevcut dosyayı sil ve yeniyi kopyala.
  const mevcut = await FileSystem.getInfoAsync(DB_DOSYA);
  if (mevcut.exists) {
    await FileSystem.deleteAsync(DB_DOSYA, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: kaynak, to: DB_DOSYA });
  return true;
}
