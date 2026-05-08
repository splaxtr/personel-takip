import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, SegmentedButtons, Snackbar, Text, TextInput } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { TarihSecici } from '../../src/components/TarihSecici';
import { isDao } from '../../src/db/dao/is';
import { parsePara } from '../../src/lib/para';
import { bugun } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RENK } from '../../src/theme';
import type { IsDurum } from '../../src/types';

export default function YeniIsEkrani() {
  const router = useRouter();
  const { musteriId, duzenleId } = useLocalSearchParams<{ musteriId?: string; duzenleId?: string }>();
  const refresh = useStore((s) => s.refresh);

  const mevcut = duzenleId ? isDao.bul(Number(duzenleId)) : null;
  const aktifMusteriId = mevcut?.musteri_id ?? Number(musteriId);

  const [baslik, setBaslik] = useState(mevcut?.baslik ?? '');
  const [tutar, setTutar] = useState(mevcut ? String(mevcut.anlasilan_tutar) : '');
  const [tarih, setTarih] = useState(mevcut?.baslangic_tarihi ?? bugun());
  const [durum, setDurum] = useState<IsDurum>(mevcut?.durum ?? 'devam');
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function kaydet() {
    if (!baslik.trim()) return setHata('Başlık gerekli');
    const tutarNum = parsePara(tutar);
    if (tutarNum <= 0) return setHata('Anlaşılan tutar gerekli');
    if (!aktifMusteriId) return setHata('Müşteri belirsiz');

    if (mevcut) {
      isDao.guncelle(mevcut.id, {
        baslik: baslik.trim(),
        anlasilan_tutar: tutarNum,
        baslangic_tarihi: tarih,
        durum,
        notlar: notlar.trim() || null,
      });
    } else {
      isDao.ekle({
        musteri_id: aktifMusteriId,
        baslik: baslik.trim(),
        anlasilan_tutar: tutarNum,
        baslangic_tarihi: tarih,
        durum,
        notlar: notlar.trim() || null,
      });
    }
    refresh();
    router.back();
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <Text style={styles.bolum}>ZORUNLU</Text>
        <TextInput label="İş Başlığı (örn. Banyo tadilatı)" value={baslik} onChangeText={setBaslik} mode="outlined" style={styles.alan} />
        <ParaInput label="Anlaşılan tutar" value={tutar} onChangeText={setTutar} />

        <Text style={styles.bolum}>DETAYLAR</Text>
        <TarihSecici label="Başlangıç tarihi" value={tarih} onChange={setTarih} />

        <Text style={[styles.bolum, { marginTop: BOSLUK.s }]}>Durum</Text>
        <SegmentedButtons
          value={durum}
          onValueChange={(v) => setDurum(v as IsDurum)}
          buttons={[
            { value: 'devam', label: 'Devam' },
            { value: 'tamamlandi', label: 'Bitti' },
            { value: 'iptal', label: 'İptal' },
          ]}
          style={{ marginBottom: BOSLUK.m }}
        />

        <TextInput label="Notlar" value={notlar} onChangeText={setNotlar} mode="outlined" multiline numberOfLines={3} style={styles.alan} />

        <View style={{ marginTop: BOSLUK.l }}>
          <Button mode="contained" icon="content-save" onPress={kaydet} contentStyle={{ paddingVertical: BOSLUK.s }}>
            Kaydet
          </Button>
        </View>
      </ScrollView>
      <Snackbar visible={!!hata} onDismiss={() => setHata(null)} duration={2000}>
        {hata}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: BOSLUK.xxl },
  bolum: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, letterSpacing: 0.8, marginTop: BOSLUK.s, marginBottom: BOSLUK.s },
  alan: { marginBottom: BOSLUK.m, backgroundColor: RENK.kart },
});
