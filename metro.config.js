const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite'ın web sürümü .wasm import ediyor; Metro varsayılan olarak
// .wasm'i asset olarak görmediği için web bundling'de hata veriyor.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;
