import { ImageBitmapLoader } from "../build/three.module.js";

const SpriteAssets = [
    '/ui/cybersecurity/btn_cyber.png',
    '/ui/cybersecurity/btn_ioc.png'
];

const loadSprites = async (...src) => {
    return await new Promise((res, rej) => {
        let i = 0;
        const total = src.length;
        const loader = new ImageBitmapLoader();
        const images = [];
        const next = () => {
            loader.load(src[i], (img) => {
                images.push(img);
                if (i < total) {
                    i++;
                    next();
                } else {
                    res(images);
                }
            }, null,
            (err) => {
                console.warn('error', err);
                rej(err);
            })
        }
        next();
    });
}

export const setupEditor = (target = undefined) => {
    const w3 = document.createElement('link');
    w3.rel = 'stylesheet';
    w3.href = '/css/w3.css';
    const head =document.getElementsByTagName('head')[0];
    head.appendChild(w3);
}

export const EditMode = true;