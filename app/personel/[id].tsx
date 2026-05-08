import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Button, IconButton, Menu, Text, TouchableRipple } from 'react-native-paper';
import { personelDao } from '../../src/db/dao/personel';
import { calismaGunuDao, type CalismaGunuDetay } from '../../src/db/dao/calismaGunu';
import { personelOdemesiDao } from '../../src/db/dao/personelOdemesi';
import { BakiyeKart } from '../../src/components/BakiyeKart';
import { BosListe } from '../../src/components/BosListe';
import { formatPara } from '../../src/lib/para';
import { personelBakiye } from '../../src/lib/bakiye';
import { formatTarih } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';
import type { PersonelBakiye, PersonelOdemesi } from '../../src/types';

type Sekme = 'gunler' | 'odemeler';

export default function PersonelDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const personelId = Number(id);
  const router = useRouter();
  const navigation = useNavigation();
  const refresh = useStore((s) => s.refresh);
  const refreshAt = useStore((s) => s.refreshAt);

  const [ad, setAd] = useState('');
  const [bakiye, setBakiye] = useState<PersonelBakiye | null>(null);
  const [gunler, setGunler] = useState<CalismaGunuDetay[]>([]);
  const [odemeler, setOdemeler] = useState<PersonelOdemesi[]>([]);
  const [sekme, setSekme] = useState<Sekme>('gunler');
  const [menu, setMenu] = useState(false);

  const yukle = useCallback(() => {
    const p = personelDao.bul(personelId);
    if (!p) {
      router.back();
      return;
    }
    setAd(p.ad);
    setBakiye(personelDao.bakiye(personelId));
    setGunler(calismaGunuDao.personelinGunleri(personelId));
    setOdemeler(personelOdemesiDao.personelinOdemeleri(personelId));
  }, [personelId, router]);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      yukle();
    }, [yukle, refreshAt])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: ad || 'Personel',
      headerRight: () => (
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={<IconButton icon="dots-vertical" onPress={() => setMenu(true)} />}
        >
          <Menu.Item
            leadingIcon="pencil"
            onPress={() => {
              setMenu(false);
              router.push({ pathname: '/personel/yeni', params: { duzenleId: String(personelId) } });
            }}
            title="Düzenle"
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setMenu(false);
              Alert.alert('Personeli sil', 'Tüm çalışma günleri ve ödemeler de silinir. Devam edilsin mi?', [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Sil',
                  style: 'destructive',
                  onPress: () => {
                    personelDao.sil(personelId);
                    refresh();
                    router.back();
                  },
                },
              ]);
            }}
            title="Sil"
          />
        </Menu>
      ),
    });
  }, [navigation, ad, menu, personelId, router, refresh]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.icerik}>
        {(() => {
          const b = personelBakiye(bakiye?.kalan ?? 0);
          return (
            <BakiyeKart
              baslik={b.uzunBaslik.toUpperCase()}
              tutar={b.tutar}
              renk={b.renk}
              altSatir={`Hak ediş: ${formatPara(bakiye?.hak_edilen ?? 0)}  •  Ödenen: ${formatPara(bakiye?.odenen ?? 0)}`}
            />
          );
        })()}

        <View style={styles.sekmeler}>
          <TouchableRipple onPress={() => setSekme('gunler')} style={[styles.sekme, sekme === 'gunler' && styles.sekmeAktif]}>
            <Text style={[styles.sekmeMetin, sekme === 'gunler' && styles.sekmeMetinAktif]}>
              Çalışma Günleri ({gunler.length})
            </Text>
          </TouchableRipple>
          <TouchableRipple onPress={() => setSekme('odemeler')} style={[styles.sekme, sekme === 'odemeler' && styles.sekmeAktif]}>
            <Text style={[styles.sekmeMetin, sekme === 'odemeler' && styles.sekmeMetinAktif]}>
              Ödemeler ({odemeler.length})
            </Text>
          </TouchableRipple>
        </View>

        {sekme === 'gunler' &&
          (gunler.length === 0 ? (
            <BosListe mesaj="Henüz çalışma günü yok." />
          ) : (
            gunler.map((g) => (
              <View key={g.id} style={styles.satir}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.satirBaslik}>{formatTarih(g.tarih)}</Text>
                  <Text style={styles.satirAlt}>
                    {g.is_baslik ? `${g.musteri_ad ?? ''} — ${g.is_baslik}` : 'İş atanmamış'}
                  </Text>
                </View>
                <Text style={[styles.satirTutar, { color: RENK.alacak }]}>{formatPara(g.gunluk_ucret)}</Text>
              </View>
            ))
          ))}

        {sekme === 'odemeler' &&
          (odemeler.length === 0 ? (
            <BosListe mesaj="Henüz ödeme yok." />
          ) : (
            odemeler.map((o) => (
              <View key={o.id} style={styles.satir}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.satirBaslik}>{formatTarih(o.tarih)}</Text>
                  {o.notlar ? <Text style={styles.satirAlt}>{o.notlar}</Text> : null}
                </View>
                <Text style={[styles.satirTutar, { color: RENK.borc }]}>-{formatPara(o.tutar)}</Text>
              </View>
            ))
          ))}
      </ScrollView>

      <View style={styles.fabKap}>
        <Button
          mode="contained"
          icon="briefcase-clock"
          onPress={() => router.push({ pathname: '/gun/yeni', params: { personelId: String(personelId) } })}
          style={styles.fabButon}
          contentStyle={{ paddingVertical: BOSLUK.s }}
        >
          Gün Ekle
        </Button>
        <Button
          mode="contained-tonal"
          icon="cash-minus"
          onPress={() => router.push({ pathname: '/odeme/yeni', params: { personelId: String(personelId) } })}
          style={styles.fabButon}
          contentStyle={{ paddingVertical: BOSLUK.s }}
        >
          Ödeme Yap
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: 140 },
  sekmeler: {
    flexDirection: 'row',
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    overflow: 'hidden',
    marginBottom: BOSLUK.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  sekme: { flex: 1, paddingVertical: BOSLUK.m, alignItems: 'center' },
  sekmeAktif: { backgroundColor: RENK.vurguArkaplan },
  sekmeMetin: { fontSize: PUNTO.kucuk, color: RENK.ikincilMetin, fontWeight: '600' },
  sekmeMetinAktif: { color: RENK.primary },
  satir: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.s,
    borderWidth: 1,
    borderColor: RENK.cizgi,
    flexDirection: 'row',
    alignItems: 'center',
  },
  satirBaslik: { fontSize: PUNTO.govde, color: RENK.notr, fontWeight: '600' },
  satirAlt: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, marginTop: 2 },
  satirTutar: { fontSize: PUNTO.altBaslik, fontWeight: '700', marginLeft: BOSLUK.m },
  fabKap: {
    position: 'absolute',
    left: BOSLUK.m,
    right: BOSLUK.m,
    bottom: BOSLUK.m,
    flexDirection: 'row',
    gap: BOSLUK.s,
  },
  fabButon: { flex: 1, borderRadius: RADIUS.m },
});
