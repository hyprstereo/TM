import * as THREE from "/build/three.module.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";
import { SceneManager } from "../view.js";
import { ExportToGLTF } from "../../scene/props.js";
import { degToRad, SaveString } from "../../utils/helpers.js";
import { setupReflection } from "./tomi.reflect.js";

export class ActionSet {
  constructor(clip = undefined, loop = undefined, repeat = undefined, expression = undefined, ended = undefined) {
    this.clip = clip;
    this.loop = loop;
    this.repeat = repeat;
    this.ended = ended;
    this.expression = expression
    this._action = null;
    this.paused = false;
    return this;
  }

  setAction(action) {
    this._action = action;
    return this;
  }

  clone() {
    return new ActionSet(this.clip, this.loop, this.repeat, this.expression, this.ended);
  }

  reverse() {
    this._reverse = true;
    return this;
  }
}

export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined, scale = 1, sceneManager = undefined) {
    super();

    this.sceneManager = sceneManager;
    this._autoAnimate = false;
    this._mixer = null;
    this._sounds = [];
    this._clips = [];
    this._actionSet = {}
    this._sound;

    this.states = {};
    this._face = null;
    this._body = null;
    this._currentClip = null;
    this._currentAction = null;
    this._currentIndex = 0;

    this._talking = false;
    this._lastElapse = 0;

    this._defaultClip = 1;
    this._actionCallbacks = {};

    this._root;
    this._animating = false;
    this._currentActions = [];
    this._mainMaterials = null;

    this._lookTarget = new THREE.Vector3();
    this._plugins = {};

    if (!mesh && !sceneManager)
      return;

    this.mesh = mesh.scene || mesh;

    if (mesh) {
      this.bind(this.mesh, scale)
      if (mesh.animations) {
        this.__loadAnimations(mesh);
      }
    }
  }

  use(...setupFn) {
    setupFn.forEach(fn => {
      fn(this);
    })
  }

  usePlugin(name, setupFn) {
    if (!this._plugins[name]) {
      this._plugins[name] = setupFn(this);
      console.log(`plugin :${name} installed`, this._plugins[name]);
    } else {
      console.log(`plugin ${name} is already installed`);
    }
  }

  removePlugin(name) {
    if (this._plugins[name]) {
      delete this._plugins[name];
    }
  }

  getPlugin(name) {
    return this._plugins[name] || null;
  }

  defineActions(actions = {}) {
    this._actions = actions;
  }

  actions(actionName) {
    return this._actions[actionName] || null;
  }


  get root() {
    return this._root;
  }

  async save(model = true, animations = true) {
    if (model) {
      const data = await ExportToGLTF('tomi.gltf', this);
    }

    if (animations) {
      const data = JSON.stringify(this._clips);
      SaveString(data, 'tomi-animations.json');
    }
  }

  moveTo(newPos, tween = true, lookAt = undefined, lookDur = 'update', update = undefined, complete = undefined) {
    if (tween) {
      // const lookPos = (lookAt instanceof THREE.Object3D)? lookAt.position.clone() : {...lookAt};
      const tpos = { ...newPos }
      tpos.y += .25;
      const self = this;
      gsap.to(this.position, {
        ...tpos, duration: 2, onComplete: () => {
          // if (self.updateReflect) {
          //   self.updateReflect();
          //   self._mainMaterials.envMap = self._cubeRenderTarget.texture;
          // }
          gsap.to(this.position, {
            ...newPos, duration: 2, ease: 'sine.out',
            onUpdate: () => {
              if (lookAt && lookDur === 'update') {
                self.lookAt(lookAt, true);
              }
              if (update) update(this.position.clone())

            }
            , onComplete: () => {
              //  if (self.updateReflect) {
              //    self.updateReflect();
              // //   self._mainMaterials.envMap = self._cubeRenderTarget.texture;
              //  }
              if (complete) complete();
            }
          });
        }, onUpdate: () => {
          // if (self.updateReflect) {
          //   self.updateReflect();
          //   self._mainMaterials.envMap = self._cubeRenderTarget.texture;
          // }
          if (lookAt && lookDur === 'mid') {
            self.lookAt(lookAt, true);
          }
          if (update) update(this.position.clone())
        }
      })
    }
    return this;
  }

  moveToRef(index = 0) {
    const ref = this._waypoints[index];
    console.log(ref);

    let rpos = new THREE.Vector3(ref.x, ref.y + .6, ref.z)
    const cam = SceneManager.camera.position.clone();
    cam.y = rpos.y;
    SceneManager.tomi.moveTo(rpos, true, cam);
  }

  hoverTo(object) {
    if (object instanceof THREE.Object3D) {
      const bb = new THREE.Box3().setFromObject(object);
      const sz = bb.getSize(object.position);
      const newp = object.position.clone();
      newp.y -= sz.y * 0.5;
      this.moveTo(newp);
    }
  }

  async setupBodyTextures(config = { env: '/models/tomi/city_02.jpg', body: {} }) {
    // const loader = new THREE.TextureLoader();
    // const envTexture = (typeof config.env === 'string') ? await loader.load(config.env, t => t)
    // : config.env;
    // envTexture.mapping = THREE.EquirectangularReflectionMapping;

    // const bodyTexture = await loader.load(`/models/tomi/tomi_col.jpg`, t=>t);
    // bodyTexture.flipY = false;

    // const bodyNormal = await new THREE.TextureLoader().load('/models/tomi/tomi_nrm.jpg', t => t);
    // bodyNormal.flipY = false;

    // const brough = await new THREE.TextureLoader().load('/models/tomi/tomi_rough.jpg', t => t);
    // brough.flipY = false;

    // const bmetal = await new THREE.TextureLoader().load('/models/tomi/tomi_metal.png', t => t);
    // bmetal.flipY = false;

    // const bodyMat = new MeshPhysicalMaterial({
    //   color: 0xffffff,
    //   encoding: THREE.sRGBEncoding,
    //   reflectivity: 0.8,
    //   map: bodyTexture,
    //   envMap: envTexture,
    //   normalMap: bodyNormal,
    //   roughnessMap: brough,
    //   metalnessMap: bmetal,
    //   roughness: 0.9,
    //   metalness: 1,
    //   ...config.body,
    // });

    // const blue = new THREE.MeshLambertMaterial({
    //   transparent: true,
    //   opacity: 0.5,
    //   emissive: 0x59F4F6,
    //   side: THREE.DoubleSide
    // });

    // const faceMat = new THREE.MeshBasicMaterial({
    //   map: self.face.texture,
    //   envMap: city,
    //   reflectivity: 0.1
    // })

    // this._materials = {
    //   body: bodyMat,
    //   blue: blue,
    //   face: faceMat
    // }
    // return this._materials;
  }

  async bind(mesh, scale = 1, reflect = false) {


    const city = new THREE.TextureLoader().load('/models/tomi/city_02.jpg');
    city.flipY = false;
    city.encoding = THREE.sRGBEncoding;
    city.mapping = THREE.EquirectangularReflectionMapping

    this.mesh = mesh;
    // this.add(mesh);
    mesh.position.set(0, 0, 0);
    SceneManager.scene.background = city;

    // this.add(this._reflect)
    // SceneManager._reflect.position.set(0, 0, 0)

    const body = new THREE.TextureLoader().load('/models/tomi/tomi_col.jpg');

    body.flipY = false;
    body.encoding = THREE.sRGBEncoding;
    const bodyNormal = new THREE.TextureLoader().load('/models/tomi/tomi_nrm.jpg');
    bodyNormal.flipY = false;
    //body.encoding = THREE.sRGBEncoding;
    const brough = new THREE.TextureLoader().load('/models/tomi/tomi_rough.jpg');
    brough.flipY = false;
    const bmetal = new THREE.TextureLoader().load('/models/tomi/tomi_metal.png');
    bmetal.flipY = false;

    const group = new THREE.Object3D();
    group.add(mesh);
    this.add(group);
    // mesh.scale.set(scale, scale, scale);
    const self = this;
    const { cubeRenderTarget } = setupReflection(self);
    //self.updateReflect();
    if (cubeRenderTarget) SceneManager.scene.environment = cubeRenderTarget.texture;
    const shield = new THREE.MeshPhysicalMaterial({
      // side: THREE.DoubleSide,
      reflectivity: 1,
      map: body,

      normalMap: bodyNormal,
      normal: -1.00,
      roughnessMap: brough,
      metalnessMap: bmetal,
      roughness: 0.6,
      metalness: 1,
      color: 0xf4f4f4,
    });
    this._mainMaterials = shield;

    const hat = shield;//.clone()
    //SceneManager._reflect.texture.needsUpdate = true;

    const blue = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.5,
      emissive: 0x59F4F6,
      side: THREE.DoubleSide
    });

    mesh.traverse((n) => {
      if (n.name.startsWith('Root')) {
        this._root = n;
      }
      if (n.type.endsWith("esh")) {
        if (n.material) {
          //n.material.side = THREE.DoubleSide;
          n.material.transparent = true;
        }
        //n.castShadow = n.receiveShadow = true;
        if (n.name === "hat" && n.material.name === 'hat_mat') {
          self._hat = n;
          n.material = shield.clone();
        } else {

          //sconsole.log('mat', n.material.name, n.material.map);
          if (n.material.name.startsWith('Material #63') || n.material.name === "body_mat") {
            self._body = n;
            n.material = shield;
          } else if (n.material.name.startsWith("Material #10")) {
            blue.map = n.material.map;
            blue.alphaMap = n.material.alphaMap;
            blue.transparent = true;
            n.material = blue;
          } else if (n.material.name === 'face_mat') {
            this._face = n;
            //n.material = faceMat;
            // if (self.face) {
            //   self.face.update()
            // }
            //self.facial.UpdatePath('left', 'happy')
          } else {
            const etc = shield.clone();
            etc.map = n.material.map;
            etc.color = n.material.color;
            n.material = etc;

          }
        }
      } else if (n.type == 'Bone') {
        if (n.name.startsWith('Hand')) {
          const pl = new THREE.PointLight(0x00cbfe, 0.5, 0.1);
          n.add(pl);
        }
      }
    });
    //SceneManager._reflect.texture.needsUpdate = true;
    //mesh.position.set(0, 1, 0);
    this.__init(mesh);
  }

  setEnvironment(src) {
    if (typeof src === 'string') {
      const texture = new THREE.TextureLoader().load(src, t => t);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this._mainMaterials.envMap = texture;
    } else {
      if (src instanceof THREE.Texture) {
        this._mainMaterials.envMap = src;
      }
    }
  }

  async load(
    src = "./models/tomi/tom-new.gltf",
    progress = undefined,
    compressed = false,
  ) {
    return new Promise(
      (res, rej) => {
        const loader = new GLTFLoader();
        loader.load(
          src,
          (asset) => {
            const model = asset.scene || asset;
            if (model) {
              this.bind(model);
              if (asset.animations) {
                this.__loadAnimations(asset);

              }
              res(this);
            } else {
              rej(`invalid mesh`);
            }
          },
          (prog) => {
            if (progress) progress(prog);
          }
        );
      },
      (err) => {
        rej(err);
      }
    );
  }

  __init(m) {
    m.layers.set(6);
  }

  lookAt(target, eyeLevel = true) {
    if (target instanceof THREE.Object3D) {
      target = target.position.clone();
    }
    if (eyeLevel) target.y = this.position.y;
    this.children[0].lookAt(target);

  }

  sortAnimationClips() {
    // this._clips = _.sortBy(this.clips, (o) => o.name.toLowerCase());
  }

  getClipsContaining(keywords, random = false) {
    const arr = this._clips.filter(c => c.name.startsWith(keywords))
    return (random) ? arr[_.random(false) * arr.length - 1] : arr;
  }

  async __loadAnimations(scene, onlyClips = false, overwrite = false) {
    //console.log(scene.animations);
    if (onlyClips) {
      if (overwrite) this._clips = [];
      scene.animations.forEach(clip => {
        const index = this._clips.length;
        clip.name = `${clip.name} - #${index}`;
        this._clips.push(clip);
      });
      return
    }
    scene.animations.forEach(clip => {
      const index = this._clips.length;
      clip.name = `${clip.name} - #${index}`;
      this._clips.push(clip);
    });
    //this._clips.push(...scene.animations);
    const mixer = new THREE.AnimationMixer(this.mesh);

    mixer.timeScale = 1;
    //this._clips = scene.animations;
    const self = this;
    mixer.addEventListener("finished", (e) => {
      self.nextAction();
    });
    mixer.addEventListener("loop", (e) => {
      this._currentIndex = 0;
      // self.dispatchEvent({ type: "animationend" });
      if (this._currentActions.length > 0)
        self.nextAction();
      else {
        self.dispatchEvent({ type: "animationend" });
      }
    });
    this._mixer = mixer;
  }

  nextAction() {
    if (this._currentActions.length > 1) {
      if (this._actionCallbacks[this._currentAction]) {
        this._actionCallbacks[this._currentAction]();
        this._actionCallbacks[this._currentAction] = null;
      }
      const action = this._currentActions.shift();
      this.play(action.clip, action.loop, action.repeat, action.ended, action.paused);
    } else {
      this.play(this._defaultClip, THREE.LoopRepeat);
      this.dispatchEvent({ type: "animationend" });
    }
  }

  randomClip(seq = ["talkAction", "talkAction2", "talkAction3", "talkAction4", "eureka", "thinking", "sigh"]) {

    const animationId = seq[Math.random() * seq.length - 1];
    this.actions(animationId);
  }

  reset() {
    this._actionCallbacks = {};
    this.face.reset();
    this._defaultClip = 1;
  }

  playAction(sets, autoDefault = true) {
    if (!this._currentActions) this._currentActions = [...sets];
    else this._currentActions.push(sets);

    if (autoDefault) this._currentActions.push(new ActionSet(1, THREE.LoopRepeat));
    this._playFromSet = true;
    this.nextAction();
  }

  play(clipNameOrIndex, loop = THREE.LoopOnce, repeat = 0, ended = undefined, paused = false) {
    this._animating = true;
    let clip;
    this._currentIndex = 0;
    this._currentSequence = [];
    if (typeof clipNameOrIndex === 'number') {
      clip = this._clips[clipNameOrIndex]
    } else {
      clip = THREE.AnimationClip.findByName(this._clips, clipNameOrIndex);
    }


    //this._mixer.timeScale = 1;
    if (clip) {
      const action = this._mixer.clipAction(clip, null, THREE.NormalAnimationBlendMode);

      if (ended) {
        this._actionCallbacks[action] = ended;
      }
      if (
        this._currentAction &&
        this._currentAction.getClip().name !== clip.name
      ) {
        const ca = this._currentAction;
        action.loop = loop;
        action.repeat = repeat;
        action.clampWhenFinished = true;
        //action.timeScale = (reverse) ? -1 : 1;

        if (ca) {
          ca.paused = true;
          if (action.paused) action.paused = false;
          action.crossFadeFrom(ca, .5, true).play();
          ca.fadeOut(.5);

          if (!paused) setTimeout(_ => ca.stop(), 800);
        } else {
          action.play();
        }

      } else {
        action.loop = loop;
        action.repeat = repeat;
        action.play();
      }

      this._currentClip = clip;
      this._currentAction = action;
    }
  }

  action(actionName, startIndex = 0) {
    this._currentSequence = NLA[actionName];
    this._currentIndex = startIndex;
    this.play(this._currentSequence[this._currentIndex])
  }

  saveState() {
    this._originalPos = this.position.clone();
  }

  appear(clip = 0, from = undefined) {
    this.visible = true;
  }

  disappear(clip = 0) {
    if (this.visible) {
      this.stopSound();
      this.visible = false;

    }
  }

  update(delta, elapse = 0) {
    if (this.mesh) {
      //this.mesh.position.y = 1 + Math.sin(0.3 + elapse * (3 + this._effector)) * 0.1;
    }

    const act = ((Math.random() * 10) == 0)
    if (act) {
      this.face.action(8, -1, -1, 100);
    }
    // if (this.overlayGroup && this.overlayGroup.visible) {
    //   this.overlayGroup.rotateY(0.12 * delta);
    // }
    this.face.update(elapse);
    this._mixer.update(delta);

  }

  async loadTracks(scene, name = undefined) {
    scene.name = name;
    return this.__loadAnimations(scene, true);
  }
}

