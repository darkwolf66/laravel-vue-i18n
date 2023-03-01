import path from 'path';
export declare const hasPhpTranslations: (folderPath: string) => boolean;
export declare const parseAll: (folderPath: string) => {
    name: string;
    path: string;
}[];
export declare const parse: (content: string) => {};
export declare const reset: (folderPath: any) => void;
export declare const readThroughDir: (dir: any) => {};
