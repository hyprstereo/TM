import * as THREE from "../build/three.module.js"; //"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { Pointer3D } from "../interact/pointer.js";
import { setupScene, setupControls, SETTINGS } from "../scene/config.js";
import { LoadAssets } from "../scene/ioc.js";
import { TOMIController } from "../scene/tomi.controller.js";

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
let controls;
let tomi;
let pointer;
// setup three js function
// usage ie:
// var scene = await setupScene('#app', [id_name_for_canvas], [optional config = {}])
// if (scene) {s
//    ...start the scene etc
// }

export const createLoadScreen = () => {
  loadScreen = document.querySelector("#overlay");
  const prog = loadScreen.querySelector(".prog");
  const updateScreen = (msg) => {
    prog.innerHTML = `<span>${msg}</span>`;
  };
  return { screen: loadScreen, fn: updateScreen };
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
  console.log('assetloaded');


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

  if (controls) {

    if (tomi.update) tomi.update(clock.getDelta(), clock.getElapsedTime());
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

    let selects = [];
    pointer = new Pointer3D(mainCamera, mainScene, mainRenderer.domElement);

    pointer.enabled = true;
    //SceneManager.instance.createLightProbe(mainScene);

    // controls = build.controls;
    const { composer, fxaa, reflects, outline } = build.composer;
    if (reflects) {
      reflects.ground.visible = true;
      reflects.ground.position.y = 1;
      mainScene.add(reflects.ground);
    }
    pointer.on('hover', (obj) => {

      selects = obj;
      outline.pass.selectedObjects = pointer.selectedObjects;
      console.log(obj.userData.id);
      //console.log('hover', JSON.stringify(obj.parent.userData));
    });
    pointer.on('pointermove', (cursor) => {
      //console.log(cursor)
    });

    mainComposer = composer;
    pe_fxaa = fxaa;
    clock = build.clock;

    sceneResize(mainCamera, mainRenderer);
    mainCamera.layers.enableAll();
    loadAsset(mainScene, (progress, total) => {
      fn("loading: " + progress.toString() + "/" + total.toString());
    }).then((assets) => {
      new TOMIController()
        .load("/models/tomi-anim2.glb")
        .then((tomicls) => {
          tomi = tomicls;
          const delay = _.debounce(() => {
            tomi.randomClip();
          }, 4000);
          //tomi.addEventListener('animationend', (e) => delay())
          controls = setupControls(
            mainCamera,
            mainScene,
            "#overlay",
            mainRenderer
          );
          mainScene.add(tomi);

          tomi.play("hand.idle");
          if (!clock.running) {
            mainRenderer.shadowMap.needsUpdate = true;
            clock.start();
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", render);
          }
          anime({ targets: "#overlay", opacity: 0 });
          tomi.lookAt(mainCamera.position);
        })
        .catch((er) => console.error(er));
    });
  }
};

const playScene = () => {
  mainRenderer.shadowMap.needsUpdate = true;
  clock.start();
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", render);
};

function sceneLoadCompleted() {
  tomi.lookAt(mainCamera.position);

  document.body.onkeydown = (e) => {
    if (e.key == "t") {
      //mainCamera.layers.toggle(SceneManager.instance._layers.helpers);
      tomi.randomClip();
    } else if (e.key == "s") {
      const p = prompt(`enter text`, `EXR.. it's in the game!`);
      SceneManager.instance.speech.speak(p);
    } else if (e.key == "f") {
      const p = tomi.position.clone();
      p.y = 1;
      controls.target = p;
      createjs.Tween.get(mainCamera.position).to(
        { z: tomi.position.z - 2 },
        6000,
        createjs.Ease.sineOut
      );
    }
  };

  window.loadProgress("Click to start.");
  document.body.onclick = () => {
    if (!clock.running) {
      // tts.speak("hello there.. How are you doing?");
      //render(0);
      // playScene();
    }
    anime({ targets: "#overlay", opacity: 0 });
  };
}
