import { isMobile } from "/js/utils/helpers.js";
import * as THREE from "/js/build/three.module.js";
import { OrbitControls } from "/js/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "/js/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "/js/jsm/loaders/FBXLoader.js";
// import { ObjectLoader } from "/js/jsm/loaders/ObjectLoader.js";
import Stats from "/js/build/stats.module.js";
import { RenderPass } from "/js/jsm/postprocessing/RenderPass.js";
import { FXAAShader } from "/js/jsm/shaders/FXAAShader.js";
import { ShaderPass } from "/js/jsm/postprocessing/ShaderPass.js";
import { CopyShader } from "/js/jsm/shaders/CopyShader.js";
import { UnrealBloomPass } from "/js/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "/js/jsm/postprocessing/EffectComposer.js";
import { SAOPass } from "/js/jsm/postprocessing/SAOPass.js";
import { BloomFragment, BloomShader } from "/js/scene/ioc.js";
import { panoControl } from "../pano.js";
import Emitter from "/js/events/emitter.js";
import { fileStats } from "../utils/helpers.js";
import { TTS } from "../utils/tts.js";

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
    this.speech = new TTS({voice: 0, pitch: 1.001});
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
        const bhelper = (helperType) ? new helperType(mesh) : new THREE.Box3Helper(box, 0xffff00);
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
  async loadModel(src, prog = undefined) {
    return await new Promise((res, rej) => {
      const { name, ext } = fileStats(src);
      let loader;
      switch (ext) {
        case "gltf":
        case "glb":
          loader = getLoader(this._loader, "gltf");
          break;
        case "json":
        case "tmx":
          loader = getLoader(this._loader, "object");
          break;
        default:
          loader = getLoader(this._loader, "file");
      }

      loader.load(
        src,
        (asset) => {
          res({ scene: asset.scene || asset, name: name });
        },
        (p) => {
          if (prog) {
            Object.apply(prog, [p.loaded, p.total]);
          }
        },
        (err) => {
          rej(err);
        }
      );
    });
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
  sun: 1.2,
  shadow: true,
  bloom: false,
  ao: false,
  BLOOM_SCENE: 1,
  tone: THREE.NoToneMapping,
  encoding: THREE.sRGBEncoding,
  precision: "highp",
  gamma: 2.2,
  useExportedAssets: true,
};

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
      resizeTo: parentEl,
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

    const clock = SceneManager.instance.clock;

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
  const fxaa = fxaaPass;
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (container.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (container.offsetHeight * pixelRatio);
  const target = renderTarget || renderer;

  const composer = new EffectComposer(target);

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
  if (SETTINGS.bloom && !isMobile()) {
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(SETTINGS.BLOOM_SCENE);

    const bloomParam = {
      exposure: 1,
      bloomStrength: 5,
      bloomThreshold: 0,
      bloomRadius: 0,
    };
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = bloomParam.bloomThreshold;
    bloomPass.strength = bloomParam.bloomStrength;
    bloomPass.radius = bloomParam.bloomRadius;
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderPass);
    bloomComposer.addPass(bloomPass);
    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: BloomShader,
        fragmentShader: BloomFragment,
        defines: {},
      }),
      "baseTexture"
    );
    finalPass.needsSwap = true;
    composer.addPass(finalPass);
  }
  composer.addPass(renderPass);
  composer.addPass(fxaaPass);
  return { composer, fxaa };
};
