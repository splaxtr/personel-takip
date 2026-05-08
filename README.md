# Personel Takip

Küçük ölçekli işler için **personel** ve **müşteri** takibi yapan, telefonda %100 offline çalışan basit bir mobil uygulama. Expo + React Native + SQLite.

## Ne yapar?

- **Personel:** Hangi günler çalıştı, kaç paradan çalıştı, ne kadar ödendi, kaç ₺ borcum kaldı?
- **Müşteri / İş:** Anlaşılan tutar ne kadar, ne kadar tahsil ettim, kaç ₺ alacağım var?
- **Bağlantı:** Bir personelin çalıştığı gün hangi işe (müşteri-iş) ait? İşin maliyeti ve brüt kârı kaç ₺?

## Mimari

- **Stack:** Expo SDK 54, React Native 0.81, TypeScript, expo-router, SQLite (`expo-sqlite`), react-native-paper, Zustand, date-fns.
- **Veri:** Yalnızca cihazda (`personel-takip.db`). Yedekleme dosya paylaşımı ile (`expo-sharing`/`expo-document-picker`).
- **Offline:** İnternet izni yok (`blockedPermissions: ["INTERNET"]`). Hiçbir ağ çağrısı yapılmaz.
- **Tek kullanıcı:** Login yok.

## Kurulum

```bash
npm install
npx expo start
```

Telefondaki **Expo Go**'da QR kodu okut.

> Not: Expo Go geliştirme aşamasında JS bundle'ı dev sunucudan çeker. **Tam offline test** için EAS Build ile bağımsız APK üret:
>
> ```bash
> npx eas build -p android --profile preview
> ```

## Klasör yapısı

```
app/                       # expo-router rotalar
  (tabs)/                  # Özet, Personeller, Müşteriler, Ayarlar
  personel/                # liste/[id]/yeni
  musteri/
  is/
  gun/yeni.tsx             # çalışma günü ekle
  odeme/yeni.tsx           # personele ödeme yap
  tahsilat/yeni.tsx        # müşteriden tahsilat al
src/
  db/                      # client + 6 DAO + schema (sadece v1)
  components/              # BakiyeKart, ParaInput, TarihSecici, BosListe, InlineSecici
  lib/                     # para, tarih, yedek
  store/                   # zustand (refreshAt + varsayılan ücret)
  theme.ts                 # RENK / PUNTO / BOSLUK sabitleri
  types.ts
```

## UI ilkeleri

- **2 renk:** koyu yeşil (alacak), koyu kırmızı (borç). Geri kalan siyah/beyaz/gri.
- **Büyük punto:** Bakiye 36sp, gövde 18sp.
- **Tek FAB:** her ekranda en fazla bir ana aksiyon butonu.
- **Tarih default = bugün**, **ücret default = personelin günlük ücreti**.
- **Animasyon yok**, **boş listeler açıklamalı**, **silme dışında onay yok**.

## Veri modeli

6 tablo: `personeller`, `musteriler`, `isler`, `calisma_gunleri`, `personel_odemeleri`, `musteri_tahsilatlari` + 2 view (`v_personel_bakiye`, `v_is_bakiye`). Çalışma gününün ücreti **anlık snapshot** olarak saklanır; personelin günlük ücreti sonradan değişse bile geçmiş günler etkilenmez.

## Yedek / Geri yükle

Ayarlar sekmesi → "Yedek Al" — `personel-takip-YYYY-MM-DD.db` dosyasını WhatsApp/Drive/E-postaya gönderir. "Yedeği Geri Yükle" tam tersi: dosyayı seç, mevcut DB'nin üzerine yaz.
