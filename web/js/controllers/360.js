import * as THREE from "../build/three.module.js"; //"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js";
//import { OrbitControls } from "./three/OrbitControls.js";
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";
import { RenderPass } from "../jsm/postprocessing/RenderPass.js";
import { FXAAShader } from "../jsm/shaders/FXAAShader.js";
import { ShaderPass } from "../jsm/postprocessing/ShaderPass.js";
import { CopyShader } from "../jsm/shaders/CopyShader.js";
import { EffectComposer } from "../jsm/postprocessing/EffectComposer.js";
import { createPanoVideo, panoControl } from "../interact/pano.js";
import { SAOPass } from "../jsm/postprocessing/SAOPass.js";
import { degToRad } from '../utils/helpers.js'

// global variables
let mainCamera;
let mainScene;
let mainRenderer;
let frameId = 0;
let paused = false;
let mainComposer;
let pe_fxaa;
let videoPano;
let dome;
let tomi;

// setup three js function
// usage ie:
// var scene = await setupScene('#app', [id_name_for_canvas], [optional config = {}])
// if (scene) {
//    ...start the scene etc
// }
export const setupScene = async (
  targetEl,
  id = "three",
  config = undefined
) => {
  return await new Promise((resolve, reject) => {
    let parentEl;
    if (targetEl instanceof HTMLElement) {
      parentEl = targetEl;
    } else {
      parentEl = document.querySelector(targetEl);
    }

    if (!parentEl) reject("invalid target element");

    const bound = parentEl.getBoundingClientRect();

    config = {
      width: parentEl.offsetWidth,
      height: parentEl.offsetHeight,
      far: 1000,
      near: 1,
    };
    const aspect = config.width / config.height;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      aspect,
      config.near,
      config.far
    );
    camera.position.set(0, 580, 300);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      depth: true,
      resizeTo: parentEl,
      autoRender: false,
      autoClear: false,
      pixelRatio: window.devicePixelRatio,
    });
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.setSize(config.width, config.height);

    const canvas = renderer.domElement;

    parentEl.appendChild(canvas);

    mainComposer = postEffects(renderer, scene, camera);
    const result = {
      scene,
      renderer,
      camera,
    };

    resolve(result);
  });
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
  });
};

// a simple asset loader
export const loadAsset = async (scene, assetSrc = undefined) => {
  return await new Promise((resolve, reject) => {
    if (!scene) reject("scene is undefined");
    const container = new THREE.Object3D();
    // const light = new THREE.AmbientLight(0xffffff, 1.8);
    // light.position.set(0, 80, -100);

    // const sun = new THREE.DirectionalLight(0xfefefe, 1);
    // const lighth = new THREE.PointLightHelper(light, 20, 0xffff00);
    sun.position.set(5, 10, 7.5);
    //sun.lookAt(0, 0, 0);
    sun.castShadow = true;
    scene.add(lighth);
    scene.add(sun);
    scene.add(light);
    let loader;
    if (assetSrc) {
      if (assetSrc.endsWith(".json")) {
        loader = new THREE.ObjectLoader();
      } else {
        loader = new GLTFLoader();
      }
      loader.load(
        assetSrc,
        (evt) => {
          const bot = evt.scene || evt; //evt.children[0].children[0];
          //console.log(bot);
          bot.name = "bot";
          applyEnvMap(bot);

          const scale = 20;
          bot.scale.set(scale, scale, scale);
          bot.position.set(0, -40, -120);
          container.add(bot);
          container.rotation.y = degToRad(90);
          scene.add(container);
          resolve({ model: container, scene: evt });
        },
        // loading progress callback
        (progressEvent) => {
          console.log("progress", progressEvent);
        },
        // error callback
        (err) => {
          reject(err);
        }
      );
    } else {
      const geo = new THREE.BoxGeometry(10, 10, 10);
      const mat = new THREE.MeshNormalMaterial();
      const cube = new THREE.Mesh(geo, mat);

      cube.name = "cube";
      container.add(cube);

      scene.add(container);
      cube.position.set(0, 0, 500);
      resolve(container);
    }
  });
};

export const applyEnvMap = (target, source, ...names) => {
  console.log(source);
  target.traverse((node) => {
    const newMat = new THREE.MeshPhysicalMaterial({
      metalness: 0.4,
      roughness: 0.32,
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
        //node.material.sides = THREE.DoubleSide;
        //TODO: to make a versatile asset checker
        // if (names.includes(node.name)) {
        //   const omap = node;
        //   omap.map = source;
        //   console.log(omap);

        //   m.metalness = 0.4; //.metalness;
        //   m.roughness = 0.22; //km.roughness;
        //   if (omap.map) {
        //     m.map = omap.map;
        //   } else {
        //     if (omap.color) {
        //       m.color = omap.color;
        //     }
        //   }
        //   //if (km.envMap) {
        //   //m.envMap = mainScene.environment;
        //   m.envMapIntensity = 0.9;
        //   //}

        //   node.material = m;
        // }
        node.material.castShadow = node.material.receiveShadow = true;
      }
    }
  });
};

// postEffects for shader filtering
// recommended to use AA from shader, as opposed to canvas AA
export const postEffects = (
  renderer,
  scene,
  camera,
  renderTarget = undefined
) => {
  const renderPass = new RenderPass(scene, camera);
  const fxaaPass = new ShaderPass(FXAAShader);

  const pixelRatio = renderer.getPixelRatio();
  const container = renderer.domElement;
  pe_fxaa = fxaaPass;
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (container.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (container.offsetHeight * pixelRatio);
  const target = renderTarget || renderer;

  const composer = new EffectComposer(target);
  composer.addPass(renderPass);
  composer.addPass(fxaaPass);

  const sao = new SAOPass(scene, camera, false, true);
  composer.addPass(sao);
  const params = sao.params;
  params.saoBias = 1;
  params.saoIntensity = 0.28;
  params.saoScale = 10;
  params.saoKernelRadius = 35;
  params.saoMinResolution = 1;
  params.saoBlur = true;
  params.saoBlurRadius = 8;
  params.saoBlurStdDev = 4;
  params.saoBlurDepthCutoff = 0.01;

  return composer;
};

export const render = (ms = 0) => {
  if (!paused) {
    frameId = requestAnimationFrame(render);

    if (tomi.faceLoaded) {
      tomi.update(ms);
    }

    // just a simple switcher
    if (mainComposer) {
      mainComposer.render();
    } else {
      mainRenderer.render(mainScene, mainCamera);
    }

    if (videoPano) {
      videoPano.onRender(ms);
    }
  }
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
export const create360 = async (target, mediaSrc) => {
  return await new Promise((resolve, reject) => {
    setupScene(document.querySelector(target)).then(build => {
      if (build) {
        //const { model, scene } = await loadAsset(mainScene, './models/tomi-anim.glb');
        createPanoVideo(build.scene, mediaSrc).then(m => {
          resolve(build);
        });

      }
    })
  })

};

// document.body.onload = async (evt) => {
//   await init();

//   if (tomi) {
//     mainScene.environment = dome.media;
//     videoPano = new panoControl(dome, { dist: 60 }, tomi, mainCamera), true, mainRenderer;
//     document.addEventListener("keydown", (e) => {
//       console.log(e);
//       switch (e.key) {
//         case "s":
//           tomi.mouth("smile");
//           break;
//         case "t":
//           tomi.mouth("talk");
//           break;
//       }
//     });
//     mainScene.environment = dome.media;
//   }
// };
