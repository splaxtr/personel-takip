import * as SQLite from 'expo-sqlite';

const DB_ADI = 'personel-takip.db';
const SEMA_VERSIYON = 1;

let _db: SQLite.SQLiteDatabase | null = null;

export function db(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_ADI);
    _db.execSync('PRAGMA foreign_keys = ON;');
    migrasyonCalistir(_db);
  }
  return _db;
}

export function dbSifirla() {
  if (_db) {
    _db.closeSync();
    _db = null;
  }
}

function migrasyonCalistir(d: SQLite.SQLiteDatabase) {
  const sonuc = d.getFirstSync<{ user_version: number }>('PRAGMA user_version;');
  const mevcut = sonuc?.user_version ?? 0;

  if (mevcut < 1) {
    d.execSync(SEMA_V1);
    d.execSync(`PRAGMA user_version = 1;`);
  }
  // Gelecekte: if (mevcut < 2) { ... }
  void SEMA_VERSIYON;
}

const SEMA_V1 = `
CREATE TABLE IF NOT EXISTS personeller (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ad            TEXT NOT NULL,
  telefon       TEXT,
  gunluk_ucret  REAL NOT NULL,
  aktif         INTEGER NOT NULL DEFAULT 1,
  notlar        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS musteriler (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ad          TEXT NOT NULL,
  telefon     TEXT,
  adres       TEXT,
  notlar      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS isler (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  musteri_id        INTEGER NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
  baslik            TEXT NOT NULL,
  anlasilan_tutar   REAL NOT NULL,
  baslangic_tarihi  TEXT,
  durum             TEXT NOT NULL DEFAULT 'devam',
  notlar            TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_is_musteri ON isler(musteri_id);

CREATE TABLE IF NOT EXISTS calisma_gunleri (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  personel_id   INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
  is_id         INTEGER REFERENCES isler(id) ON DELETE SET NULL,
  tarih         TEXT NOT NULL,
  gunluk_ucret  REAL NOT NULL,
  notlar        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_calisma_personel ON calisma_gunleri(personel_id);
CREATE INDEX IF NOT EXISTS idx_calisma_is ON calisma_gunleri(is_id);
CREATE INDEX IF NOT EXISTS idx_calisma_tarih ON calisma_gunleri(tarih);

CREATE TABLE IF NOT EXISTS personel_odemeleri (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  personel_id   INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
  tutar         REAL NOT NULL,
  tarih         TEXT NOT NULL,
  notlar        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_odeme_personel ON personel_odemeleri(personel_id);

CREATE TABLE IF NOT EXISTS musteri_tahsilatlari (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  is_id       INTEGER NOT NULL REFERENCES isler(id) ON DELETE CASCADE,
  tutar       REAL NOT NULL,
  tarih       TEXT NOT NULL,
  notlar      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tahsilat_is ON musteri_tahsilatlari(is_id);

CREATE VIEW IF NOT EXISTS v_personel_bakiye AS
SELECT
  p.id,
  p.ad,
  COALESCE((SELECT SUM(gunluk_ucret) FROM calisma_gunleri WHERE personel_id = p.id), 0) AS hak_edilen,
  COALESCE((SELECT SUM(tutar) FROM personel_odemeleri WHERE personel_id = p.id), 0) AS odenen,
  COALESCE((SELECT SUM(gunluk_ucret) FROM calisma_gunleri WHERE personel_id = p.id), 0)
    - COALESCE((SELECT SUM(tutar) FROM personel_odemeleri WHERE personel_id = p.id), 0) AS kalan
FROM personeller p;

CREATE VIEW IF NOT EXISTS v_is_bakiye AS
SELECT
  i.id,
  i.musteri_id,
  i.baslik,
  i.anlasilan_tutar,
  COALESCE((SELECT SUM(tutar) FROM musteri_tahsilatlari WHERE is_id = i.id), 0) AS tahsil_edilen,
  i.anlasilan_tutar
    - COALESCE((SELECT SUM(tutar) FROM musteri_tahsilatlari WHERE is_id = i.id), 0) AS kalan
FROM isler i;
`;
