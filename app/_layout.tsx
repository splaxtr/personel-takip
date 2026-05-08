import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { paperTheme, RENK } from '../src/theme';
import { db } from '../src/db/client';
import { HosGeldinSplash } from '../src/components/HosGeldinSplash';

// İlk açılışta DB'yi başlat (singleton).
db();

const SPLASH_SURESI_MS = 1800;

export default function RootLayout() {
  const [splashGoster, setSplashGoster] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplashGoster(false), SPLASH_SURESI_MS);
    return () => clearTimeout(t);
  }, []);

  if (splashGoster) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <HosGeldinSplash />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="dark" backgroundColor={RENK.kart} />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: RENK.kart },
              headerTitleStyle: { fontSize: 20, fontWeight: '600' },
              headerTintColor: RENK.notr,
              contentStyle: { backgroundColor: RENK.arkaplan },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="personel/yeni" options={{ title: 'Yeni Personel', presentation: 'modal' }} />
            <Stack.Screen name="personel/[id]" options={{ title: 'Personel' }} />
            <Stack.Screen name="musteri/yeni" options={{ title: 'Yeni Müşteri', presentation: 'modal' }} />
            <Stack.Screen name="musteri/[id]" options={{ title: 'Müşteri' }} />
            <Stack.Screen name="is/yeni" options={{ title: 'Yeni İş', presentation: 'modal' }} />
            <Stack.Screen name="is/[id]" options={{ title: 'İş' }} />
            <Stack.Screen name="gun/yeni" options={{ title: 'Çalışma Günü Ekle', presentation: 'modal' }} />
            <Stack.Screen name="odeme/yeni" options={{ title: 'Ödeme Yap', presentation: 'modal' }} />
            <Stack.Screen name="tahsilat/yeni" options={{ title: 'Tahsilat Al', presentation: 'modal' }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
