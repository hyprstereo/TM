import { isMobile } from "../utils/helpers.js";
import * as THREE from "/build/three.module.js";
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";
import Stats from "../build/stats.module.js";
import { RenderPass } from "../jsm/postprocessing/RenderPass.js";
import { FXAAShader } from "../jsm/shaders/FXAAShader.js";
import { ShaderPass } from "../jsm/postprocessing/ShaderPass.js";
import { CopyShader } from "../jsm/shaders/CopyShader.js";
import { BloomPass } from "../jsm/postprocessing/BloomPass.js";
import { OutlinePass } from "../jsm/postprocessing/OutlinePass.js";
import { SSRPass } from "../jsm/postprocessing/SSRPass.js";
import { ReflectorForSSRPass } from "../jsm/objects/ReflectorForSSRPass.js";

import { EffectComposer } from "../jsm/postprocessing/EffectComposer.js";
import { SAOPass } from "../jsm/postprocessing/SAOPass.js";

import { panoControl } from "../interact/pano.js";
import Emitter from "../events/emitter.js";
import { TTS } from "../utils/tts.js";
import { Vector2 } from "/build/three.module.js";

export let reflects = [];

export class SceneManager extends Emitter {
  static __instance;
  constructor() {
    super();
    this._debug = true;
    this._light = true;
    this._helpers = true;
    this._cam;
    this._cams;
    this._animations;
    this._renderer;
    this._controls;
    this._scene;
    this._objects = [];
    this._rayHit = true;
    this._clock = new THREE.Clock(false);
    this._globListener;
    this._isNew = true;
    this._isLoading = false;
    this._isBusy = false;
    this.speech = new TTS({ voice: 0, pitch: 1.001 });
    this._layers = {
      lights: 2,
      meshes: 1,
      bounds: 3,
      helpers: 4,
    };
    this._loader;
  }

  static get instance() {
    if (!SceneManager.__instance) {
      SceneManager.__instance = new SceneManager();
    }
    return SceneManager.__instance;
  }

  get clock() {
    return this, this._clock;
  }

  get renderer() {
    return this._renderer;
  }

  set renderer(r) {
    this._renderer = r;
  }

  get camera() {
    return this._cam;
  }

  set camera(c) {
    this._cam = c;
    //TODO: switch camera
  }

  get scene() {
    return this._scene;
  }

  set scene(s) {
    this._scene = s;
  }

  get canvas() {
    return this._renderer.domElement;
  }

  async setup(domElement = undefined, id = "tmscene", conf = {}) {
    const config = {
      ...conf,
      width: window.offsetWidth,
      height: window.offsetHeight,
    };
    const { renderer, scene, camera } = await setupScene(
      domElement,
      id,
      config
    );
    if (renderer) {
      this._renderer = renderer;
      this._cam = camera;
      this._scene = scene;
      const controls = setupControls(this._cam, this._scene, this._renderer);
      this._controls = controls;
      this.emit("setupcompleted", this);
      return this;
    } else {
      this.emit("error", `error at setup scene are not created`);
      return;
    }
  }

  createHelper(mesh, helperType = undefined) {
    if (mesh.type === "Mesh") {
      if (!mesh.helper) {
        const box = new THREE.Box3().setFromObject(mesh);
        const bhelper = helperType
          ? new helperType(mesh)
          : new THREE.Box3Helper(box, 0xffff00);
        bhelper.layers.set(this._layers.helpers);
        //mesh.layers.set(this._layers.meshes);
        mesh.add(bhelper);
      }
    } else if (mesh.type === "Light") {
      const lhelper = new helperType(mesh, 0.2, 0x00eeff);
      lhelper.layers.set(this._layers.lights);
      mesh.add(lhelper);
    }
  }

  async loadAssets(manifestData, reload = false) {
    if (this._isNew || reload) {
      this.reset();
      const { models, textures } = manifestData;
      this.emit("begin", models);
      const self = this;
      for (let i = 0; i < models.length; i++) {
        const total = models.length;
        const model = models[i];
        const mesh = await this.loadModel(model, ({ l, t }) => {
          this.emit("progress", { index: i, total: models.length, mesh: mesh });
        });
        if (mesh) {
          this._objects.push(mesh);
        }
      }
    }
  }

  sortTypes(mesh) {
    let meshes = {};
    let lights = {};
    let mats = {};

    mesh.traverse((node) => {
      if (node.type === "Mesh") {
        meshes[node.name] = node;
      } else if (node.type.contains("Light")) {
        lights[node.name] = node;
      } else if (node.type === "Material") {
        mats[node.name] = node;
      }
    });
    this._objects = { ...meshes, ...this._objects };
  }

  reset() {}
}

function getLoader(manager, type = "gltf") {
  if (!manager[type]) {
    if (type === "gltf") {
      manager[type] = new GLTFLoader();
    } else if (type === "json") {
      manager[type] = new THREE.ObjectLoader();
    } else if (type === "texture") {
      manager[type] = new THREE.TextureLoader();
    } else if (type === "material") {
      manager[type] = new THREE.MaterialLoader();
    } else {
      manager["loader"] = new THREE.FileLoader();
    }
  }
  return manager[type];
}
export const SETTINGS = {
  physicallyCorrectLights: true,
  ambient: 1.8,
  sun: 1.8,
  shadow: true,
  bloom: true,
  ao: false,
  BLOOM_SCENE: 1,
  tone: THREE.NoToneMapping,
  encoding: THREE.sRGBEncoding,
  precision: "highp",
  gamma: 2.2,
  useExportedAssets: true,
  reflective: false,
  outlined: true
};

