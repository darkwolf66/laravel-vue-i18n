"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18n = exports.i18nVue = exports.trans_choice = exports.reset = exports.getActiveLanguage = exports.wTransChoice = exports.transChoice = exports.wTrans = exports.trans = exports.loadLanguageAsync = exports.isLoaded = void 0;
const vue_1 = require("vue");
const pluralization_1 = require("./pluralization");
const avoid_exceptions_1 = require("./utils/avoid-exceptions");
const has_php_translations_1 = require("./utils/has-php-translations");
const isServer = typeof window === 'undefined';
/**
 * Stores the shared i18n class instance
 */
let sharedInstance = null;
/**
 * The default options, for the I18n class
 */
const DEFAULT_OPTIONS = {
    lang: !isServer && document.documentElement.lang ? document.documentElement.lang.replace('-', '_') : null,
    fallbackLang: 'en',
    resolve: (lang) => new Promise((resolve) => resolve({ default: {} })),
    onLoad: (lang) => { }
};
/**
 * The default options, for the plugin.
 */
const DEFAULT_PLUGIN_OPTIONS = {
    shared: true
};
/**
 * Checks if the language is loaded.
 */
function isLoaded(lang) {
    return I18n.getSharedInstance().isLoaded(lang);
}
exports.isLoaded = isLoaded;
/**
 * Loads the language file.
 */
function loadLanguageAsync(lang, dashLangTry = false) {
    return I18n.getSharedInstance().loadLanguageAsync(lang, dashLangTry);
}
exports.loadLanguageAsync = loadLanguageAsync;
/**
 * Get the translation for the given key.
 */
function trans(key, replacements = {}) {
    return I18n.getSharedInstance().trans(key, replacements);
}
exports.trans = trans;
/**
 * Get the translation for the given key and watch for any changes.
 */
function wTrans(key, replacements = {}) {
    return I18n.getSharedInstance().wTrans(key, replacements);
}
exports.wTrans = wTrans;
/**
 * Translates the given message based on a count.
 */
function transChoice(key, number, replacements = {}) {
    return I18n.getSharedInstance().transChoice(key, number, replacements);
}
exports.transChoice = transChoice;
/**
 * Translates the given message based on a count and watch for changes.
 */
function wTransChoice(key, number, replacements = {}) {
    return I18n.getSharedInstance().wTransChoice(key, number, replacements);
}
exports.wTransChoice = wTransChoice;
/**
 * Returns the current active language.
 */
function getActiveLanguage() {
    return I18n.getSharedInstance().getActiveLanguage();
}
exports.getActiveLanguage = getActiveLanguage;
/**
 * Resets all the data stored in memory.
 */
const reset = () => {
    sharedInstance === null || sharedInstance === void 0 ? void 0 : sharedInstance.reset(); // avoid creating a shared instance here
};
exports.reset = reset;
/**
 * Alias to `transChoice` to mimic the same function name from Laravel Framework.
 */
exports.trans_choice = transChoice;
/**
 * The Vue Plugin. to be used on your Vue app like this: `app.use(i18nVue)`
 */
exports.i18nVue = {
    install(app, options = {}) {
        options = Object.assign(Object.assign({}, DEFAULT_PLUGIN_OPTIONS), options);
        const i18n = options.shared ? I18n.getSharedInstance(options, true) : new I18n(options);
        app.config.globalProperties.$t = (key, replacements) => i18n.trans(key, replacements);
        app.config.globalProperties.$tChoice = (key, number, replacements) => i18n.transChoice(key, number, replacements);
        app.provide('i18n', i18n);
    }
};
/**
 * The I18n class. Encapsulates all language loading and translation logic.
 */
