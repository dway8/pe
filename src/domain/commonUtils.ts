import { Iconv } from "iconv";

export function filetypeFromExtension(extension) {
    let filetype;
    switch (extension) {
        case ".jpg":
        case ".jpeg":
        case ".png":
        case ".gif":
            filetype = "image";
            break;
        case ".pdf":
            filetype = "pdf";
            break;
        default:
            filetype = "other";
    }
    return filetype;
}

export function filetypeToExtension(filetype) {
    let extension;
    switch (filetype) {
        case "image/jpeg":
            extension = ".jpg";
            break;
        case "image/png":
            extension = ".png";
            break;
        case "image/gif":
            filetype = ".gif";
            break;
        case "application/pdf":
            extension = ".pdf";
            break;
        default:
            filetype = "";
    }
    return extension;
}

export function copyDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function notNil(data) {
    return typeof data !== "undefined" && data !== null;
}

export function keepUnique(list) {
    const newList = list.filter((v, i, a) => a.indexOf(v) === i);

    return newList;
}

export function uuid(a?: any, b?: any): string {
    const doStuff = (a) => 8 ^ (Math.random() * (a ^ 20 ? 16 : 4));
    for (
        b = a = "";
        a++ < 36;
        b += (a * 51) & 52 ? (a ^ 15 ? doStuff(a) : 4).toString(16) : "-"
    ) {
        //
    }
    return b;
}

function filenameToAsciiAndUtf8(file) {
    const filename = file.replace(",", "");
    const utf8toASCII = new Iconv("UTF-8", "ASCII//TRANSLIT//IGNORE");
    const filenameASCII = utf8toASCII.convert(filename);
    const filenameUTF8 = encodeURIComponent(filename.replace("'", ""));
    return { filenameASCII, filenameUTF8 };
}

export function sanitizeFilenameForContentDisposition(file) {
    const { filenameASCII, filenameUTF8 } = filenameToAsciiAndUtf8(file);

    const filenameNormal = `filename=${filenameASCII}`;
    const filenameStar = `filename*=UTF-8''${filenameUTF8}`;

    const filenames = `${filenameNormal}; ${filenameStar}`;

    return filenames;
}
