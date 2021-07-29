import * as THREE from "./build/three.module.js"; //"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
import { setupScene, setupControls, SETTINGS } from "./scene/config.js";
import { LoadAssets } from "./scene/ioc.js";
import { isMobile } from "./utils/helpers.js";

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

// setup three js function
// usage ie:
// var scene = await setupScene('#app', [id_name_for_canvas], [optional config = {}])
// if (scene) {
//    ...start the scene etc
// }

export const createLoadScreen = () => {
  loadScreen = document.querySelector("#overlay");
  const prog = loadScreen.querySelector('.prog');
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

    frameId = requestAnimationFrame(render);
  }
  if (controls) {
    // const updated = controls.updated;
    // if (updated) {
    //   controls.onRender(clock.getDelta());
    //   if (mainComposer) {
    //     mainComposer.render();
    //   } else {
    //     mainRenderer.render(mainScene, mainCamera);
    //   }
    // }
    controls.update()
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
    // controls = build.controls;
    const { composer, fxaa } = build.composer;
    mainComposer = composer;
    pe_fxaa = fxaa;
    clock = build.clock;

    sceneResize(mainCamera, mainRenderer);

    loadAsset(mainScene, (progress, total) => {
      fn("loading: " + progress.toString() + "/" + total.toString());
    }).then((assets) => {
      fn("Click to start.");
      mainRenderer.shadowMap.needsUpdate = true;

      controls = setupControls(mainCamera, mainScene, "#overlay", mainRenderer);
      clock.start();
      render(0);
    });
  }
};

document.body.onload = async (evt) => {
  await init();
};
