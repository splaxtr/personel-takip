import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { personelDao } from '../../src/db/dao/personel';
import { isDao } from '../../src/db/dao/is';
import { calismaGunuDao } from '../../src/db/dao/calismaGunu';
import { personelOdemesiDao } from '../../src/db/dao/personelOdemesi';
import { musteriTahsilatiDao } from '../../src/db/dao/musteriTahsilati';
import { BakiyeKart } from '../../src/components/BakiyeKart';
import { buAyAraligi, buHaftaAraligi } from '../../src/lib/tarih';
import { formatPara } from '../../src/lib/para';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';

export default function OzetEkrani() {
  const router = useRouter();
  const refreshAt = useStore((s) => s.refreshAt);
  const [borc, setBorc] = useState(0);
  const [avans, setAvans] = useState(0);
  const [alacak, setAlacak] = useState(0);
  const [musteriBorcu, setMusteriBorcu] = useState(0);
  const [haftaGun, setHaftaGun] = useState(0);
  const [ayOdeme, setAyOdeme] = useState(0);
  const [ayTahsil, setAyTahsil] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      setBorc(personelDao.toplamBorc());
      setAvans(personelDao.toplamAvans());
      setAlacak(isDao.toplamAlacak());
      setMusteriBorcu(isDao.toplamMusteriBorcu());
      const hafta = buHaftaAraligi();
      setHaftaGun(calismaGunuDao.buHaftaToplamGun(hafta.bas, hafta.son));
      const ay = buAyAraligi();
      setAyOdeme(personelOdemesiDao.buAyToplam(ay.bas, ay.son));
      setAyTahsil(musteriTahsilatiDao.buAyToplam(ay.bas, ay.son));
    }, [refreshAt])
  );

  return (
    <ScrollView contentContainerStyle={styles.icerik}>
      <BakiyeKart
        baslik="Personellere Borcum"
        tutar={borc}
        renk={borc > 0 ? 'borc' : 'notr'}
        altSatir={
          avans > 0
            ? `Verilen avans (alacaklı): ${formatPara(avans)}`
            : 'Hak edip ödenmemiş tutar'
        }
      />
      <BakiyeKart
        baslik="Müşterilerden Alacağım"
        tutar={alacak}
        renk={alacak > 0 ? 'alacak' : 'notr'}
        altSatir={
          musteriBorcu > 0
            ? `Müşteriye borçluyuz (fazla tahsilat): ${formatPara(musteriBorcu)}`
            : 'Anlaşmalardan tahsil edilmemiş tutar'
        }
      />

      <View style={styles.miniKart}>
        <Text style={styles.miniBaslik}>Bu Hafta</Text>
        <Text style={styles.miniDeger}>{haftaGun} çalışma günü</Text>
      </View>

      <View style={styles.miniKart}>
        <Text style={styles.miniBaslik}>Bu Ay</Text>
        <Text style={styles.miniSatir}>Ödediğim: {formatPara(ayOdeme)}</Text>
        <Text style={styles.miniSatir}>Tahsil ettiğim: {formatPara(ayTahsil)}</Text>
      </View>

      <View style={styles.butonlar}>
        <Button
          mode="contained"
          icon="briefcase-clock"
          onPress={() => router.push('/gun/yeni')}
          style={styles.buton}
          contentStyle={{ paddingVertical: BOSLUK.s }}
          labelStyle={{ fontSize: PUNTO.govde }}
        >
          Çalışma Günü Ekle
        </Button>
        <Button
          mode="contained-tonal"
          icon="cash-plus"
          onPress={() => router.push('/tahsilat/yeni')}
          style={styles.buton}
          contentStyle={{ paddingVertical: BOSLUK.s }}
          labelStyle={{ fontSize: PUNTO.govde }}
        >
          Tahsilat Al
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: BOSLUK.xxl },
  miniKart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  miniBaslik: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: BOSLUK.xs,
  },
  miniDeger: { fontSize: PUNTO.altBaslik, color: RENK.notr, fontWeight: '600' },
  miniSatir: { fontSize: PUNTO.govde, color: RENK.notr, marginTop: BOSLUK.xs },
  butonlar: { marginTop: BOSLUK.l, gap: BOSLUK.m },
  buton: { borderRadius: RADIUS.m },
});
