import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { TarihSecici } from '../../src/components/TarihSecici';
import { InlineSecici } from '../../src/components/InlineSecici';
import { isDao } from '../../src/db/dao/is';
import { musteriDao } from '../../src/db/dao/musteri';
import { musteriTahsilatiDao } from '../../src/db/dao/musteriTahsilati';
import { formatPara, parsePara } from '../../src/lib/para';
import { bugun } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, RENK } from '../../src/theme';

export default function YeniTahsilatEkrani() {
  const router = useRouter();
  const { isId, duzenleId } = useLocalSearchParams<{ isId?: string; duzenleId?: string }>();
  const refresh = useStore((s) => s.refresh);
  const mevcut = duzenleId ? musteriTahsilatiDao.bul(Number(duzenleId)) : null;

  const isler = isDao.hepsi();
  const musteriler = musteriDao.liste();
  const musteriAd = (mid: number) => musteriler.find((m) => m.id === mid)?.ad ?? '';

  const [secIs, setSecIs] = useState<number | null>(mevcut?.is_id ?? (isId ? Number(isId) : null));
  const [tutar, setTutar] = useState(mevcut ? String(mevcut.tutar) : '');
  const [tarih, setTarih] = useState(mevcut?.tarih ?? bugun());
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function kaydet() {
    if (secIs == null) return setHata('İş seç');
    const tutarNum = parsePara(tutar);
    if (tutarNum <= 0) return setHata('Tutar gerekli');

    if (mevcut) {
      musteriTahsilatiDao.guncelle(mevcut.id, { tutar: tutarNum, tarih, notlar: notlar.trim() || null });
    } else {
      musteriTahsilatiDao.ekle({ is_id: secIs, tutar: tutarNum, tarih, notlar: notlar.trim() || null });
    }
    refresh();
    router.back();
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <InlineSecici
          label="İŞ"
          items={isler.map((i) => ({
            id: i.id,
            baslik: i.baslik,
            altSatir: `${musteriAd(i.musteri_id)} • Kalan: ${formatPara(i.kalan)}`,
          }))}
          selectedId={secIs}
          onSelect={(id) => setSecIs(id)}
          bosMesaj="Önce müşteri ve iş ekle"
        />
        <ParaInput label="Tahsilat tutarı" value={tutar} onChangeText={setTutar} />
        <TarihSecici label="TARİH" value={tarih} onChange={setTarih} />
        <TextInput
          label="Notlar"
          value={notlar}
          onChangeText={setNotlar}
          mode="outlined"
          multiline
          style={{ marginBottom: BOSLUK.m, backgroundColor: RENK.kart }}
        />
        <Button mode="contained" icon="content-save" onPress={kaydet} contentStyle={{ paddingVertical: BOSLUK.s }}>
          Kaydet
        </Button>
      </ScrollView>
      <Snackbar visible={!!hata} onDismiss={() => setHata(null)} duration={2000}>
        {hata}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: BOSLUK.xxl },
});
