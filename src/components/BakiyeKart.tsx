import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { formatPara } from '../lib/para';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../theme';

type Props = {
  baslik: string;
  tutar: number;
  altSatir?: string;
  renk?: 'borc' | 'alacak' | 'notr';
};

export function BakiyeKart({ baslik, tutar, altSatir, renk = 'notr' }: Props) {
  const tutarRengi = renk === 'borc' ? RENK.borc : renk === 'alacak' ? RENK.alacak : RENK.notr;
  return (
    <View style={styles.kart}>
      <Text style={styles.baslik}>{baslik}</Text>
      <Text style={[styles.tutar, { color: tutarRengi }]}>{formatPara(tutar)}</Text>
      {altSatir ? <Text style={styles.alt}>{altSatir}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kart: {
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.l,
    padding: BOSLUK.l,
    marginBottom: BOSLUK.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  baslik: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tutar: {
    fontSize: PUNTO.devasa,
    fontWeight: '700',
    marginTop: BOSLUK.xs,
  },
  alt: {
    marginTop: BOSLUK.s,
    fontSize: PUNTO.kucuk,
    color: RENK.ikincilMetin,
  },
});