class I18n {
    /**
     * Creates a new instance of the I18n class, applying default options
     */
    constructor(options = {}) {
        // Stores messages for the currently active language
        this.activeMessages = (0, vue_1.reactive)({});
        /**
         * Resets all the data stored in memory.
         */
        this.reset = () => {
            I18n.loaded = [];
            this.options = DEFAULT_OPTIONS;
            for (const [key] of Object.entries(this.activeMessages)) {
                this.activeMessages[key] = null;
            }
            if (this === sharedInstance) {
                sharedInstance = null;
            }
        };
        this.options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.load();
    }
    /**
     * Sets options on the instance, preserving any values not present in new options
     */
    setOptions(options = {}, forceLoad = false) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        if (forceLoad) {
            this.load();
        }
        return this;
    }
    /**
     * Loads the language.
     */
    load() {
        this[isServer ? 'loadLanguage' : 'loadLanguageAsync'](this.getActiveLanguage());
    }
    /**
     * Loads the language async.
     */
    loadLanguage(lang, dashLangTry = false) {
        const loadedLang = I18n.loaded.find((row) => row.lang === lang);
        if (loadedLang) {
            this.setLanguage(loadedLang);
            return;
        }
        const { default: messages } = this.resolveLang(this.options.resolve, lang);
        this.applyLanguage(lang, messages, dashLangTry, this.loadLanguage);
    }
    /**
     * Loads the language file.
     */
    loadLanguageAsync(lang, dashLangTry = false, ignoreAbort = false) {
        var _a;
        if (!ignoreAbort) {
            (_a = this.abortController) === null || _a === void 0 ? void 0 : _a.abort();
            this.abortController = new AbortController();
        }
        const loadedLang = I18n.loaded.find((row) => row.lang === lang);
        if (loadedLang) {
            return Promise.resolve(this.setLanguage(loadedLang));
        }
        return new Promise((resolve, reject) => {
            this.abortController.signal.addEventListener('abort', () => {
                resolve();
            });
            this.resolveLangAsync(this.options.resolve, lang).then(({ default: messages }) => {
                resolve(this.applyLanguage(lang, messages, dashLangTry, this.loadLanguageAsync));
            });
        });
    }
    /**
     * Resolves the language file or data, from direct data, synchronously.
     */
    resolveLang(callable, lang, data = {}) {
        if (!Object.keys(data).length) {
            data = (0, avoid_exceptions_1.avoidException)(callable, lang);
        }
        if ((0, has_php_translations_1.hasPhpTranslations)(isServer)) {
            return {
                default: Object.assign(Object.assign({}, data), (0, avoid_exceptions_1.avoidException)(callable, `php_${lang}`))
            };
        }
        return { default: data };
    }
    /**
     * It resolves the language file or data, from direct data, require or Promise.
     */
    resolveLangAsync(callable, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = (0, avoid_exceptions_1.avoidException)(callable, lang);
            if (!(data instanceof Promise)) {
                return this.resolveLang(callable, lang, data);
            }
            if ((0, has_php_translations_1.hasPhpTranslations)(isServer)) {
                const phpLang = yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(callable(`php_${lang}`));
                const jsonLang = yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(data);
                return new Promise((resolve) => resolve({
                    default: Object.assign(Object.assign({}, phpLang), jsonLang)
                }));
            }
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                return resolve({
                    default: yield (0, avoid_exceptions_1.avoidExceptionOnPromise)(data)
                });
            }));
        });
    }
    /**
     * Applies the language data and saves it to the loaded storage.
     */
    applyLanguage(lang, messages, dashLangTry = false, callable) {
        if (Object.keys(messages).length < 1) {
            if (/[-_]/g.test(lang) && !dashLangTry) {
                return callable.call(this, lang.replace(/[-_]/g, (char) => (char === '-' ? '_' : '-')), true, true);
            }
            if (lang !== this.options.fallbackLang) {
                return callable.call(this, this.options.fallbackLang, false, true);
            }
        }
        const data = { lang, messages };
        I18n.loaded.push(data);
        return this.setLanguage(data);
    }
    /**
     * Sets the language messages to the activeMessages.
     */
    setLanguage({ lang, messages }) {
        if (!isServer) {
            // When setting the HTML lang attribute, hyphen must be use instead of underscore.
            document.documentElement.setAttribute('lang', lang.replace('_', '-'));
        }
        this.options.lang = lang;
        for (const [key, value] of Object.entries(messages)) {
            this.activeMessages[key] = value;
        }
        for (const [key] of Object.entries(this.activeMessages)) {
            if (!messages[key]) {
                this.activeMessages[key] = null;
            }
        }
        this.options.onLoad(lang);
        return lang;
    }
    /**
     * Returns the current active language.
     */
    getActiveLanguage() {
        return this.options.lang || this.options.fallbackLang;
    }
    /**
     * Checks if the language is loaded.
     */
    isLoaded(lang) {
        lang !== null && lang !== void 0 ? lang : (lang = this.getActiveLanguage());
        return I18n.loaded.some((row) => row.lang.replace(/[-_]/g, '-') === lang.replace(/[-_]/g, '-'));
    }
    /**
     * Get the translation for the given key.
     */
    trans(key, replacements = {}) {
        return this.wTrans(key, replacements).value;
    }
    /**
     * Get the translation for the given key and watch for any changes.
     */
    wTrans(key, replacements = {}) {
        if (!this.activeMessages[key] && !this.activeMessages[`${key}.0`]) {
            key = key.replace(/\//g, '.');
        }
        if (!this.activeMessages[key]) {
            const hasChildItems = this.activeMessages[`${key}.0`] !== undefined;
            if (hasChildItems) {
                const childItems = Object.entries(this.activeMessages)
                    .filter((item) => item[0].startsWith(`${key}.`))
                    .map((item) => item[1]);
                this.activeMessages[key] = (0, vue_1.reactive)(childItems);
            }
            else {
                if (key.startsWith(this.options.defaultKeyPrefix)) {
                    this.activeMessages[key] = key.replace(this.options.defaultKeyPrefix, '');
                }
                else {
                    this.activeMessages[key] = key;
                }
            }
        }
        return (0, vue_1.computed)(() => this.makeReplacements(this.activeMessages[key], replacements));
    }
    /**
     * Translates the given message based on a count.
     */
    transChoice(key, number, replacements = {}) {
        return this.wTransChoice(key, number, replacements).value;
    }
    /**
     * Translates the given message based on a count and watch for changes.
     */
    wTransChoice(key, number, replacements = {}) {
        const message = this.wTrans(key, replacements);
        replacements.count = number.toString();
        return (0, vue_1.computed)(() => this.makeReplacements((0, pluralization_1.choose)(message.value, number, this.options.lang), replacements));
    }
    /**
     * Make the place-holder replacements on a line.
     */
    makeReplacements(message, replacements) {
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        Object.entries(replacements || []).forEach(([key, value]) => {
            value = value.toString();
            message = message
                .replace(new RegExp(`:${key}`, 'g'), value)
                .replace(new RegExp(`:${key.toUpperCase()}`, 'g'), value.toUpperCase())
                .replace(new RegExp(`:${capitalize(key)}`, 'g'), capitalize(value));
        });
        return message;
    }
    /**
     * Gets the shared I18n instance, instantiating it if not yet created
     */
    static getSharedInstance(options, forceLoad = false) {
        return (sharedInstance === null || sharedInstance === void 0 ? void 0 : sharedInstance.setOptions(options, forceLoad)) || (sharedInstance = new I18n(options));
    }
}
exports.I18n = I18n;
/**
 * Stores the loaded languages.
 */
I18n.loaded = [];
