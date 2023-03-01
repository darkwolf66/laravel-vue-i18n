"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const loader_1 = require("./loader");
function i18n(langPath = 'lang') {
    let files = [];
    let exitHandlersBound = false;
    const clean = () => {
        files.forEach((file) => (0, fs_1.unlinkSync)(file.path));
        files = [];
    };
    return {
        name: 'i18n',
        enforce: 'post',
        config(config) {
            if (!(0, loader_1.hasPhpTranslations)(langPath)) {
                return;
            }
            files = (0, loader_1.parseAll)(langPath);
            /** @ts-ignore */
            process.env.VITE_LARAVEL_VUE_I18N_HAS_PHP = true;
            return {
                define: {
                    'process.env.LARAVEL_VUE_I18N_HAS_PHP': true
                }
            };
        },
        buildEnd: clean,
        handleHotUpdate(ctx) {
            if (/lang\/.*\.php$/.test(ctx.file)) {
                files = (0, loader_1.parseAll)(langPath);
            }
        },
        configureServer(server) {
            if (exitHandlersBound) {
                return;
            }
            process.on('exit', clean);
            process.on('SIGINT', process.exit);
            process.on('SIGTERM', process.exit);
            process.on('SIGHUP', process.exit);
            exitHandlersBound = true;
        }
    };
}
exports.default = i18n;
//# sourceMappingURL=vite.js.map