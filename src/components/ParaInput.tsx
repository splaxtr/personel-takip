import React from 'react';
import { TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  hata?: boolean;
};

export function ParaInput({ label, value, onChangeText, hata }: Props) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={(t) => onChangeText(t.replace(/[^0-9.,]/g, ''))}
      keyboardType="decimal-pad"
      mode="outlined"
      right={<TextInput.Affix text="₺" />}
      error={hata}
      style={{ marginBottom: 12 }}
    />
  );
}
