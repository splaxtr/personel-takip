import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BOSLUK, PUNTO, RENK } from '../theme';

const ALTIN = '#A88B2C';

export function HosGeldinSplash() {
  return (
    <View style={styles.tam}>
      <View style={styles.kap}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.hosGeldin}>Hoş geldin,</Text>
        <Text style={styles.ad}>SAMET GÖKMEN</Text>

        <View style={styles.suslu}>
          <View style={styles.cizgi} />
          <Text style={styles.elmas}>◆</Text>
          <View style={styles.cizgi} />
        </View>

        <Text style={styles.ithaf}>
          Bu uygulama,{'\n'}özenle ve saygıyla{'\n'}
          <Text style={styles.ithafVurgu}>yalnızca senin için</Text>{'\n'}tasarlandı.
        </Text>
      </View>

      <View style={styles.altKap}>
        <View style={styles.altCizgi} />
        <Text style={styles.markaUst}>GÖKMEN İNŞAAT</Text>
        <Text style={styles.surum}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tam: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: BOSLUK.xl,
    paddingTop: BOSLUK.xxl * 2,
    paddingBottom: BOSLUK.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: BOSLUK.xl,
  },
  hosGeldin: {
    fontSize: PUNTO.govde,
    color: RENK.ikincilMetin,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: BOSLUK.s,
  },
  ad: {
    fontSize: 30,
    fontWeight: '800',
    color: RENK.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: BOSLUK.l,
  },
  suslu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    marginBottom: BOSLUK.l,
  },
  cizgi: {
    flex: 1,
    height: 1,
    backgroundColor: ALTIN,
    opacity: 0.6,
  },
  elmas: {
    color: ALTIN,
    fontSize: 14,
    paddingHorizontal: BOSLUK.m,
  },
  ithaf: {
    fontSize: PUNTO.govde,
    color: RENK.notr,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  ithafVurgu: {
    color: RENK.primary,
    fontWeight: '700',
    fontStyle: 'normal',
  },
  altKap: {
    alignItems: 'center',
    width: '100%',
  },
  altCizgi: {
    width: 60,
    height: 2,
    backgroundColor: ALTIN,
    marginBottom: BOSLUK.m,
  },
  markaUst: {
    fontSize: PUNTO.kucuk,
    color: RENK.primary,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: BOSLUK.xs,
  },
  surum: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    letterSpacing: 1,
  },
});
