import * as THREE from "/build/three.module.130.js";
import { TomiFace } from "./tomi.controller.js";


var TomiFaceSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 353.67 188.18\">\r\n    <defs>\r\n        <style>\r\n            .cls-1 {\r\n                fill: red;\r\n            }\r\n\r\n            .cls-2 {\r\n                fill: #ff00cf;\r\n            }\r\n\r\n            .cls-3 {\r\n                fill: red;\r\n            }\r\n        </style>\r\n    </defs>\r\n   \r\n    <path class=\"cls-3\"\r\nd=\"M65.81,1.76c28.9.3,58.2,20.4,65,51.7,6.1,28.2-7.9,56.9-35.4,70.3-32.4,15.8-69.7,3.2-85.8-22.4-3.5-5.5-6.7-11.8-7.9-18.1-6.4-33.1,4.9-62.9,39.1-75.8C48.71,4.56,57.41,3.56,65.81,1.76Z\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M182.34,174.48c-15.2.2-24.8-4.4-34.3-9.2a10.48,10.48,0,0,1-4.4-3.9c-1-2.1-2-5.8-1-7a9.57,9.57,0,0,1,7.5-2.8c2.7.3,5.3,2.5,7.9,4.1q19.65,12.3,39.4,0a54.1,54.1,0,0,1,7.9-4.2c3.1-1.2,6.4-.3,7.5,2.9.7,2-.2,5-1.2,7.1-.8,1.7-2.7,3-4.4,3.9C198.14,170.08,188.64,174,182.34,174.48Z\" />\r\n   <path class=\"cls-2\" d=\"M204,160.47c-.52,2-2.5,3.8-4.4,5.1-9.5,6.8-10.1,22-22.9,21.9-12.5.2-23.74-16-34.1-23.7Z\" />\r\n    <path class=\"cls-2\"\r\n                d=\"M200.94,151.48c3.1-1.2,6.4-.3,7.5,2.9.7,2-.2,5-1.2,7.1-.8,1.7-2.7,3-4.4,3.9-9.1,4.7-18.6,8.6-24.9,9.1-15.2.2-24.8-4.4-34.3-9.2a10.48,10.48,0,0,1-4.4-3.9c-1-2.1-2-5.8-1-7a9.57,9.57,0,0,1,7.5-2.8\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M203.57,164.08c-1.8,9.3-2.3,10.4-8.9,10.5-14.3.3-28.6.2-42.9.1a9.62,9.62,0,0,1-5.6-1.5c-1.6-1.3-3.5-3.8-3.2-5.5s2.8-3.3,4.6-4.3c1.3-.7,3.2-.6,4.9-.6,15,0,29.9-.1,44.9,0C199.27,162.78,201.07,163.58,203.57,164.08Z\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M142.26,138.83c.1-12.7,9.9-19.5,21.6-14.9,6.1,2.4,11.2,6,13.7,12.3,2.6,6.8,5.1,13.7,7.3,20.7,2,6.4-.2,12-5.2,16.1-4.8,4-10.5,4-16,1.7a29.05,29.05,0,0,1-6.7-4.2C147.86,162.73,142.16,150.13,142.26,138.83Z\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M204.23,148.41c-2.2,8.6-3.5,17.6-6.8,25.7a18.1,18.1,0,0,1-25.8,9c-6.8-3.7-12.6-8.3-16.6-15.2-3.1-5.4-7.5-10.2-10.4-15.7-5-9.4-2-13.9,8.8-14.8,5.6-.5,11.3-.8,16.7-2a99.78,99.78,0,0,0,17.8-5.7c7.1-3.1,12.2-1.1,13.9,6.6a118.57,118.57,0,0,1,1.4,11.8Z\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M181.31,152.43c13,.7,24.4,9.1,33.6,21.1,2.2,2.8,2.8,6.1.1,9.1-3,3.2-6.5,3.1-9.8.6-3.1-2.4-6.6-4.8-8.8-8-6.8-10.1-27.6-11.4-37.3-.9a62.47,62.47,0,0,1-6.2,6.4c-1.7,1.5-3.8,3.4-5.8,3.5-2.7.1-6-.8-7.8-2.5-1.2-1.2-1-5.3.3-7C149.21,161.73,161.11,152.33,181.31,152.43Z\" />\r\n    \r\n    <path class=\"cls-3\"\r\n        d=\"M127.5,82.85c-1.1,3.6-1.6,6.5-2.8,9.1-12.4,26.7-42,43.5-73.8,35.4-19.6-5-35.2-17.1-43.6-36.6-3.2-7.6-1.9-10.4,5.8-10.3,36.3.2,72.5.6,108.8,1C123.3,81.45,124.5,82.05,127.5,82.85Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M65.87,3.25c22.8.6,41.2,9.5,53.4,27.7,16.6,24.7,15.5,51.6-4.3,75.7-17,20.7-50.6,25.4-74,16.2-23.9-9.3-41.1-38.6-39.5-60.4,1.6-22.3,18-45.4,38.5-52.9C48.27,6.45,57.17,5.25,65.87,3.25Zm-4,60.1h0c-.1,6-.1,12-.1,17.9,0,5.7,0,11.3.2,16.9.1,3.8,2.4,6.2,6.2,6.7s6.3-1.8,7.5-5.2a22.89,22.89,0,0,0,.8-6.9c.1-19.9.1-39.9.1-59.8,0-2.3.3-5.1-.9-6.8-1.5-2.1-4.4-4.6-6.7-4.6s-5,2.7-6.5,4.9c-1.1,1.7-.7,4.5-.7,6.8,0,10.1.1,20.1.1,30.1Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M1,63.29c-2.8-24.2,15.8-48,37.8-57.2s55.2-3.5,71.7,14.8c17.5,19.4,22,41.2,12.4,65.5a75.45,75.45,0,0,1-7.5,14c-3,4.3-7.1,6.4-13,4a210.57,210.57,0,0,0-20.8-6.8c-20-5.8-40.1-4.7-60.2-.6-9.9,2-11.2,1.7-15.7-7.3A48,48,0,0,1,1,63.29Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M65.81,1.76c28.9.3,58.2,20.4,65,51.7,6.1,28.2-7.9,56.9-35.4,70.3-32.4,15.8-69.7,3.2-85.8-22.4-3.5-5.5-6.7-11.8-7.9-18.1-6.4-33.1,4.9-62.9,39.1-75.8C48.71,4.56,57.41,3.56,65.81,1.76Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M65,1.76a79,79,0,0,1,39.5,13.6c19.9,13.2,29.7,48.4,19.3,72.8-15.9,37.4-55.8,46.5-85.7,32.7-27.5-12.7-42.6-38.6-35.8-69.5,4.6-20.9,18.1-36.1,38.6-43.7C48.58,4.66,56.88,3.66,65,1.76Zm-.2,14.3a36.85,36.85,0,0,0-4.7,0C35.78,17.86,15,40.56,14.78,65c-.2,17.3,8.4,30.1,21.3,39.7,10.5,7.8,23.2,12.2,36.7,9.8,15.8-2.8,29.2-9.6,38.3-24.2,8.4-13.4,9.2-27.2,4.3-41.1C108.48,29.76,90.08,14.56,64.78,16.06Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M6.49,92.8c-9.2-19.2-7.5-38.2,3.6-56.2,3.7-6.1,5.8-6.5,12.4-4,11.7,4.5,23.5,9.2,35.3,13.6,19.9,7.5,39.9,14.8,59.8,22.3,11.5,4.3,12.3,6.9,8.4,18.8-7.9,23.8-33.4,43.3-55.9,42.4C38.29,129.3,18.19,117.4,6.49,92.8Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M61.52,0c31.1-.2,55.2,15.5,63.9,38,7.1,18.4,6.1,36.7-3.3,54-2.9,5.4-7.9,9.7-12.1,14.4-3.3,3.7-6.7,3.5-10.5.5-13-10.3-28-16.3-44-20.2A141.69,141.69,0,0,0,15,83c-9.6.4-10.7-.5-12-10.2-2.3-17-.4-32.8,10.6-47.2C27.22,8,45,.8,61.52,0Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M29.38,94.49c33.3-9.3,64.2-23.5,92.2-43.8,5.8-4.2,9.2-2.9,9.9,4.3a114.49,114.49,0,0,1,.3,21.9c-1.5,14.1-7.7,26.8-18.4,35.6-28.9,23.8-60.4,22.2-88.4-.1-3.7-2.9-6.1-7.5-10.2-12.7C21.18,97.29,25.08,95.59,29.38,94.49Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M130.68,80.06c-5.1,20.3-16.6,34.4-34.9,42.5-19.3,8.6-39,8.1-57.7-1.7-16.2-8.5-27-22.2-31.4-40.3-.4-1.6,1.3-5.3,2.5-5.5,2.2-.5,5.7.2,7,1.7,2.7,3.3,4.5,7.3,6.3,11.2,6.6,14.2,18.4,22.4,32.6,27.5,23.4,8.3,51.2-8.8,59-26,.8-1.8,1.5-3.7,2.5-5.5C119.88,78.06,121.58,77.46,130.68,80.06Z\" />\r\n    <path class=\"cls-3\"\r\n        d=\"M49.59,72.55c-6.3-7-11.6-12.9-17-18.7C24.39,45.15,16,36.65,7.69,28c-7.5-7.9-8.4-15.4-2.6-20.9,6.9-6.7,16.5-6,23.8,1.9,11.1,12,22,24,32.9,36.2,8,8.9,8.2,9,17,.2,11-11.1,21.8-22.4,33-33.3,7.7-7.6,18.8-6.2,23.5,2.6,3,5.7,2.2,10.3-3.6,16.1-7.2,7.3-14.8,14.3-22.1,21.6-5.7,5.6-11.3,11.3-16.7,17.2-4.1,4.5-4,6.3.2,11.1,7.5,8.5,15.1,16.8,22.7,25.2,6.8,7.5,7.4,14.6,1.7,20.2-5.6,5.4-14,5.5-20.5-1-7.8-7.7-14.8-16.2-22.2-24.3-5.8-6.4-7.1-6.6-13.6-.6-5.4,5-10.5,10.2-16,15.1a90.58,90.58,0,0,1-13.4,10.4c-6.5,3.9-14.1,1.8-18.4-4.2-3.9-5.5-3.1-11.1,2.9-16.8,8-7.6,16.2-14.9,24.2-22.4C43.39,79.45,45.89,76.45,49.59,72.55Z\" />\r\n    <path class=\"cls-2\"\r\n        d=\"M182.85,157.81c-7,3.2-11.2,9.2-15.7,14.9-1.2,1.6-2,3.5-3.1,5.1-5.4,7.8-11,8-16.4.2-3.6-5.2-6.1-11.1-9.2-16.5-1.4-2.2-3-4.4-4.6-6.5-8.4,4.2-13.6,10.6-18.9,16.9-3.4,4.1-6.5,8.5-9.6,12.8-2.2,3.1-5.1,4.5-8.6,2.6-3.8-2.1-4.8-5.7-2.6-9.4a82.35,82.35,0,0,1,9.8-13.8c6.5-7.1,13.7-13.6,20.6-20.3a32,32,0,0,1,5.5-4.2c6.2-3.9,10.2-3,13.9,3.5,2.6,4.6,4.7,9.6,7.2,14.3a52.71,52.71,0,0,0,4.3,6.2c2.5-2.1,4.6-3.6,6.5-5.3,5.7-5.1,11.1-10.5,17.1-15.2,7-5.5,11.7-4.1,16,3.8,8.6,15.9,8.7,16,24.4,8a121.87,121.87,0,0,0,12-7.1c5.2-3.4,10.3-3.3,14.6.9,5.2,5.1,10,10.6,14.7,16.2,2.2,2.5,2.2,5.6-.6,8a5.83,5.83,0,0,1-8.2-.1,60.7,60.7,0,0,1-8.5-8.3c-3.4-4.3-7-4.5-11.3-2-6.6,3.8-13.4,7.3-19.6,11.7-8.2,5.8-12.3,5.4-18-3C191.15,166.41,189.25,160.41,182.85,157.81Z\" />\r\n</svg>";


