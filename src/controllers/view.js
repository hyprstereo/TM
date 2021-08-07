import * as THREE from "../build/three.module.js";
import { SETTINGS, setupControls, setupScene } from "./config.js";
import Emitter from "../events/emitter.js";
import { postEffects } from "./config.js";
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";

class SceneManagerImpl extends Emitter {
  constructor() {
    super();
    this.currentScene;
    this.clock = new THREE.Clock(false);
    this.renderer;
    this.camera;
    this.scene;
    this.composer;
    this.fxaa;
    this.renderTargets;
    this.tomi;
    this.assets = {};
    this._loader = new GLTFLoader();
  }

  async setup(target = "#app", props = undefined) {
    const build = await setupWebGL(target, props);
    if (build) {
      this.camera = build.camera;
      this.renderer = build.renderer;
      this.scene = build.scene;

      setupLightings(this.scene);
      const { composer, fxaa } = postEffects(
        this.renderer,
        this.scene,
        this.camera,
        null
      );
      this.composer = composer;
      this.fxaa = fxaa;
    } else {
      console.warn("setupGLError");
    }
    this.scene = build.scene;
    this.controls = setupControls(
      this.camera,
      this.scene,
      "#app",
      this.renderer
    );
      window.addEventListener('resize', (e) =>{
        
      })
    return build;
  }

  _onResize(e) {
    const parent = this.renderer.domElement
    const w = parent.offsetWidth || parent.clientWidth;
    const h = parent.offsetHeight || parent.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.renderer) this.renderer.setSize(w, h);
    if (this.composer) {
      this.composer.setSize(w, h);
    }

    const pixelRatio = this.renderer.getPixelRatio();

    if (this.fxaa) {
      this.fxaa.material.uniforms["resolution"].value.x = 1 / (w * pixelRatio);
      this.fxaa.material.uniforms["resolution"].value.y = 1 / (h * pixelRatio);
    }
  }

  async loadAssets(src) {
    const sources = src;
    return await new Promise((res, rej) => {
      let counter = 0;
      let arr = [];
      let name = src[counter];

      const loader = this._loader;
      const self = this;
      const loadModel = (s) => {
        // arr[src] =  {src: src, scene: null, id: i};
        self.emit("loadbegin", s);
        loader.load(s, loadComplete, loadProgress, loadError);
      };

      const loadComplete = (event) => {

        //arr[sources[counter]] = event;
        self.emit("loadcomplete", event);
        arr.push(event)
        if (counter < sources.length - 1) {
          counter++;
          loadModel(sources[counter]);
        } else {
          self.emit("loadfinished", arr);
        }
      };
      const loadProgress = (event) => this.emit("loadprogress", event);
      const loadError = (event) => this.emit("loaderror", event);


      loadModel(src[counter]);
    });
  }

  play() {
    this.clock.start();
    this.renderer.shadowMap.needsUpdate = true;
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", this._onRender.bind(this));
    window.addEventListener('resize', this._onResize.bind(this));
  }

  stop() {
    this.clock.stop();
    createjs.Ticker.removeEventListener("tick", this._onRender.bind(this));
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _onRender(ms) {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    this.emit("beforeRender", delta, elapsed);
    if (this.tomi) this.tomi.update(delta);
    if (this.controls) this.controls.update();
    if (this.composer) {
      this.composer.render();
    } else {
      // this.renderer.render(this.scene, this.camera)
    }

    this.emit('afterRender', delta, elapsed);
  }
}

const RendererProps = {
  antialias: false,
  alpha: false,
  depth: true,
  autoRender: false,
  autoClear: false,
  pixelRatio: window.devicePixelRatio,
};

const setupWebGL = async (target = "#app", props = undefined) => {
  const el = document.querySelector(target);
  const build = await setupScene(target, "tm-three", {
    resizeTo: el,
    ...RendererProps,
    ...props,
  });

  return build;
};

const setupLightings = (scene, sun = 1.8, ambient = 1.8, shadow = 1024) => {
  const light = new THREE.AmbientLight(0xffffff, ambient);
  createHelper(light, () => new THREE.PointLightHelper(light, 0.2, 0xffff00));
  light.position.set(0, 5, 2);

  const sunl = new THREE.DirectionalLight(0xffffff, sun);
  const sunH = new THREE.DirectionalLightHelper(sunl, 1, 0xffff00);
  sunl.add(sunH);

  sunl.position.set(1, 5, 1);
  sunl.lookAt(0, 0, 0);
  sunl.castShadow = true;

  scene.add(sunl);
  scene.add(light);

  if (shadow) {
    sunl.shadow.bias = -0.0001;
    sunl.shadow.mapSize.width = shadow;
    sunl.shadow.mapSize.height = shadow;
    sunl.shadow.camera.near = 0;
    sunl.shadow.camera.far = 500;
  }

  return {
    sunl,
    ambient,
  };
};

function createHelper(object, helperType = undefined) {
  let helper;
  if (helperType) {
    helper = helperType();
    helper.layers.set(7);
    object.add(helper);
  } else {
    const b = new THREE.Box3().setFromObject(object);
    const size = b.getSize(new THREE.Vector3());
    helper.layers.set(7);
    object.add(helper);
  }

  return object;
}

export const SceneManager = new SceneManagerImpl();
