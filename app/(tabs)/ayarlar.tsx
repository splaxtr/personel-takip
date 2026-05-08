import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Button, Snackbar, Text } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { yedekAl, yedekGeriYukle } from '../../src/lib/yedek';
import { parsePara, formatPara } from '../../src/lib/para';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';

export default function AyarlarEkrani() {
  const varsayilan = useStore((s) => s.varsayilanGunlukUcret);
  const setVarsayilan = useStore((s) => s.setVarsayilanGunlukUcret);
  const refresh = useStore((s) => s.refresh);

  const [ucret, setUcret] = useState('');
  const [mesaj, setMesaj] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setUcret(varsayilan ? String(varsayilan) : '');
    }, [varsayilan])
  );

  function ucretiKaydet() {
    setVarsayilan(parsePara(ucret));
    setMesaj('Varsayılan ücret kaydedildi');
  }

  async function alYedek() {
    try {
      await yedekAl();
    } catch (e: any) {
      Alert.alert('Yedek hatası', String(e?.message ?? e));
    }
  }

  function geriYukle() {
    Alert.alert(
      'Yedek geri yükle',
      'Mevcut tüm veriler silinip yedek dosyasındaki verilerle değiştirilecek. Devam edilsin mi?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Devam et',
          style: 'destructive',
          onPress: async () => {
            try {
              const ok = await yedekGeriYukle();
              if (ok) {
                refresh();
                setMesaj('Yedek geri yüklendi');
              }
            } catch (e: any) {
              Alert.alert('Geri yükleme hatası', String(e?.message ?? e));
            }
          },
        },
      ]
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik}>
        <Text style={styles.bolum}>VARSAYILAN</Text>
        <View style={styles.kart}>
          <Text style={styles.aciklama}>
            Yeni personel eklerken günlük ücret bu değerle başlar. Şu an: {formatPara(varsayilan)}
          </Text>
          <ParaInput label="Varsayılan günlük ücret" value={ucret} onChangeText={setUcret} />
          <Button mode="contained" onPress={ucretiKaydet} icon="content-save">
            Kaydet
          </Button>
        </View>

        <Text style={styles.bolum}>YEDEKLEME</Text>
        <View style={styles.kart}>
          <Text style={styles.aciklama}>
            Tüm veriler telefonda saklanır. Telefonu değiştireceksen veya kaybolma riskine karşı yedek al.
          </Text>
          <Button mode="contained" icon="cloud-upload" onPress={alYedek} style={{ marginBottom: BOSLUK.s }}>
            Yedek Al (paylaş)
          </Button>
          <Button mode="outlined" icon="cloud-download" onPress={geriYukle}>
            Yedeği Geri Yükle
          </Button>
        </View>

        <Text style={styles.bolum}>HAKKINDA</Text>
        <View style={styles.kart}>
          <Text style={styles.aciklama}>Personel Takip — sürüm 1.0</Text>
          <Text style={styles.aciklama}>%100 offline çalışır. İnternete bağlanmaz.</Text>
        </View>
      </ScrollView>
      <Snackbar visible={!!mesaj} onDismiss={() => setMesaj(null)} duration={1500}>
        {mesaj}
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
    marginTop: BOSLUK.l,
    marginBottom: BOSLUK.s,
    paddingHorizontal: BOSLUK.s,
  },
  kart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  aciklama: { fontSize: PUNTO.kucuk, color: RENK.ikincilMetin, marginBottom: BOSLUK.m, lineHeight: 22 },
});
