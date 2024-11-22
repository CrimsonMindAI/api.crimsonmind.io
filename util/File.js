import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import sharp from "sharp";

export const getMimeType = async (input) => {
    let ext;
    if (Buffer.isBuffer(input)) {
        const type = await fileTypeFromBuffer(input);
        if (!type) {
            throw new Error('Unsupported image type');
        }
        ext = `.${type.ext}`;
    } else {
        ext = path.extname(input).toLowerCase();
    }

    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.bmp':
            return 'image/bmp';
        case '.webp':
            return 'image/webp';
        default:
            throw new Error('Unsupported image type');
    }
}

export const isImage = async (input) => {
    let ext;
    if (Buffer.isBuffer(input)) {
        const type = await fileTypeFromBuffer(input);
        if (!type) {
            return false;
        }
        ext = type.ext;
    } else {
        ext = path.extname(input).toLowerCase();
    }

    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
}


export const convertImageB64 = async(imageBuffer) => {
    const image = await sharp(imageBuffer)
        .resize(512, 512, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3
        })
        .sharpen()
        .toBuffer();
    const mimeType = await getMimeType(imageBuffer);
    const base64Image = image.toString('base64');

    return `data:${mimeType};base64,${base64Image}`;
}