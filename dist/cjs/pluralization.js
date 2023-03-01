"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.choose = void 0;
const get_plural_index_1 = require("./utils/get-plural-index");
/**
 * Select a proper translation string based on the given number.
 */
function choose(message, number, lang) {
    let segments = message.split('|');
    const extracted = extract(segments, number);
    if (extracted !== null) {
        return extracted.trim();
    }
    segments = stripConditions(segments);
    const pluralIndex = (0, get_plural_index_1.getPluralIndex)(lang, number);
    if (segments.length === 1 || !segments[pluralIndex]) {
        return segments[0];
    }
    return segments[pluralIndex];
}
exports.choose = choose;
/**
 * Extract a translation string using inline conditions.
 */
function extract(segments, number) {
    for (const part of segments) {
        let line = extractFromString(part, number);
        if (line !== null) {
            return line;
        }
    }
    return null;
}
/**
 * Get the translation string if the condition matches.
 */
function extractFromString(part, number) {
    const matches = part.match(/^[\{\[]([^\[\]\{\}]*)[\}\]](.*)/s) || [];
    if (matches.length !== 3) {
        return null;
    }
    const condition = matches[1];
    const value = matches[2];
    if (condition.includes(',')) {
        let [from, to] = condition.split(',');
        if (to === '*' && number >= parseFloat(from)) {
            return value;
        }
        else if (from === '*' && number <= parseFloat(to)) {
            return value;
        }
        else if (number >= parseFloat(from) && number <= parseFloat(to)) {
            return value;
        }
    }
    return parseFloat(condition) === number ? value : null;
}
/**
 * Strip the inline conditions from each segment, just leaving the text.
 */
function stripConditions(segments) {
    return segments.map((part) => part.replace(/^[\{\[]([^\[\]\{\}]*)[\}\]]/, ''));
}