export const setupScene = async (
  targetEl,
  id = "three",
  config = undefined
) => {
  return await new Promise((resolve, reject) => {
    let parentEl;
    if (typeof targetEl===Object) {
      parentEl = targetEl;
    } else {
      parentEl = document.querySelector(targetEl);
    }

    if (!parentEl)  {
      reject("invalid target element");
      return
    }

    config = {
      width: parentEl.offsetWidth,
      height: parentEl.offsetHeight,
      far: 50,
      near: 0.1,
      showStats: true,
      shadow: true,
    };
    const aspect = config.width / config.height;
    const scene = new THREE.Scene();

    scene.background = 0x000000;
    const camera = new THREE.PerspectiveCamera(
      60,
      aspect,
      config.near,
      config.far
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      depth: true,
      resizeTo: parentEl || null,
      autoRender: false,
      autoClear: false,
      pixelRatio: window.devicePixelRatio,
      // powerPreference: isMobile() ? '' : 'high-performance'
    });
    renderer.setClearColor(0x0000000, 1);
    renderer.toneMapping = SETTINGS.tone;
    renderer.outputEncoding = SETTINGS.encoding;
    renderer.physicallyCorrectLights = SETTINGS.physicallyCorrectLights;
    renderer.gammaFactor = SETTINGS.gamma;
    renderer.setSize(config.width, config.height);
    if (config.shadow) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
    }
    //CameraControls.install({ THREE: THREE });

    camera.position.set(0.5, 1.5, -7);

    const clock = SceneManager.clock;

    const canvas = renderer.domElement;

    parentEl.appendChild(canvas);
    let stats;
    if (config.showStats) {
      stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);
    }
    camera.lookAt(0.5, 1, 0);

    const composer = postEffects(renderer, scene, camera);
    const result = {
      scene,
      renderer,
      camera,
      stats,
      composer,
      clock,
    };
    //SceneManager.instance.createLightProbe(scene, renderer);

    resolve(result);
  });
};

export function setupControls(
  camera,
  scene,
  targetEl = "#overlay",
  renderer = undefined
) {
  //const controls = new PointerLockControls(camera, document.body);
  const controls = new panoControl(
    null,
    { dist: 7 },
    null,
    camera,
    true,
    renderer
  );
  const screen = document.querySelector(targetEl);
  controls.addEventListener("lock", function () {
    anime({
      targets: screen,
      opacity: 0,
      duration: 800,
      easing: "easeOutSine",
      complete: () => {
        screen.style.display = "none";
      },
    });
  });

  controls.addEventListener("unlock", function () {
    screen.style.display = "flex";
    window.loadProgress("Click to continue");
    anime({
      targets: screen,
      opacity: 0.8,
      duration: 800,
      easing: "easeOutSine",
      complete: () => {
        screen.style.display = "flex";
        //screen.parentElement.removeChild(screen);
      },
    });
  });

  return controls;
}

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
  const dim = new Vector2(container.offsetWidth, container.offsetHeight);

  const fxaa = fxaaPass;
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (dim.x * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (dim.y * pixelRatio);
  const target = renderTarget || renderer;

  const composer = new EffectComposer(target);

  let reflects;

  if (SETTINGS.reflective) {
    const plane = new THREE.PlaneBufferGeometry(10, 10, 32);
    const grReflector = new ReflectorForSSRPass(plane, {
      clipBias: 0.003,
      textureWidth: dim.x,
      textureHeight: dim.y,
      color: 0x888888,
      useDepthTexture: true,
    });
    grReflector.material.depthWrite = false;
    grReflector.rotation.x = -Math.PI / 2;
    grReflector.visible = false;

    const ssrPass = new SSRPass({
      renderer,
      scene,
      camera,
      width: dim.x,
      height: dim.y,
      groundReflector: grReflector,
      selects: reflects,
    });
    reflects = { ssr: ssrPass, ground: grReflector };
    composer.addPass(ssrPass);
    ssrPass.thickness = 0.018;
    ssrPass.maxDistance = 0.1;
    ssrPass.blur = true;

  }



  if (SETTINGS.ao && !isMobile()) {
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
  }

  let blooms;
  let fxCopy;
  if (SETTINGS.bloom && !isMobile()) {
    fxCopy = new ShaderPass(CopyShader);
    const bloomPass = new BloomPass(1, 25, 5);
    fxCopy.renderToScreen = true;

    composer.addPass(bloomPass);
  }
  composer.addPass(renderPass);

  let outline;
  if(SETTINGS.outlined) {
    let selects = [];
    const outlinePass = new OutlinePass(dim, scene, camera, selects);
    outlinePass.edgeThickness = 2;
    outline = {selects: selects, pass: outlinePass}
    composer.addPass(outlinePass);
  }

  if (fxCopy) {
    composer.addPass(fxCopy);
  }
  composer.addPass(fxaaPass);

  return { composer, fxaa, reflects, outline };
};
