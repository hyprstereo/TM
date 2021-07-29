import * as THREE from "./build/three.module.js"; //"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import {
  setupScene,
  setupControls,
  SETTINGS,
  SceneManager,
} from "./scene/config.js";
import { testUI } from "./scene/ioc-ui.js";
import { LoadAssets } from "./scene/ioc.js";
import { degToRad, isMobile } from "./utils/helpers.js";
import { TTS } from "./utils/tts.js";
import ThreeMeshUI from "./build/three-mesh-ui/three-mesh-ui.js";
import { TomiModel } from "./tomi.js";
import {TWEEN} from './jsm/libs/tween.module.min.js'


// global variables
let mainCamera;
let mainScene;
let mainRenderer;
let paused = false;
let mainComposer;
let frameId;
let pe_fxaa;
let stats;
let loadScreen;
let clock;
let tomi;
let controls;
let objsToTest = [];
// setup three js function
// usage ie:
// var scene = await setupScene('#app', [id_name_for_canvas], [optional config = {}])
// if (scene) {
//    ...start the scene etc
// }

export const createLoadScreen = () => {
  loadScreen = document.querySelector("#overlay");
  const prog = loadScreen.querySelector(".prog");
  const updateScreen = (msg) => {
    prog.innerHTML = `<span>${msg}</span>`;
  };
  return { screen: loadScreen, fn: _.debounce(updateScreen, 1000) };
};

// on window resize wrapper
export const sceneResize = (cam, renderer = undefined) => {
  const parent = renderer.domElement || window;

  window.addEventListener("resize", function (e) {
    const w = parent.offsetWidth || parent.clientWidth;
    const h = parent.offsetHeight || parent.clientHeight;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    if (renderer) renderer.setSize(w, h);
    if (mainComposer) {
      mainComposer.setSize(w, h);
    }

    const pixelRatio = renderer.getPixelRatio();

    if (pe_fxaa) {
      pe_fxaa.material.uniforms["resolution"].value.x = 1 / (w * pixelRatio);
      pe_fxaa.material.uniforms["resolution"].value.y = 1 / (h * pixelRatio);
    }
    render(0);
  });
};

// a simple asset loader
export const loadAsset = async (scene, prog = undefined) => {
  if (!scene) reject("scene is undefined");
  const light = new THREE.AmbientLight(0xffffff, SETTINGS.ambient);
  light.position.set(0, 5, 2);

  const sun = new THREE.DirectionalLight(0xffffff, SETTINGS.sun);
  //const lighth = new THREE.PointLightHelper(light, 1, 0xffff00);

  sun.position.set(1, 5, 1);
  sun.lookAt(0, 0, 0);
  sun.castShadow = true;

  scene.add(sun);

  scene.add(light);

  sun.shadow.bias = -0.0001;
  //sun.shadow.mapSize.width = 1024;
  //sun.shadow.mapSize.height = 1024;
  sun.shadow.camera.near = 0; // default
  sun.shadow.camera.far = 500; // default

  return await LoadAssets(scene, prog);
};

export const applyEnvMap = (target, source, ...names) => {
  console.log(source);
  target.traverse((node) => {
    const newMat = new THREE.MeshPhysicalMaterial({
      metalness: 0.4,
      roughness: 0.32,
      envMap: source,
    });
    if (node.type === "Mesh") {
      if (node.material) {
        const omap = node.material.map;

        if (node.name.indexOf("arm") <= -1) {
          node.material = newMat.clone();
          if (omap) node.material.map = omap;
        } else {
          node.material.transparent = true;
        }
        node.material.side = THREE.DoubleSide;
        node.material.castShadow = node.material.receiveShadow = true;
      }
    }
  });
};

export const render = (ms = 0) => {
  if (stats) stats.begin();
  if (!paused) {
    //controls.update(clock.getDelta());

   // frameId = requestAnimationFrame(render);
  }
  //TWEEN.update();
  if (controls) {
    tomi.update(ms);
    ThreeMeshUI.update();

    controls.update();
    if (mainComposer) {
      mainComposer.render();
    } else {
      mainRenderer.render(mainScene, mainCamera);
    }

  }

  if (stats) stats.end();
};

// first method to call when document are loaded
// usage eg, asynchronous promise way:
// init()
//  .then((result)=>{
//    # result returns scene objects
//    # means scenes and assets are fully loaded
//    # you can access result with
//      result.renderer
//      result.camera
//      result.scene
//  })
//  .catch(error=>{
//    ... to debug error if needed
//})
export const init = async () => {
  const { screen, fn } = createLoadScreen();
  window.loadProgress = fn;
  document.body.appendChild(screen);
  fn("loading");

  const build = await setupScene(document.getElementById("app")).then(
    (res) => res
  );
  if (build) {
    stats = build.stats;
    mainRenderer = build.renderer;
    mainScene = build.scene;
    mainCamera = build.camera;

    SceneManager.instance.camera = mainCamera;
    SceneManager.instance.renderer = mainRenderer;
    SceneManager.instance.scene = mainScene;

    // controls = build.controls;
    const { composer, fxaa } = build.composer;
    mainComposer = composer;
    pe_fxaa = fxaa;
    clock = SceneManager.instance.clock;

    sceneResize(mainCamera, mainRenderer);
    controls = setupControls(mainCamera, mainScene, "#overlay", mainRenderer);
    loadAsset(mainScene, (progress, total) => {
      fn("loading: " + progress.toString() + "/" + total.toString());
    })
      .then(({ assets }) => {
        const t = assets[1];
        SceneManager.instance.createHelper(t, THREE.SkeletonHelper);
        if (t) {
          tomi = new TomiModel(t, "#tomi-face", mainScene, null, 4, 4, mainCamera);
          tomi
            .playVoice("./audio/cm_audio/0_Benefits01NEW.mp3", 0.5)
            .then((sound) => {
              //TODO: play 3D animation
              //dome.media.play();
              tomi.play();
              render(0);
            });
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", render);
        }
        console.log(assets, tomi);
        fn("Click to start.");
        const ui = testUI(mainScene);
        //ui.position.copy(tomi.position);
        //mainScene.add(ui);

        controls.target.copy(new THREE.Vector3());

        ui.scale.set(0.5, 0.5, 0.5);

        ui.position.y -= 0.4;

        ui.position.z += 2;
        //ui.lookAt(controls.target);
       // tomi.smoothLookAt(mainCamera.position)
       tomi.add(ui);
       tomi.lookAt(mainCamera.position);

        ThreeMeshUI.update();
        const loadFn = (e) => {
          if (!clock.running) {
            controls.lock();
            // tts.speak("hello there.. How are you doing?");
            mainRenderer.shadowMap.needsUpdate = true;
            clock.start();
            //tomi.smoothLookAt(mainCamera.position)
            render(0);

          }
        };

        document.body.onkeydown = (e) => {
          if (e.key == "t") {
            mainCamera.layers.toggle(SceneManager.instance._layers.helpers);
          } else if(e.key == 's') {
            const p = prompt(`enter text`,  `EXR.. it's in the game!`)
            SceneManager.instance.speech.speak(p)
          } else if (e.key == 'f') {
            const p = tomi.model.position.clone();
            p.y = 1;
            controls.target = p;
            createjs.Tween.get(mainCamera.position).to({z: tomi.position.z - 2}, 6000, createjs.Ease.sineOut);
          }
        };
        document.body.onclick = (e) => {
          loadFn();
        };
        //document.body.addEventListener("pointerdown", loadFn);
      })
      .catch((e) => console.warn(e));
  }
};

document.body.onload = async (evt) => {
  await init();
};
