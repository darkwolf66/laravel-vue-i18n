import { Plugin, ComputedRef } from 'vue';
import { OptionsInterface } from './interfaces/options';
import { LanguageInterface } from './interfaces/language';
import { LanguageJsonFileInterface } from './interfaces/language-json-file';
import { ReplacementsInterface } from './interfaces/replacements';
/**
 * Checks if the language is loaded.
 */
export declare function isLoaded(lang?: string): boolean;
/**
 * Loads the language file.
 */
export declare function loadLanguageAsync(lang: string, dashLangTry?: boolean): Promise<string | void>;
/**
 * Get the translation for the given key.
 */
export declare function trans(key: string, replacements?: ReplacementsInterface): string;
/**
 * Get the translation for the given key and watch for any changes.
 */
export declare function wTrans(key: string, replacements?: ReplacementsInterface): ComputedRef<string>;
/**
 * Translates the given message based on a count.
 */
export declare function transChoice(key: string, number: number, replacements?: ReplacementsInterface): string;
/**
 * Translates the given message based on a count and watch for changes.
 */
export declare function wTransChoice(key: string, number: number, replacements?: ReplacementsInterface): ComputedRef<string>;
/**
 * Returns the current active language.
 */
export declare function getActiveLanguage(): string;
/**
 * Resets all the data stored in memory.
 */
export declare const reset: () => void;
/**
 * Alias to `transChoice` to mimic the same function name from Laravel Framework.
 */
export declare const trans_choice: typeof transChoice;
/**
 * The Vue Plugin. to be used on your Vue app like this: `app.use(i18nVue)`
 */
export declare const i18nVue: Plugin;
/**
 * The I18n class. Encapsulates all language loading and translation logic.
 */
export declare class I18n {
    /**
     * Stores the loaded languages.
     */
    private static loaded;
    private options;
    private activeMessages;
    private abortController;
    /**
     * Creates a new instance of the I18n class, applying default options
     */
    constructor(options?: OptionsInterface);
    /**
     * Sets options on the instance, preserving any values not present in new options
     */
    setOptions(options?: OptionsInterface, forceLoad?: boolean): I18n;
    /**
     * Loads the language.
     */
    load(): void;
    /**
     * Loads the language async.
     */
    loadLanguage(lang: string, dashLangTry?: boolean): void;
    /**
     * Loads the language file.
     */
    loadLanguageAsync(lang: string, dashLangTry?: boolean, ignoreAbort?: boolean): Promise<string | void>;
    /**
     * Resolves the language file or data, from direct data, synchronously.
     */
    resolveLang(callable: Function, lang: string, data?: {
        [key: string]: string;
    }): LanguageJsonFileInterface;
    /**
     * It resolves the language file or data, from direct data, require or Promise.
     */
    resolveLangAsync(callable: Function, lang: string): Promise<LanguageJsonFileInterface>;
    /**
     * Applies the language data and saves it to the loaded storage.
     */
    applyLanguage(lang: string, messages: {
        [key: string]: string;
    }, dashLangTry: boolean, callable: Function): string;
    /**
     * Sets the language messages to the activeMessages.
     */
    setLanguage({ lang, messages }: LanguageInterface): string;
    /**
     * Returns the current active language.
     */
    getActiveLanguage(): string;
    /**
     * Checks if the language is loaded.
     */
    isLoaded(lang?: string): boolean;
    /**
     * Get the translation for the given key.
     */
    trans(key: string, replacements?: ReplacementsInterface): string;
    /**
     * Get the translation for the given key and watch for any changes.
     */
    wTrans(key: string, replacements?: ReplacementsInterface): ComputedRef<string>;
    /**
     * Translates the given message based on a count.
     */
    transChoice(key: string, number: number, replacements?: ReplacementsInterface): string;
    /**
     * Translates the given message based on a count and watch for changes.
     */
    wTransChoice(key: string, number: number, replacements?: ReplacementsInterface): ComputedRef<string>;
    /**
     * Make the place-holder replacements on a line.
     */
    makeReplacements(message: string, replacements?: ReplacementsInterface): string;
    /**
     * Resets all the data stored in memory.
     */
    reset: () => void;
    /**
     * Gets the shared I18n instance, instantiating it if not yet created
     */
    static getSharedInstance(options?: OptionsInterface, forceLoad?: boolean): I18n;
}
