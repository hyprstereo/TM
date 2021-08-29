import * as THREE from "/build/three.module.js";
import Emitter from "../events/emitter.js";
import { CSS3DRenderer, CSS3DObject } from '/js/jsm/renderers/CSS3DRenderer.js';
import { GLTFLoader } from "/js/jsm/loaders/GLTFLoader.js";
import { TTS } from "../utils/tts.js";
import { postEffects, setupControls, setupScene } from "../scene/builder.js";
import { HemisphereLight } from "../build/three.module.js";

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
    this.speech = new TTS({ voice: 0 });
    this._reflect;//  = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter:THREE.LinearMipmapLinearFilter } );
    this.ioc;
    this.editMode = false;
    this.cssRenderer;
    this.cssDomEl;
    this.cssScreen;
    this.setupCssLayer()
    this.setupCssLayer
    this.enableCss = true;

  }

  setupCssLayer() {
    const cssRenderer = new CSS3DRenderer();
    const dom = document.createElement('div');
    this.cssRenderer = cssRenderer;
    dom.style.pointerEvents = 'painted';
    dom.style.position = 'absolute';
    cssRenderer.setSize(window.width, window.height)

  }

  setEditMode(state) {
    this.editMode = state;
  }

  addObjects(sce) {
    if (sce.name === 'Scene') {
      if (sce.children.length) {
        sce.children.forEach(child => {
          this.scene.add(child);
        })
      }
    }
  }

  speak(txt) {
    this.speech.speak(txt);
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

    return build;
  }

  _onResize(e) {
    const parent = this.renderer.domElement.parentNode;
    console.log(parent);
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
    if (this.enableCss) {

      this.cssRenderer.setSize(window.clientWidth, window.clientHeight)

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
    //window.addEventListener('resize', this._onResize.bind(this), false);
    this.clock.start();
    this.renderer.shadowMap.needsUpdate = true;
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", this._onRender.bind(this));

  }

  stop() {
    //window.removeEventListener('resize', this._onResize.bind(this));
    this.clock.stop();
    createjs.Ticker.removeEventListener("tick", this._onRender.bind(this));
  }

  _onRender(ms) {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    this.emit("beforeRender", delta, elapsed);

    if (this.tomi) this.tomi.update(delta, elapsed);

    if (this.controls) this.controls.update();

    if (this.composer) {
      this.composer.render();
    } else {

      // this.renderer.render(this.scene, this.camera)
    }
    if (this.enableCss) {

      this.cssRenderer.render(this.scene, this.camera)

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
    antialias: false,
    alpha: false,
    depth: true,
    autoRender: false,
    autoClear: false,
    pixelRatio: window.devicePixelRatio,
  });
  // if (this.cssRenderer) {
  //   this.cssRenderer.setSize(window.innerWidth / window.innerHeight)
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  // }
  return build;
};

const setupLightings = (scene, sun = 1.8, ambient = 1.8, shadow = 1024) => {
  const light = new THREE.AmbientLight(0xffffff, ambient);
  createHelper(light, () => new THREE.PointLightHelper(light, 0.2, 0xffff00));

  const hemi = new HemisphereLight(0xffffff, 0xB65D27, 0.5);
  scene.add(hemi);
  light.position.set(0, 4, 2);

  const sunl = new THREE.DirectionalLight(0xffffff, sun);
  // const sunH = new THREE.DirectionalLightHelper(sunl, 1, 0xffff00);
  // sunl.add(sunH);

  sunl.position.set(1, 4, 1);
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

function setEditmode(state) {
  if (state) {
    if (!this.transformer) {
      const { transformer } = setupControls(this.camera, this.scene, this.renderer)
      this.transformer = this.transformer;
      transformer.enabled = true;
    } else {
      this.transformer.enabled = false;
    }
    this.editMode = state
  }
}
export const SceneManager = new SceneManagerImpl();
