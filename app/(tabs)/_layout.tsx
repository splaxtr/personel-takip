import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RENK } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: RENK.primary,
        tabBarInactiveTintColor: RENK.ikincilMetin,
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: { backgroundColor: RENK.kart },
        headerTitleStyle: { fontSize: 20, fontWeight: '600' },
        headerTintColor: RENK.notr,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Özet',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="personeller"
        options={{
          title: 'Personeller',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-hard-hat" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="musteriler"
        options={{
          title: 'Müşteriler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
