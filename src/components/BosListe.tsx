import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BOSLUK, PUNTO, RENK } from '../theme';

export function BosListe({ mesaj }: { mesaj: string }) {
  return (
    <View style={styles.kap}>
      <Text style={styles.metin}>{mesaj}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: BOSLUK.xl,
  },
  metin: {
    fontSize: PUNTO.govde,
    color: RENK.ikincilMetin,
    textAlign: 'center',
  },
});
