import React, { useCallback, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FAB, Text, TouchableRipple } from 'react-native-paper';
import { personelDao } from '../../src/db/dao/personel';
import { BosListe } from '../../src/components/BosListe';
import { formatPara } from '../../src/lib/para';
import { personelBakiye } from '../../src/lib/bakiye';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';
import type { PersonelBakiye } from '../../src/types';

export default function PersonellerEkrani() {
  const router = useRouter();
  const refreshAt = useStore((s) => s.refreshAt);
  const [liste, setListe] = useState<PersonelBakiye[]>([]);

  useFocusEffect(
    useCallback(() => {
      void refreshAt;
      setListe(personelDao.bakiyeListe());
    }, [refreshAt])
  );

  return (
    <View style={{ flex: 1 }}>
      {liste.length === 0 ? (
        <BosListe mesaj={'Henüz personel yok.\nSağ alttan + ile ekle.'} />
      ) : (
        <FlatList
          data={liste}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: BOSLUK.m, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const b = personelBakiye(item.kalan);
            const renkDeger = b.renk === 'borc' ? RENK.borc : b.renk === 'alacak' ? RENK.alacak : RENK.ikincilMetin;
            return (
              <TouchableRipple onPress={() => router.push(`/personel/${item.id}`)}>
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
      <FAB icon="plus" label="Personel Ekle" onPress={() => router.push('/personel/yeni')} style={styles.fab} />
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
