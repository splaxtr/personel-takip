import React, { useCallback, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FAB, Text, TouchableRipple } from 'react-native-paper';
import { musteriDao } from '../../src/db/dao/musteri';
import { BosListe } from '../../src/components/BosListe';
import { formatPara } from '../../src/lib/para';
import { musteriBakiye } from '../../src/lib/bakiye';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';
import type { Musteri } from '../../src/types';

type Satir = Musteri & { kalan: number };

export default function MusterilerEkrani() {
  const router = useRouter();
  const refreshAt = useStore((s) => s.refreshAt);
  const [liste, setListe] = useState<Satir[]>([]);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      const m = musteriDao.liste();
      setListe(m.map((x) => ({ ...x, kalan: musteriDao.bakiyeOzeti(x.id).kalan })));
    }, [refreshAt])
  );

  return (
    <View style={{ flex: 1 }}>
      {liste.length === 0 ? (
        <BosListe mesaj={'Henüz müşteri yok.\nSağ alttan + ile ekle.'} />
      ) : (
        <FlatList
          data={liste}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: BOSLUK.m, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const b = musteriBakiye(item.kalan);
            const renkDeger = b.renk === 'borc' ? RENK.borc : b.renk === 'alacak' ? RENK.alacak : RENK.ikincilMetin;
            return (
              <TouchableRipple onPress={() => router.push(`/musteri/${item.id}`)}>
                <View style={styles.kart}>
                  <Text style={styles.ad}>{item.ad}</Text>
                  <Text style={[styles.tutar, { color: renkDeger }]}>
                    {b.renk === 'notr' ? 'Bakiye sıfır' : `${b.etiket}: ${formatPara(b.tutar)}`}
                  </Text>
                </View>
              </TouchableRipple>
            );
          }}
        />
      )}
      <FAB icon="plus" label="Müşteri Ekle" onPress={() => router.push('/musteri/yeni')} style={styles.fab} />
    </View>
  );
}

const styles = StyleSheet.create({
  kart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.s,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  ad: { fontSize: PUNTO.altBaslik, color: RENK.notr, fontWeight: '600' },
  tutar: { fontSize: PUNTO.govde, marginTop: BOSLUK.xs },
  fab: { position: 'absolute', right: BOSLUK.l, bottom: BOSLUK.l, backgroundColor: RENK.primary },
});
