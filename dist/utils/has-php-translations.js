export function hasPhpTranslations(isServer) {
    return isServer || checkProcessEnv() || checkImportMeta();
}
function checkProcessEnv() {
    return typeof process !== 'undefined' && process.env?.LARAVEL_VUE_I18N_HAS_PHP ? true : false;
}
function checkImportMeta() {
    /** @ts-ignore */
    return typeof import.meta.env !== 'undefined' &&
        /** @ts-ignore */
        import.meta.env.VITE_LARAVEL_VUE_I18N_HAS_PHP
        ? true
        : false;
}
