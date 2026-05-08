import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatTarih, isoTarihten, tarihtenIso } from '../lib/tarih';
import { BOSLUK, PUNTO, RENK } from '../theme';

type Props = {
  label: string;
  value: string; // ISO yyyy-MM-dd
  onChange: (v: string) => void;
};

export function TarihSecici({ label, value, onChange }: Props) {
  const [acik, setAcik] = useState(false);

  return (
    <View style={{ marginBottom: BOSLUK.m }}>
      <Text style={{ fontSize: PUNTO.detay, color: RENK.ikincilMetin, marginBottom: BOSLUK.xs }}>
        {label}
      </Text>
      <Button
        mode="outlined"
        onPress={() => setAcik(true)}
        icon="calendar"
        contentStyle={{ paddingVertical: BOSLUK.xs }}
      >
        {formatTarih(value)}
      </Button>
      {acik && (
        <DateTimePicker
          value={tarihtenIso(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, d) => {
            setAcik(Platform.OS === 'ios');
            if (d) onChange(isoTarihten(d));
          }}
        />
      )}
    </View>
  );
}
