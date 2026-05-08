import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { musteriDao } from '../../src/db/dao/musteri';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RENK } from '../../src/theme';

export default function YeniMusteriEkrani() {
  const router = useRouter();
  const { duzenleId } = useLocalSearchParams<{ duzenleId?: string }>();
  const refresh = useStore((s) => s.refresh);

  const mevcut = duzenleId ? musteriDao.bul(Number(duzenleId)) : null;

  const [ad, setAd] = useState(mevcut?.ad ?? '');
  const [telefon, setTelefon] = useState(mevcut?.telefon ?? '');
  const [adres, setAdres] = useState(mevcut?.adres ?? '');
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function kaydet() {
    if (!ad.trim()) {
      setHata('Ad gerekli');
      return;
    }
    const veri = {
      ad: ad.trim(),
      telefon: telefon.trim() || null,
      adres: adres.trim() || null,
      notlar: notlar.trim() || null,
    };
    if (mevcut) {
      musteriDao.guncelle(mevcut.id, veri);
    } else {
      musteriDao.ekle(veri);
    }
    refresh();
    router.back();
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <Text style={styles.bolum}>ZORUNLU</Text>
        <TextInput label="Ad / Firma" value={ad} onChangeText={setAd} mode="outlined" style={styles.alan} />

        <Text style={styles.bolum}>İSTEĞE BAĞLI</Text>
        <TextInput
          label="Telefon"
          value={telefon}
          onChangeText={setTelefon}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.alan}
        />
        <TextInput label="Adres" value={adres} onChangeText={setAdres} mode="outlined" style={styles.alan} multiline />
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
  bolum: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, letterSpacing: 0.8, marginTop: BOSLUK.s, marginBottom: BOSLUK.s },
  alan: { marginBottom: BOSLUK.m, backgroundColor: RENK.kart },
});
