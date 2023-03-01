"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readThroughDir = exports.reset = exports.parse = exports.parseAll = exports.hasPhpTranslations = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const php_parser_1 = require("php-parser");
const hasPhpTranslations = (folderPath) => {
    folderPath = folderPath.replace(/[\\/]$/, '') + path_1.default.sep;
    try {
        const folders = fs_1.default
            .readdirSync(folderPath)
            .filter((file) => fs_1.default.statSync(folderPath + path_1.default.sep + file).isDirectory())
            .sort();
        for (const folder of folders) {
            const lang = {};
            const files = fs_1.default.readdirSync(folderPath + path_1.default.sep + folder).filter((file) => /\.php$/.test(file));
            if (files.length > 0) {
                return true;
            }
        }
    }
    catch (e) { }
    return false;
};
exports.hasPhpTranslations = hasPhpTranslations;
const parseAll = (folderPath) => {
    folderPath = folderPath.replace(/[\\/]$/, '') + path_1.default.sep;
    const folders = fs_1.default
        .readdirSync(folderPath)
        .filter((file) => fs_1.default.statSync(folderPath + path_1.default.sep + file).isDirectory())
        .sort();
    const data = [];
    for (const folder of folders) {
        const langFolderPath = folderPath + path_1.default.sep + folder;
        const lang = (0, exports.readThroughDir)(langFolderPath);
        data.push({
            folder,
            translations: convertToDotsSyntax(lang)
        });
    }
    return data
        .filter(({ translations }) => {
        return Object.keys(translations).length > 0;
    })
        .map(({ folder, translations }) => {
        const name = `php_${folder}.json`;
        const path = folderPath + name;
        fs_1.default.writeFileSync(path, JSON.stringify(translations));
        return { name, path };
    });
};
exports.parseAll = parseAll;
const parse = (content) => {
    var _a;
    const arr = new php_parser_1.Engine({}).parseCode(content, 'lang').children.filter((child) => child.kind === 'return')[0];
    if (((_a = arr === null || arr === void 0 ? void 0 : arr.expr) === null || _a === void 0 ? void 0 : _a.kind) !== 'array') {
        return {};
    }
    return convertToDotsSyntax(parseItem(arr.expr));
};
exports.parse = parse;
const parseItem = (expr) => {
    if (expr.kind === 'string') {
        return expr.value;
    }
    if (expr.kind === 'array') {
        let items = expr.items.map((item) => parseItem(item));
        if (expr.items.every((item) => item.key !== null)) {
            items = items.reduce((acc, val) => Object.assign({}, acc, val), {});
        }
        return items;
    }
    if (expr.kind === 'bin') {
        return parseItem(expr.left) + parseItem(expr.right);
    }
    if (expr.key) {
        return { [expr.key.value]: parseItem(expr.value) };
    }
    return parseItem(expr.value);
};
const convertToDotsSyntax = (list) => {
    const flatten = (items, context = '') => {
        const data = {};
        Object.entries(items).forEach(([key, value]) => {
            if (typeof value === 'string') {
                data[context + key] = value;
                return;
            }
            Object.entries(flatten(value, context + key + '.')).forEach(([itemKey, itemValue]) => {
                data[itemKey] = itemValue;
            });
        });
        return data;
    };
    return flatten(list);
};
const reset = (folderPath) => {
    const dir = fs_1.default.readdirSync(folderPath);
    dir
        .filter((file) => file.match(/^php_/))
        .forEach((file) => {
        fs_1.default.unlinkSync(folderPath + file);
    });
};
exports.reset = reset;
const readThroughDir = (dir) => {
    const data = {};
    fs_1.default.readdirSync(dir)
        .forEach((file) => {
        const absoluteFile = dir + path_1.default.sep + file;
        if (fs_1.default.statSync(absoluteFile).isDirectory()) {
            const subFolderFileKey = file.replace(/\.\w+$/, '');
            data[subFolderFileKey] = (0, exports.readThroughDir)(absoluteFile);
        }
        else {
            data[file.replace(/\.\w+$/, '')] = (0, exports.parse)(fs_1.default.readFileSync(absoluteFile).toString());
        }
    });
    return data;
};
exports.readThroughDir = readThroughDir;
//# sourceMappingURL=loader.js.map