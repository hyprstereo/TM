import * as THREE from "/build/three.module.js";
import TomiFaceSVG from '../../assets/svg/frags_1.svg';

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
        metalness: 0.4,
        roughness: 0.4,
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
    //tomi.facial = TomiFace;
}

export function clean(path) {
    path = path.replace('M', '');
    path = path.replace('Z', '');
    path = path.replace('L', ',');
}

export default {
    Facial,
}