const s = `<animate
attributeName="d"
dur="250ms"
repeatCount="indefinite"
values="
M175,172.74c-12.5.2-23.8-4.9-34.1-12.7-3-2.2-5.7-5-3-9.2,2.4-3.8,6.8-4.4,11.3-1.8,3.7,2.2,7.2,4.6,11.1,6.5,12,5.9,23.7,4.8,35-2,3.1-1.9,6-4.4,9.3-5.5,2-.7,5.6,0,6.9,1.5s1.4,5,.8,7.2c-.5,2-2.5,3.8-4.4,5.1C198.4,168.64,187.8,172.84,175,172.74Z;
M178.43,148.71c13,.7,24.4,9.1,33.6,21.1,2.2,2.8,2.8,6.1.1,9.1-3,3.2-6.5,3.1-9.8.6-3.1-2.4-6.6-4.8-8.8-8-6.8-10.1-27.6-11.4-37.3-.9A62.47,62.47,0,0,1,150,177c-1.7,1.5-3.8,3.4-5.8,3.5-2.7.1-6-.8-7.8-2.5-1.2-1.2-1-5.3.3-7C146.33,158,158.23,148.61,178.43,148.71Z;
"/>`
const FaceBase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352.02 352.02">
<defs><style>
.cls-1{display:none;}
.cls-2{fill:#59F4F6;}
</style></defs>
<path id="right" transform="translate(349) scale(-1 1)" class="cls-2"
d="M65.81,1.76c28.9.3,58.2,20.4,65,51.7,6.1,28.2-7.9,56.9-35.4,70.3-32.4,15.8-69.7,3.2-85.8-22.4-3.5-5.5-6.7-11.8-7.9-18.1-6.4-33.1,4.9-62.9,39.1-75.8C48.71,4.56,57.41,3.56,65.81,1.76Z" />
<path id="left" class="cls-2"
d="M65.81,1.76c28.9.3,58.2,20.4,65,51.7,6.1,28.2-7.9,56.9-35.4,70.3-32.4,15.8-69.7,3.2-85.8-22.4-3.5-5.5-6.7-11.8-7.9-18.1-6.4-33.1,4.9-62.9,39.1-75.8C48.71,4.56,57.41,3.56,65.81,1.76Z" />
<path id="mouth" class="cls-2"
d="M182.34,174.48c-15.2.2-24.8-4.4-34.3-9.2a10.48,10.48,0,0,1-4.4-3.9c-1-2.1-2-5.8-1-7a9.57,9.57,0,0,1,7.5-2.8c2.7.3,5.3,2.5,7.9,4.1q19.65,12.3,39.4,0a54.1,54.1,0,0,1,7.9-4.2c3.1-1.2,6.4-.3,7.5,2.9.7,2-.2,5-1.2,7.1-.8,1.7-2.7,3-4.4,3.9C198.14,170.08,188.64,174,182.34,174.48Z" /></svg>`;


export const Emotions = ['default', 'happy', 'grin', 'serious', 'sad', 'error'];
let Cached = {};
export const Facial = (w = 512, h = 512) => {

    const svgW = document.createElement('div');
    svgW.id = 'face';

    svgW.innerHTML = FaceBase;
    //svgW.style.display = 'none';
    svgW.style.background = `#000`;
    svgW.style.margin = 0;
    svgW.style.padding = 0;
    svgW.style.width = `${w}px`;
    svgW.style.height = `${h}px`;

    const svg = svgW.firstChild;
    const LeftEye = { state: 'default', path: svgW.querySelector('#left') }
    const RightEye = { state: 'default', path: svgW.querySelector('#right') }
    const Mouth = { state: 'default', path: svgW.querySelector('#mouth') }
    const ref = document.createElement('svg')
    ref.innerHTML = TomiFaceSVG;
    const lips = ref.querySelectorAll('.cls-2');
    lips.forEach(lip => {
        if (lip.id == '')
            lip.classList.add('cls-1');
    });
    const getLipPath = (id) => {
        return lips[id].getAttribute('d');
    }
    const eyes = ref.querySelectorAll('.cls-3');
    eyes.forEach(eye => {
        if (eye.id == '')
            eye.classList.add('cls-1');
    })
    const getEyesPath = (id) => {
        return eyes[id].getAttribute('d');
    }
    console.log(lips, eyes);

    const canv = document.createElement('canvas');
    canv.width = 512;
    canv.height = 512;


    const texture = new THREE.CanvasTexture(canv);
    texture.flipY = false;
    const ctx = canv.getContext('2d');
    let rendering = false;
    const shield = document.createElement('img');
    shield.setAttribute('src', '/models/tomi/shield.jpg');
    const updateTexture = (ms = 0) => {
        if (!rendering && Face.needsUpdate || Face.talking) {
            rendering = true;
            ctx.clearRect(0, 0, 512, 512);
            ctx.drawImage(shield, 0, 100, 512, 470);
            const animId = `${Face._eyeLeft}_${Face._eyeRight}_${Face.talking}_${Face._lipId}`;
            // if (Face.talking && !Face.useAudio) {
            //     if (ms - Face._lastTime >= 0.15 + Face._dur) {
            //         Face.mouth.path.setAttribute('d', getLipPath(Face._lipId))
            //         Face._lipId++;
            //         Face._lipId = Face._lipId % Face._maxLip;
            //         if (Face._lipId == 0) Face._lipId = Face._minLip;
            //         Face._lastTime = ms;
            //     }
            // } else {
                Face.mouth.path.setAttribute('d', getLipPath(Face._lipId))
            //}

            const svgData = (new XMLSerializer()).serializeToString(svg)
            const img = (Cached[animId]) ? Cached[animId] : document.createElement('img');
            const scale = 2.0;
            const render = (img) => {
                let sw = img.width * scale;
                let sh = img.height * scale;
                let sx = (ctx.canvas.width - sw) / 2;
                let sy = (ctx.canvas.height - sh) / 2;
                ctx.drawImage(img, sx, sy * 1.8, sw, sh);
                Cached[animId] = img;
                texture.needsUpdate = true;
            }
            if (Cached[animId]) {
                render(img);
                rendering = false;
            } else {
                img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData))));
                img.onload = function () {
                    render(img);
                    rendering = false;
                }
            }
            Face.needsUpdate = false;
        }
    }
    svgW.appendChild(canv)

    const Face = {
        rendering: false,
        left: LeftEye, right: RightEye, mouthState: 'default', mouth: Mouth, texture: texture, state: `happy`, talking: false,
        _lastTime: 0,
        _currTime: 0,
        _dur: 0,
        _eyeLeft: 5,
        _eyeRight: 5,
        _lipId: 1,
        _minLip: 0,
        _maxLip: 4,
        needsUpdate: true,
        useAudio: true,
        lips: lips,
        eyes: eyes,
        autoAnimate: true,
        reset: () => {
            Cached = {};
            Face.setEyes(5);
            Face.setLip(0);

        },
        action(eyeLeft, eyeRight = -1, lip = -1, duration = 800) {
            const prevLeft = Face._eyeLeft;
            const prevRight = Face._eyeRight;
            const prevLip = Face._lipId;
            const talking = Face.talking;
            Face.setEyes(eyeLeft, eyeRight);
            if (lip > -1) {
                Face.talking = false;
                Face.setLip(lip);
            }
            if (duration > 0) {
                setTimeout(_ => {
                    Face.setEyes(prevLeft, prevRight);
                    if (lip > -1) {
                        Face.setLip(prevLip);
                        Face.talking = talking;
                    }
                }, duration);
            }

        },
        setLip: (index) => {
            Face._lipId = index;
            const l = Face.lips[index].getAttribute('d');
            Face.mouth.path.setAttribute('d', l);
            Face.needsUpdate = true;
        },
        setEyes: (index, index2 = -1) => {
            index2 = (index2 > -1) ? index2 : index;
            Face._eyeLeft = index;
            Face._eyeRight = index2;
            const l = Face.eyes[index].getAttribute('d');
            const r = Face.eyes[index2].getAttribute('d');
            Face.left.path.setAttribute('d', l);
            Face.right.path.setAttribute('d', r);
            Face.needsUpdate = true;
        },
        update: updateTexture,
        setState: (s, duration = 0) => {
            let e;
            if (duration) {
                e = Face.state;
            }
            // Face._dur = duration;
            Face.state = s;
            UpdatePath('left', s, false);
            if (s == 'wink') s = 'default';
            UpdatePath('right', s, true);

            if (e) {
                setTimeout(() => {
                    Face.setState(e);
                }, duration);
            }
        },
        states: [],
    }

    const faceTexture = new THREE.MeshBasicMaterial({
        map: texture,
        reflectivity: 0.5,
    });
    return {
        svg,
        Face,
        faceTexture,
    }
}

export const setupFacial = (tomi) => {
    const {svg, Face, faceTexture} = Facial(512, 512);
    tomi.face = Face;
    tomi._face.material = faceTexture;
    tomi.facial = TomiFace;
}

export function clean(path) {
    path = path.replace('M', '');
    path = path.replace('Z', '');
    path = path.replace('L', ',');
}

export default {
    Facial,
}