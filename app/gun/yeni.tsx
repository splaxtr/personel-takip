import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Snackbar, Text, TextInput, TouchableRipple } from 'react-native-paper';
import { ParaInput } from '../../src/components/ParaInput';
import { TarihSecici } from '../../src/components/TarihSecici';
import { InlineSecici } from '../../src/components/InlineSecici';
import { personelDao } from '../../src/db/dao/personel';
import { isDao } from '../../src/db/dao/is';
import { calismaGunuDao } from '../../src/db/dao/calismaGunu';
import { formatPara, parsePara } from '../../src/lib/para';
import { bugun } from '../../src/lib/tarih';
import { useStore } from '../../src/store/useStore';
import { BOSLUK, PUNTO, RADIUS, RENK } from '../../src/theme';

type Secim = { personel_id: number; ad: string; ucret: string };

export default function YeniGunEkrani() {
  const router = useRouter();
  const { personelId, isId, duzenleId } = useLocalSearchParams<{
    personelId?: string;
    isId?: string;
    duzenleId?: string;
  }>();
  const refresh = useStore((s) => s.refresh);

  const mevcut = duzenleId ? calismaGunuDao.bul(Number(duzenleId)) : null;
  const duzenleMod = !!mevcut;
  const personeller = personelDao.liste();
  const isler = isDao.hepsi();

  // Düzenleme modunda tek personel; yeni modunda çoklu seçim.
  const [secPersoneller, setSecPersoneller] = useState<Secim[]>(() => {
    if (mevcut) {
      const p = personelDao.bul(mevcut.personel_id);
      return p ? [{ personel_id: p.id, ad: p.ad, ucret: String(mevcut.gunluk_ucret) }] : [];
    }
    if (personelId) {
      const p = personelDao.bul(Number(personelId));
      return p ? [{ personel_id: p.id, ad: p.ad, ucret: String(p.gunluk_ucret) }] : [];
    }
    return [];
  });

  const [secIs, setSecIs] = useState<number | null>(mevcut?.is_id ?? (isId ? Number(isId) : null));
  const [tarih, setTarih] = useState(mevcut?.tarih ?? bugun());
  const [notlar, setNotlar] = useState(mevcut?.notlar ?? '');
  const [hata, setHata] = useState<string | null>(null);

  function togglePersonel(pid: number) {
    if (duzenleMod) {
      const p = personelDao.bul(pid);
      if (p) setSecPersoneller([{ personel_id: p.id, ad: p.ad, ucret: String(p.gunluk_ucret) }]);
      return;
    }
    setSecPersoneller((mevcut) => {
      const idx = mevcut.findIndex((x) => x.personel_id === pid);
      if (idx >= 0) {
        return mevcut.filter((x) => x.personel_id !== pid);
      }
      const p = personelDao.bul(pid);
      if (!p) return mevcut;
      return [...mevcut, { personel_id: p.id, ad: p.ad, ucret: String(p.gunluk_ucret) }];
    });
  }

  function ucretGuncelle(pid: number, deger: string) {
    setSecPersoneller((mevcut) =>
      mevcut.map((x) => (x.personel_id === pid ? { ...x, ucret: deger.replace(/[^0-9.,]/g, '') } : x))
    );
  }

  function kaydet() {
    if (secPersoneller.length === 0) return setHata('En az bir personel seç');
    for (const s of secPersoneller) {
      const u = parsePara(s.ucret);
      if (u <= 0) return setHata(`${s.ad} için ücret gerekli`);
    }

    if (mevcut) {
      const tek = secPersoneller[0];
      calismaGunuDao.guncelle(mevcut.id, {
        personel_id: tek.personel_id,
        is_id: secIs,
        tarih,
        gunluk_ucret: parsePara(tek.ucret),
        notlar: notlar.trim() || null,
      });
    } else {
      for (const s of secPersoneller) {
        calismaGunuDao.ekle({
          personel_id: s.personel_id,
          is_id: secIs,
          tarih,
          gunluk_ucret: parsePara(s.ucret),
          notlar: notlar.trim() || null,
        });
      }
    }
    refresh();
    router.back();
  }

  const toplam = secPersoneller.reduce((acc, s) => acc + parsePara(s.ucret), 0);

  return (
    <>
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <Text style={styles.bolum}>{duzenleMod ? 'PERSONEL' : 'PERSONELLER (çoklu)'}</Text>
        {personeller.length === 0 ? (
          <View style={styles.bos}>
            <Text style={styles.bosMetin}>Önce personel ekle</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cipKap}>
            {personeller.map((p) => {
              const aktif = secPersoneller.some((x) => x.personel_id === p.id);
              return (
                <TouchableRipple
                  key={p.id}
                  onPress={() => togglePersonel(p.id)}
                  style={[styles.cip, aktif && styles.cipAktif]}
                  borderless
                >
                  <Text style={[styles.cipMetin, aktif && styles.cipMetinAktif]}>
                    {aktif ? '✓ ' : ''}
                    {p.ad}
                  </Text>
                </TouchableRipple>
              );
            })}
          </ScrollView>
        )}

        {secPersoneller.length > 0 && (
          <View style={styles.secimKap}>
            <Text style={styles.altBaslik}>SEÇİLEN PERSONELLER & ÜCRET</Text>
            {secPersoneller.map((s) => (
              <View key={s.personel_id} style={styles.satir}>
                <Text style={styles.satirAd}>{s.ad}</Text>
                <View style={{ flex: 1, marginLeft: BOSLUK.s }}>
                  <ParaInput
                    label="Bu günün ücreti"
                    value={s.ucret}
                    onChangeText={(v) => ucretGuncelle(s.personel_id, v)}
                  />
                </View>
              </View>
            ))}
            {!duzenleMod && secPersoneller.length > 1 && (
              <Text style={styles.toplam}>Toplam maliyet: {formatPara(toplam)}</Text>
            )}
          </View>
        )}

        <InlineSecici
          label="İŞ (isteğe bağlı)"
          items={isler.map((i) => ({ id: i.id, baslik: i.baslik }))}
          selectedId={secIs}
          onSelect={(id) => setSecIs(id)}
          altinaIzin
          bosMesaj="Atanacak iş yok"
        />

        <TarihSecici label="TARİH" value={tarih} onChange={setTarih} />

        <TextInput
          label="Notlar (hepsine uygulanır)"
          value={notlar}
          onChangeText={setNotlar}
          mode="outlined"
          multiline
          style={{ marginBottom: BOSLUK.m, backgroundColor: RENK.kart }}
        />

        <Button mode="contained" icon="content-save" onPress={kaydet} contentStyle={{ paddingVertical: BOSLUK.s }}>
          {!duzenleMod && secPersoneller.length > 1
            ? `${secPersoneller.length} personel için kaydet`
            : 'Kaydet'}
        </Button>
        <Text style={styles.ipucu}>
          İpucu: ücret personelin varsayılanından farklı olabilir — bu gün için sabitlenir.
        </Text>
      </ScrollView>
      <Snackbar visible={!!hata} onDismiss={() => setHata(null)} duration={2200}>
        {hata}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: BOSLUK.m, paddingBottom: BOSLUK.xxl },
  bolum: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, letterSpacing: 0.8, marginBottom: BOSLUK.s },
  altBaslik: {
    fontSize: PUNTO.detay,
    color: RENK.ikincilMetin,
    letterSpacing: 0.8,
    marginTop: BOSLUK.s,
    marginBottom: BOSLUK.s,
  },
  cipKap: { gap: BOSLUK.s, paddingVertical: BOSLUK.xs, paddingRight: BOSLUK.s },
  cip: {
    paddingVertical: BOSLUK.s,
    paddingHorizontal: BOSLUK.l,
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.l,
    borderWidth: 1,
    borderColor: RENK.cizgi,
  },
  cipAktif: { backgroundColor: RENK.primary, borderColor: RENK.primary },
  cipMetin: { fontSize: PUNTO.kucuk, color: RENK.notr, fontWeight: '600' },
  cipMetinAktif: { color: '#FFFFFF' },
  bos: {
    padding: BOSLUK.l,
    backgroundColor: RENK.kart,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: RENK.cizgi,
    marginBottom: BOSLUK.m,
  },
  bosMetin: { color: RENK.ikincilMetin, fontSize: PUNTO.kucuk },
  secimKap: {
    marginTop: BOSLUK.m,
    marginBottom: BOSLUK.m,
    padding: BOSLUK.m,
    backgroundColor: RENK.vurguArkaplan,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: RENK.primaryAcik,
  },
  satir: { flexDirection: 'row', alignItems: 'center', marginBottom: BOSLUK.xs },
  satirAd: { fontSize: PUNTO.govde, color: RENK.notr, fontWeight: '600', minWidth: 90, paddingTop: BOSLUK.l },
  toplam: {
    marginTop: BOSLUK.s,
    fontSize: PUNTO.kucuk,
    color: RENK.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  ipucu: { fontSize: PUNTO.detay, color: RENK.ikincilMetin, textAlign: 'center', marginTop: BOSLUK.m },
});
