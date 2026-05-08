import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Button, IconButton, Menu, Text, TouchableRipple } from 'react-native-paper';
import { musteriDao } from '../../src/db/dao/musteri';
import { isDao } from '../../src/db/dao/is';
import { BakiyeKart } from '../../src/components/BakiyeKart';
import { BosListe } from '../../src/components/BosListe';
import { formatPara } from '../../src/lib/para';
import { musteriBakiye } from '../../src/lib/bakiye';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';
import type { IsBakiye, Musteri } from '../../src/types';

export default function MusteriDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const musteriId = Number(id);
  const router = useRouter();
  const navigation = useNavigation();
  const refresh = useStore((s) => s.refresh);
  const refreshAt = useStore((s) => s.refreshAt);

  const [musteri, setMusteri] = useState<Musteri | null>(null);
  const [ozet, setOzet] = useState({ toplam: 0, tahsil: 0, kalan: 0 });
  const [isler, setIsler] = useState<IsBakiye[]>([]);
  const [menu, setMenu] = useState(false);

  const yukle = useCallback(() => {
    const m = musteriDao.bul(musteriId);
    if (!m) {
      router.back();
      return;
    }
    setMusteri(m);
    setOzet(musteriDao.bakiyeOzeti(musteriId));
    setIsler(isDao.listeMusteriIle(musteriId));
  }, [musteriId, router]);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      yukle();
    }, [yukle, refreshAt])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: musteri?.ad ?? 'Müşteri',
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
              router.push({ pathname: '/musteri/yeni', params: { duzenleId: String(musteriId) } });
            }}
            title="Düzenle"
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setMenu(false);
              Alert.alert(
                'Müşteriyi sil',
                'Tüm işleri ve tahsilatları silinir. Personellerin çalışma günleri kalır ama "iş atanmamış" olur. Devam edilsin mi?',
                [
                  { text: 'Vazgeç', style: 'cancel' },
                  {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                      musteriDao.sil(musteriId);
                      refresh();
                      router.back();
                    },
                  },
                ]
              );
            }}
            title="Sil"
          />
        </Menu>
      ),
    });
  }, [navigation, musteri, menu, musteriId, router, refresh]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.icerik}>
        {(() => {
          const b = musteriBakiye(ozet.kalan);
          return (
            <BakiyeKart
              baslik={b.uzunBaslik.toUpperCase()}
              tutar={b.tutar}
              renk={b.renk}
              altSatir={`Anlaşılan: ${formatPara(ozet.toplam)}  •  Tahsil: ${formatPara(ozet.tahsil)}`}
            />
          );
        })()}

        {musteri?.telefon || musteri?.adres ? (
          <View style={styles.bilgiKart}>
            {musteri.telefon ? <Text style={styles.bilgi}>📞 {musteri.telefon}</Text> : null}
            {musteri.adres ? <Text style={styles.bilgi}>📍 {musteri.adres}</Text> : null}
          </View>
        ) : null}

        <Text style={styles.bolum}>İŞLER ({isler.length})</Text>

        {isler.length === 0 ? (
          <BosListe mesaj="Henüz iş yok. Aşağıdan ekle." />
        ) : (
          isler.map((i) => {
            const b = musteriBakiye(i.kalan);
            const renkDeger = b.renk === 'borc' ? RENK.borc : b.renk === 'alacak' ? RENK.alacak : RENK.ikincilMetin;
            return (
              <TouchableRipple key={i.id} onPress={() => router.push(`/is/${i.id}`)}>
                <View style={styles.isKart}>
                  <Text style={styles.isBaslik}>{i.baslik}</Text>
                  <View style={styles.isSatir}>
                    <Text style={styles.isMetin}>Anlaşılan: {formatPara(i.anlasilan_tutar)}</Text>
                    <Text style={[styles.isMetin, { color: renkDeger, fontWeight: '700' }]}>
                      {b.etiket === 'Sıfır' ? 'Bakiye sıfır' : `${b.etiket}: ${formatPara(b.tutar)}`}
                    </Text>
                  </View>
                </View>
              </TouchableRipple>
            );
          })
        )}
      </ScrollView>

      <Button
        mode="contained"
        icon="briefcase-plus"
        onPress={() => router.push({ pathname: '/is/yeni', params: { musteriId: String(musteriId) } })}
        style={styles.fab}
        contentStyle={{ paddingVertical: BOSLUK.s }}
      >
        Yeni İş
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: 100 },
  bilgiKart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  bilgi: { fontSize: PUNTO.govde, color: RENK.notr, marginVertical: 2 },
  bolum: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    letterSpacing: 0.8,
    marginTop: BOSLUK.s,
    marginBottom: BOSLUK.s,
  },
  isKart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.s,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  isBaslik: { fontSize: PUNTO.altBaslik, fontWeight: '600', color: RENK.notr },
  isSatir: { flexDirection: 'row', justifyContent: 'space-between', marginTop: BOSLUK.xs },
  isMetin: { fontSize: PUNTO.kucuk, color: RENK.ikincilMetin },
  fab: {
    position: 'absolute',
    left: BOSLUK.m,
    right: BOSLUK.m,
    bottom: BOSLUK.m,
    borderRadius: RADIUS.m,
  },
});