export const SpriteTexture = async (target, src) => {
  const texture = await new THREE.TextureLoader().load(src);
  texture.flipY = false
  return texture;
};


const handleFileLoad = async (...files) => {
  const loader = new GLTFLoader();
  return await new Promise((res, rej) => {
    const results = [];
    const err = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const b = URL.createObjectURL(file)
      loader.load(b, (scene) => {
        console.log(scene);
        results.push(scene);
        if (i == files.length - 1) {
          res({ results, err });
        }
      })
      //reader.readAsArrayBuffer(b)
    };
  })

}
const setupUpload = (reloadClips = undefined) => {
  const uploadInput = document.createElement('input');
  uploadInput.setAttribute('id', 'tomi_upload');
  uploadInput.setAttribute('type', 'file');
  uploadInput.setAttribute('accept', '.glb, .gltf');
  uploadInput.style.display = 'none';
  uploadInput.onchange = async (e) => {
    console.log(e.target);
    if (e.target.files) {
      const res = await handleFileLoad(...e.target.files);
      console.log(res);
      if (res.results.length > 0) {
        res.results.forEach(scene => {
          SceneManager.tomi.loadTracks(scene);
        });
        if (reloadClips) reloadClips();
      }
    }
  }

  uploadInput.oncancel = (e) => {
    console.log('cancelled');
  }


  document.body.append(uploadInput);
  return uploadInput.click();
}
export const formatTime = (secs) => {
  var minutes = Math.floor(secs / 60) || 0;
  var seconds = (secs - minutes * 60) || 0;

  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

const waypoints = `[{"x":2.692347288131714,"y":1.3512234687805176,"z":-1.9569206237792969},
{"x":1.9725112915039062,"y":1.164458990097046,"z":-2.0890021324157715},
{"x":2.636974573135376,"y":1.3711497783660889,"z":-1.4529128074645996},
{"x":4.232120990753174,"y":1.3711497783660889,"z":-1.4529128074645996},
{"x":0.5577804446220398,"y":4.463057518005371,"z":10.336880683898926},
{"x":2.692347288131714,"y":1.3512234687805176,"z":-1.9569206237792969},
{"x":1.9725112915039062,"y":1.164458990097046,"z":-2.0890021324157715},
{"x":2.636974573135376,"y":1.3711497783660889,"z":-1.4529128074645996},
{"x":4.232120990753174,"y":1.3711497783660889,"z":-1.4529128074645996},
{"x":0.5577804446220398,"y":4.463057518005371,"z":10.336880683898926}]`