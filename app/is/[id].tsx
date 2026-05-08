import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Button, IconButton, Menu, Text, TouchableRipple } from 'react-native-paper';
import { isDao } from '../../src/db/dao/is';
import { calismaGunuDao, type CalismaGunuDetay } from '../../src/db/dao/calismaGunu';
import { musteriTahsilatiDao } from '../../src/db/dao/musteriTahsilati';
import { musteriDao } from '../../src/db/dao/musteri';
import { BakiyeKart } from '../../src/components/BakiyeKart';
import { BosListe } from '../../src/components/BosListe';
import { formatPara } from '../../src/lib/para';
import { musteriBakiye } from '../../src/lib/bakiye';
import { formatTarih } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';
import type { Is, IsBakiye, MusteriTahsilati } from '../../src/types';

type Sekme = 'tahsilat' | 'gunler';

export default function IsDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isId = Number(id);
  const router = useRouter();
  const navigation = useNavigation();
  const refresh = useStore((s) => s.refresh);
  const refreshAt = useStore((s) => s.refreshAt);

  const [is_, setIs] = useState<Is | null>(null);
  const [bakiye, setBakiye] = useState<IsBakiye | null>(null);
  const [musteriAd, setMusteriAd] = useState('');
  const [maliyet, setMaliyet] = useState(0);
  const [tahsilatlar, setTahsilatlar] = useState<MusteriTahsilati[]>([]);
  const [gunler, setGunler] = useState<CalismaGunuDetay[]>([]);
  const [sekme, setSekme] = useState<Sekme>('tahsilat');
  const [menu, setMenu] = useState(false);

  const yukle = useCallback(() => {
    const i = isDao.bul(isId);
    if (!i) {
      router.back();
      return;
    }
    setIs(i);
    setBakiye(isDao.bakiye(isId));
    const m = musteriDao.bul(i.musteri_id);
    setMusteriAd(m?.ad ?? '');
    setMaliyet(isDao.maliyet(isId));
    setTahsilatlar(musteriTahsilatiDao.isinTahsilatlari(isId));
    setGunler(calismaGunuDao.isinGunleri(isId));
  }, [isId, router]);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      yukle();
    }, [yukle, refreshAt])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: is_?.baslik ?? 'İş',
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
              router.push({ pathname: '/is/yeni', params: { duzenleId: String(isId) } });
            }}
            title="Düzenle"
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setMenu(false);
              Alert.alert('İşi sil', 'Tahsilatlar silinir, çalışma günleri "iş atanmamış" olur. Devam?', [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Sil',
                  style: 'destructive',
                  onPress: () => {
                    isDao.sil(isId);
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
  }, [navigation, is_, menu, isId, router, refresh]);

  const brutKar = (is_?.anlasilan_tutar ?? 0) - maliyet;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.icerik}>
        <Text style={styles.musteri}>{musteriAd}</Text>

        {(() => {
          const b = musteriBakiye(bakiye?.kalan ?? 0);
          return (
            <BakiyeKart
              baslik={b.uzunBaslik.toUpperCase()}
              tutar={b.tutar}
              renk={b.renk}
              altSatir={`Anlaşılan: ${formatPara(bakiye?.anlasilan_tutar ?? 0)}  •  Tahsil: ${formatPara(bakiye?.tahsil_edilen ?? 0)}`}
            />
          );
        })()}

        <View style={styles.karKart}>
          <View style={{ flex: 1 }}>
            <Text style={styles.karBaslik}>Maliyet</Text>
            <Text style={styles.karDeger}>{formatPara(maliyet)}</Text>
          </View>
          <View style={styles.karAyrac} />
          <View style={{ flex: 1 }}>
            <Text style={styles.karBaslik}>Brüt kâr</Text>
            <Text style={[styles.karDeger, { color: brutKar >= 0 ? RENK.alacak : RENK.borc }]}>
              {formatPara(brutKar)}
            </Text>
          </View>
        </View>

        <View style={styles.sekmeler}>
          <TouchableRipple onPress={() => setSekme('tahsilat')} style={[styles.sekme, sekme === 'tahsilat' && styles.sekmeAktif]}>
            <Text style={[styles.sekmeMetin, sekme === 'tahsilat' && styles.sekmeMetinAktif]}>
              Tahsilatlar ({tahsilatlar.length})
            </Text>
          </TouchableRipple>
          <TouchableRipple onPress={() => setSekme('gunler')} style={[styles.sekme, sekme === 'gunler' && styles.sekmeAktif]}>
            <Text style={[styles.sekmeMetin, sekme === 'gunler' && styles.sekmeMetinAktif]}>
              Çalışma Günleri ({gunler.length})
            </Text>
          </TouchableRipple>
        </View>

        {sekme === 'tahsilat' &&
          (tahsilatlar.length === 0 ? (
            <BosListe mesaj="Henüz tahsilat yok." />
          ) : (
            tahsilatlar.map((t) => (
              <View key={t.id} style={styles.satir}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.satirBaslik}>{formatTarih(t.tarih)}</Text>
                  {t.notlar ? <Text style={styles.satirAlt}>{t.notlar}</Text> : null}
                </View>
                <Text style={[styles.satirTutar, { color: RENK.alacak }]}>+{formatPara(t.tutar)}</Text>
              </View>
            ))
          ))}

        {sekme === 'gunler' &&
          (gunler.length === 0 ? (
            <BosListe mesaj="Bu işe atanmış çalışma günü yok." />
          ) : (
            gunler.map((g) => (
              <View key={g.id} style={styles.satir}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.satirBaslik}>{g.personel_ad}</Text>
                  <Text style={styles.satirAlt}>{formatTarih(g.tarih)}</Text>
                </View>
                <Text style={[styles.satirTutar, { color: RENK.borc }]}>{formatPara(g.gunluk_ucret)}</Text>
              </View>
            ))
          ))}
      </ScrollView>

      <View style={styles.fabKap}>
        <Button
          mode="contained"
          icon="cash-plus"
          onPress={() => router.push({ pathname: '/tahsilat/yeni', params: { isId: String(isId) } })}
          style={styles.fabButon}
          contentStyle={{ paddingVertical: BOSLUK.s }}
        >
          Tahsilat Al
        </Button>
        <Button
          mode="contained-tonal"
          icon="briefcase-clock"
          onPress={() => router.push({ pathname: '/gun/yeni', params: { isId: String(isId) } })}
          style={styles.fabButon}
          contentStyle={{ paddingVertical: BOSLUK.s }}
        >
          Gün Ekle
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: 140 },
  musteri: {
    fontSize: PUNTO.kucuk,
    color: RENK.ikincilMetin,
    marginBottom: BOSLUK.s,
    paddingHorizontal: BOSLUK.s,
  },
  karKart: {
    flexDirection: 'row',
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  karAyrac: { width: 1, backgroundColor: RENK.cizgi, marginHorizontal: BOSLUK.l },
  karBaslik: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, marginBottom: BOSLUK.xs },
  karDeger: { fontSize: PUNTO.altBaslik, fontWeight: '700', color: RENK.notr },
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
