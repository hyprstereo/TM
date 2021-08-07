import { postEffects } from './scene/config.js';
import * as THREE from './build/three.module.js';
import { create360 } from "./controllers/360.js";
import { createLoadScreen, loadAsset } from "./controllers/ioc.js";
import { SceneManager } from "./controllers/view.js";
import { setupScreens } from "./scene/props.js";
import { TOMIController } from "./scene/tomi.controller.js";

const clock = new THREE.Clock(false);
let mainCamera;
let mainRenderer;
let mainComp;
let mainScene;
let pFXAA;
const init = async (target) => {
    return create360(target, '/video/map.mp4')
};

const renderAnimation = (ms = 0) => {
    console.log(ms);
    if (mainComp) {
        mainComp.render();
    } else {
        mainRenderer.render(mainScene, mainCamera)
    }
    requestAnimationFrame(renderAnimation);
}

document.body.onload = async (evt) => {
    const build = await init('#app').then(b=>b);
    console.log('created00', build)
   
};
