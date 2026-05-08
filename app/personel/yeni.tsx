import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, TextInput, Text, Snackbar } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { personelDao } from '../../src/db/dao/personel';
import { parsePara } from '../../src/lib/para';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RENK } from '../../src/theme';

export default function YeniPersonelEkrani() {
  const router = useRouter();
  const { duzenleId } = useLocalSearchParams<{ duzenleId?: string }>();
  const refresh = useStore((s) => s.refresh);
  const varsayilan = useStore((s) => s.varsayilanGunlukUcret);

  const mevcut = duzenleId ? personelDao.bul(Number(duzenleId)) : null;

  const [ad, setAd] = useState(mevcut?.ad ?? '');
  const [ucret, setUcret] = useState(mevcut ? String(mevcut.gunluk_ucret) : varsayilan ? String(varsayilan) : '');
  const [telefon, setTelefon] = useState(mevcut?.telefon ?? '');
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function kaydet() {
    if (!ad.trim()) {
      setHata('Ad gerekli');
      return;
    }
    const ucretNum = parsePara(ucret);
    if (ucretNum <= 0) {
      setHata('Günlük ücret gerekli');
      return;
    }
    if (mevcut) {
      personelDao.guncelle(mevcut.id, {
        ad: ad.trim(),
        telefon: telefon.trim() || null,
        gunluk_ucret: ucretNum,
        aktif: 1,
        notlar: notlar.trim() || null,
      });
    } else {
      personelDao.ekle({
        ad: ad.trim(),
        telefon: telefon.trim() || null,
        gunluk_ucret: ucretNum,
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
        <TextInput label="Ad Soyad" value={ad} onChangeText={setAd} mode="outlined" style={styles.alan} />
        <ParaInput label="Günlük ücret" value={ucret} onChangeText={setUcret} />

        <Text style={styles.bolum}>İSTEĞE BAĞLI</Text>
        <TextInput
          label="Telefon"
          value={telefon}
          onChangeText={setTelefon}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.alan}
        />
        <TextInput
          label="Notlar"
          value={notlar}
          onChangeText={setNotlar}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.alan}
        />

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
  bolum: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    letterSpacing: 0.8,
    marginTop: BOSLUK.s,
    marginBottom: BOSLUK.s,
  },
  alan: { marginBottom: BOSLUK.m, backgroundColor: RENK.kart },
});
