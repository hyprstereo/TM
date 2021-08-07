/**
 *
 *  ████████╗███╗   ███╗     ██████╗ ███╗   ██╗███████╗    ███████╗██╗  ██╗██████╗
 *  ╚══██╔══╝████╗ ████║    ██╔═══██╗████╗  ██║██╔════╝    ██╔════╝╚██╗██╔╝██╔══██╗
 *     ██║   ██╔████╔██║    ██║   ██║██╔██╗ ██║█████╗      █████╗   ╚███╔╝ ██████╔╝
 *     ██║   ██║╚██╔╝██║    ██║   ██║██║╚██╗██║██╔══╝      ██╔══╝   ██╔██╗ ██╔══██╗
 *     ██║   ██║ ╚═╝ ██║    ╚██████╔╝██║ ╚████║███████╗    ███████╗██╔╝ ██╗██║  ██║
 *     ╚═╝   ╚═╝     ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
 *
 *
 */

import { createLoadScreen, loadAsset } from "./controllers/ioc.js";
import { SceneManager } from "./controllers/view.js";
import { setupScreens } from "./scene/props.js";
import { TOMIController } from "./controllers/tomi.controller.js";
import { IOCScene } from "./scene/ioc.js";
import { MeshBasicMaterial, MeshNormalMaterial, VideoTexture } from "./build/three.module.js";
import { createVideoElement } from "./interact/pano.js";
import { Vector3 } from "../web/js/build/three.module.js";
import { Pointer3D } from "./interact/pointer.js";
import { SpriteLayer } from "./objects/sprites.js";

export const Assets = {
  models: [
    "/models/ioc/building2.glb",
    "/models/ioc/tables.glb",
    "/models/ioc/screens.gltf",
    "/models/tom.gltf",
    "/models/tomi/idle.gltf",
    "/models/tomi/long.gltf",
    "/models/tomi/ioc-agility.gltf",
    "/models/tomi/ioc-competitive.gltf",
    "/models/tomi/ioc-cost.gltf",
    "/models/tomi/ioc-enablement.gltf"
  ],
  textures: ["/"],
};
const data = `[{"x":2.7743569797405185,"y":1.4582135855654905,"z":-3.0594612648676645},{"_x":-2.966433655861033,"_y":0.03200187598513606,"_z":3.135930225859582,"_order":"XYZ"}]`
const TerminalStartPos = JSON.parse(data);

const iocScene = new IOCScene();
let pointer;
const ledMats = [];
const init = async () => {
  // configure UI
  const { screen, fn } = createLoadScreen();
  window.loadProgress = fn;

  const build = await SceneManager
    .setup("#app")
    .then((r) => r);
  
  pointer = new Pointer3D(build.camera, build.scene, build.renderer.domElement, SpriteLayer);
  pointer.on('hover', (e) => {
    console.log(e);
  })
  let id = 0;
  SceneManager.on("loadbegin", (e) => console.log("begin", e));
  SceneManager.on("loadprogress", (e) => console.log("progress", e));
  SceneManager.on("loadcomplete", (e) => {
    let model = e.scene || e;
    if (id == 1) {
      SceneManager.scene.add(model);
      setupScreens(model, SceneManager.scene);
    } else if (id == 3) {
      SceneManager.tomi = new TOMIController(e);
      SceneManager.tomi.addSound(
        '',
        '/cm_audio/0_Benefits01NEW.mp3',
        '/cm_audio/0_BenefitsAgility.mp3',
        '/cm_audio/0_BenefitsCompetitive.mp3',
        '/cm_audio/0_BenefitsCost.mp3'
      );
      SceneManager.scene.add(SceneManager.tomi);
      SceneManager.tomi.position.set(2.786939482308075, 0, -0.51);
    } else if (id >= 4) {
      SceneManager.tomi.__loadAnimations(e, true);
    } else {
      // if (id == 0) {
      model.traverse(node => {
        if (node.type === 'Mesh') {
          if (node.name.startsWith('building003')) {
            node.visible = false;
          } else if (node.name.startsWith('led')) {
            node.material = (node.name === 'led1') ? new MeshBasicMaterial() : new MeshNormalMaterial();
            ledMats.push(node);
          }
          node.castShadow = false;
          node.receiveShadow = false;
        }
      });
      SceneManager.scene.add(model);
    }

    id++;
    console.log("complete", model);

  });

  SceneManager.on("loadfinished", async () => {
    // create the content layer
    const content = await iocScene.create().then(obj => obj);
    SceneManager.scene.add(content);
    const btnPos = new Vector3(TerminalStartPos[0].x, TerminalStartPos[0].y+.3, TerminalStartPos[0].z+1.78 );
    content.position.copy(btnPos);
    setupVideoPanel();
    // start the scene
    SceneManager.play();
    SceneManager.tomi.play(0);
    anime({
      targets: '#overlay',
      opacity: 0,
    });
    SceneManager.camera.layers.enableAll();
    const pos = SceneManager.tomi.position.clone();
    SceneManager.camera.position.copy(TerminalStartPos[0]);
    SceneManager.camera.rotation.copy(TerminalStartPos[1]);
    //SceneManager.controls.lookAt(pos)
    pos.y = 1;
    SceneManager.tomi.mesh.position.y = 1.4001;
    SceneManager.controls.lookAt(pos);
    SceneManager.tomi.lookAt(SceneManager.camera.position);
  });
  SceneManager
    .loadAssets(Assets.models)
    .then((completed) => {
      res(completed);
    });
};

const setupVideoPanel = async () => {
  const videoT = await createVideoElement('/video/Fortinet Threat Map - Profile 1 - Microsoft_ Edge 2020-10-21 14-21-26.mp4').then(v => v);
  document.body.appendChild(videoT);
  const videoMat = new VideoTexture(videoT);
  videoMat.flipY = false;
  ledMats[1].material = new MeshBasicMaterial({ map: videoMat });
  videoT.play();
}

document.body.onload = async (evt) => {
  await init();
  window.addEventListener('keydown', (e) => {
    if (e.key == 't') {
      SceneManager.tomi.randomClip();
    } else if (e.key == 'i') {
      iocScene.state = 0;
    } else if (e.key == 'p') {
      const a = JSON.stringify([SceneManager.camera.position, SceneManager.camera.rotation]);
    } else if (e.key === 'x') {
      SceneManager.tomi.playSound(1, 1);
      // SceneManager.tomi.playSound(0);
    }
  });
};
