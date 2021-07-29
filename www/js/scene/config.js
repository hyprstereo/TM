import { isMobile } from "/js/utils/helpers.js";
import * as THREE from "/js/build/three.module.js";
import { OrbitControls } from "/js/jsm/controls/OrbitControls.js";
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
import { Tween } from "./tweenutils.js";

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
  useExportedAssets: true,
  gamma: 2.2,
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
    renderer.toneMapping = isMobile() ? THREE.NoToneMapping : SETTINGS.tone;
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

    const clock = new THREE.Clock(false);

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

    resolve(result);
  });
};

export function setupControls(camera, scene, targetEl = "#overlay", renderer = undefined) {
  //const controls = new PointerLockControls(camera, document.body);
  const controls = new panoControl(null, { dist: 7 }, null, camera, true, renderer);
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
    screen.style.display = "inline-flex";
    window.loadProgress("Click to continue");
    anime({
      targets: screen,
      opacity: 0.8,
      duration: 800,
      easing: "easeOutSine",
      complete: () => {
        screen.style.display = "inline-flex";
        //screen.parentElement.removeChild(screen);
      },
    });
  });

  document.body.onclick = () => controls.lock();
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
