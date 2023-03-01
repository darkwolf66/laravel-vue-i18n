"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasPhpTranslations = void 0;
function hasPhpTranslations(isServer) {
  return isServer || checkProcessEnv() || checkImportMeta();
}
exports.hasPhpTranslations = hasPhpTranslations;
function checkProcessEnv() {
  var _a;
  return typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.LARAVEL_VUE_I18N_HAS_PHP) ? true : false;
}
function checkImportMeta() {
  /** @ts-ignore */
  return typeof {
    ...Object.fromEntries(Object.entries(process.env).filter(([k]) => /^VITE_/.test(k))),
    NODE_ENV: process.env.NODE_ENV || 'test',
    MODE: process.env.NODE_ENV || 'test',
    BASE_URL: '/',
    DEV: process.env.NODE_ENV !== 'production',
    PROD: process.env.NODE_ENV === 'production'
  } !== 'undefined' && /** @ts-ignore */process.env.VITE_LARAVEL_VUE_I18N_HAS_PHP ? true : false;
}
