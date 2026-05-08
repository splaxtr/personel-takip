import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { TarihSecici } from '../../src/components/TarihSecici';
import { InlineSecici } from '../../src/components/InlineSecici';
import { personelDao } from '../../src/db/dao/personel';
import { personelOdemesiDao } from '../../src/db/dao/personelOdemesi';
import { parsePara } from '../../src/lib/para';
import { bugun } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, RENK } from '../../src/theme';

export default function YeniOdemeEkrani() {
  const router = useRouter();
  const { personelId, duzenleId } = useLocalSearchParams<{ personelId?: string; duzenleId?: string }>();
  const refresh = useStore((s) => s.refresh);
  const mevcut = duzenleId ? personelOdemesiDao.bul(Number(duzenleId)) : null;

  const personeller = personelDao.liste();
  const [secPersonel, setSecPersonel] = useState<number | null>(
    mevcut?.personel_id ?? (personelId ? Number(personelId) : null)
  );
  const [tutar, setTutar] = useState(mevcut ? String(mevcut.tutar) : '');
  const [tarih, setTarih] = useState(mevcut?.tarih ?? bugun());
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function kaydet() {
    if (secPersonel == null) return setHata('Personel seç');
    const tutarNum = parsePara(tutar);
    if (tutarNum <= 0) return setHata('Tutar gerekli');

    if (mevcut) {
      personelOdemesiDao.guncelle(mevcut.id, { tutar: tutarNum, tarih, notlar: notlar.trim() || null });
    } else {
      personelOdemesiDao.ekle({
        personel_id: secPersonel,
        tutar: tutarNum,
        tarih,
        notlar: notlar.trim() || null,
      });
    }
    refresh();
    router.back();
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <InlineSecici
          label="PERSONEL"
          items={personeller.map((p) => ({ id: p.id, baslik: p.ad }))}
          selectedId={secPersonel}
          onSelect={(id) => setSecPersonel(id)}
          bosMesaj="Önce personel ekle"
        />
        <ParaInput label="Ödeme tutarı" value={tutar} onChangeText={setTutar} />
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
