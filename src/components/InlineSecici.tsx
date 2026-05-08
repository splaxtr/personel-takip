import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../theme';

type Item = { id: number; baslik: string; altSatir?: string };

type Props = {
  label: string;
  items: Item[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  bosMesaj?: string;
  altinaIzin?: boolean; // "atanmamış" seçeneği göstersin mi
};

export function InlineSecici({ label, items, selectedId, onSelect, bosMesaj, altinaIzin }: Props) {
  return (
    <View style={{ marginBottom: BOSLUK.m }}>
      <Text style={styles.label}>{label}</Text>
      {items.length === 0 ? (
        <View style={styles.bos}>
          <Text style={styles.bosMetin}>{bosMesaj ?? 'Liste boş'}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.satir}>
          {altinaIzin && (
            <TouchableRipple
              onPress={() => onSelect(null)}
              style={[styles.cip, selectedId == null && styles.cipAktif]}
              borderless
            >
              <Text style={[styles.cipMetin, selectedId == null && styles.cipMetinAktif]}>Atanmasın</Text>
            </TouchableRipple>
          )}
          {items.map((it) => {
            const aktif = selectedId === it.id;
            return (
              <TouchableRipple
                key={it.id}
                onPress={() => onSelect(it.id)}
                style={[styles.cip, aktif && styles.cipAktif]}
                borderless
              >
                <View>
                  <Text style={[styles.cipMetin, aktif && styles.cipMetinAktif]}>{it.baslik}</Text>
                  {it.altSatir ? (
                    <Text style={[styles.cipAlt, aktif && styles.cipAltAktif]}>{it.altSatir}</Text>
                  ) : null}
                </View>
              </TouchableRipple>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, marginBottom: BOSLUK.xs, letterSpacing: 0.5 },
  satir: { gap: BOSLUK.s, paddingVertical: BOSLUK.xs },
  cip: {
    paddingVertical: BOSLUK.s,
    paddingHorizontal: BOSLUK.l,
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.l,
    borderWidth: 1,
    borderColor: RENK.cizgi,
    minWidth: 100,
  },
  cipAktif: { backgroundColor: RENK.primary, borderColor: RENK.primary },
  cipMetin: { fontSize: PUNTO.kucuk, color: RENK.notr, fontWeight: '600' },
  cipMetinAktif: { color: '#FFFFFF' },
  cipAlt: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, marginTop: 2 },
  cipAltAktif: { color: '#E8F5E9' },
  bos: {
    padding: BOSLUK.l,
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  bosMetin: { color: RENK.ikincilMetin, fontSize: PUNTO.kucuk },
});
