"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const laravel_mix_1 = __importDefault(require("laravel-mix"));
const Component_1 = require("laravel-mix/src/components/Component");
const webpack_1 = require("webpack");
const loader_1 = require("./loader");
class BeforeBuildPlugin {
    constructor(callback) {
        this.callback = callback;
    }
    apply(compiler) {
        compiler.hooks.compile.tap('BeforeBuildPlugin', this.callback);
    }
}
laravel_mix_1.default.extend('i18n', class extends Component_1.Component {
    register(langPath = 'lang') {
        this.langPath = this.context.paths.rootPath + path_1.default.sep + langPath;
    }
    webpackConfig(config) {
        let files = [];
        config.watchOptions = {
            ignored: /php.*\.json/
        };
        if ((0, loader_1.hasPhpTranslations)(this.langPath)) {
            config.plugins.push(new webpack_1.EnvironmentPlugin({
                LARAVEL_VUE_I18N_HAS_PHP: true
            }));
        }
        config.plugins.push(new BeforeBuildPlugin(() => {
            files = (0, loader_1.parseAll)(this.langPath);
        }));
        this.context.listen('build', () => {
            files.forEach((file) => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
        });
    }
});
//# sourceMappingURL=mix.js.map