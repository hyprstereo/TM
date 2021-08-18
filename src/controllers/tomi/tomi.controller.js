import * as THREE from "/build/three.module.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";
import { Facial } from "./tomi.facial.js";
import { SceneManager } from "../view.js";
import { ExportToGLTF, loadTextures } from "../../scene/props.js";
import { SaveString } from "../../utils/helpers.js";
import { ActionSets } from "../actions.js";
import { TomiPositions } from "../../scene/debug.js";

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

const ActionClip = {
  greeting: 0,
  idle: 1,
  idle_afk: 2,
  talk: 3
}

const NLA = {
  intro: [ActionClip.idle, ActionClip.greeting, ActionClip.talk, ActionClip.idle_afk]
}


export const TomiFace = Facial();
TomiFace.Face.reset();

export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined, scale = 1) {
    super();
    this._autoAnimate = false;
    this._facial = TomiFace;
    this._mixer = null;
    this._sounds = [];
    this._clips = [];
    this._currentSequence = NLA.intro
    this._actionSet = {}
    this._sound;
    this.mesh = mesh.scene || mesh;
    this.states = {};
    this._state = "idle";
    this._face = null;
    this.bones = {};
    this.rigs = {};
    this.useAnimations = true;
    this._currentClip = null;
    this._currentAction = null;
    this._currentIndex = 0;
    this._resetPose = false;
    this._faceTexture = null;
    this._faceState = 'idle';
    this._talking = false;
    this._lastElapse = 0;
    this._effector = 0;
    this._syncClip = -1;
    this._reflect = null;
    this._cubeRT = null;
    this._defaultClip = 1;
    this._actionCallbacks = {};
    this._root;
    this.dataArray;
    this.analyser;
    this._animating = false;
    this._currentActions = [];
    this._mainMaterials = null;
    this._autoAnimTM = null;
    this._lookTarget = new THREE.Vector3();
    // this.actions = ActionProps(this, this.face);
    this._animSets = [this.actions.talkAction, this.actions.talkAction2, this.talkAction3, this.talkAction4,
    this.actions.eureka, this.actions.talkAction, this.actions.talkAction2, this.talkAction3, this.talkAction4,
    this.actions.eureka];
    this._faceDim = {
      col: 4,
      row: 4,
    };
    if (mesh) {
      this.bind(this.mesh, scale)
      if (mesh.animations) {
        this.__loadAnimations(mesh);
      }
    }
  }

  set selfAware(state) {
    const self = this;
    if (!state) {
      if (self._autoAnimTM) {
        clearInterval(self._autoAnimTM);
        self._autoAnimTM = null;
      }
    } else {

      self._autoAnimTM = setInterval(_ => {
        const list = ["talkAction", "talkAction2", "talkAction3", "talkAction4", "eureka", "thinking", "sigh"]
        const id = Math.min(Math.round(Math.random() * list.length), list.length - 1);
        self.actions(list[id]);
      }, 1500);

    }
  }

  get selfAware() {
    return (this._autoAnimTM !== null);
  }

  defineActions(actions = {}) {
    this._actions = actions;
  }

  actions(actionName) {
    return this._actions[actionName] || null;
  }



  get face() {
    return this._facial.Face;
  }

  set face(f) {
    this._facial.Face = f
  }

  get facial() {
    return this._facial;
  }

  set facial(f) {
    this._facial = f
  }

  addSound(...src) {
    this._sounds.push(...src);
    this._sound = new Howl({
      src: this._sounds,
      html5: true,
      autoUnlock: true
    });
    const self = this;

    this._sound.on('play', (e) => {
      if (self._syncClip > -1) {
        self.play(self._syncClip);
      }
    })
  }

  async loadSound(src, autoPlay = true) {
    return await new Promise((res, rej) => {
      const snd = new Howl({
        src: [src],
        useWebAudio: true,
        html5: true,
        autoplay: false,
      });
      let tm;


      if (autoPlay) {

      } else {
        res(snd);
      }
    })
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

  moveTo(newPos, tween = true, lookAt = undefined) {
    if (tween) {
      const tpos = { ...newPos }
      tpos.y -= .5;
      const self = this;
      gsap.to(this.position, {
        ...tpos, duration: 2, onComplete: () => {
          gsap.to(this, { ...newPos, duration: 2, ease: 'sine.out' });
        }, onUpdate: () => {
          if (lookAt) {
            self.lookAt(lookAt, true);
          }
        }
      })
    }
    return this;
  }

  moveToRef(index = 0) {
    const ref = SceneManager.ioc._pos[index];
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

  async bind(mesh, scale = 1, reflect = false) {
    const city = new THREE.TextureLoader().load('/models/tomi/city_02.jpg');
    city.flipY = false;
    city.encoding = THREE.sRGBEncoding;
    city.mapping = THREE.EquirectangularReflectionMapping

    this.mesh = mesh;
    this.add(mesh);
    mesh.position.set(0, 0, 0);
    if (reflect) {
      this._cubeRT = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBFormat,
        generateMinmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding,
      })
      //this._cubeRT.texture.mapping = THREE.EquirectangularReflectionMapping
      this._reflect = new THREE.CubeCamera(-1, 1000, this._cubeRT);
      this.add(this._reflect);
      this._reflect.position.set(0, 0, 0);

      SceneManager.scene.background = this._cubeRT.texture;
    } else {
      SceneManager.scene.background = city;
    }
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

    const shield = new THREE.MeshPhysicalMaterial({
      // side: THREE.DoubleSide,
      combine: THREE.MultiplyOperation,
      reflectivity: 0.8,
      map: body,
      envMap: reflect ? this._cubeRT.texture : city,
      normalMap: bodyNormal,
      roughnessMap: brough,
      metalnessMap: bmetal,
      roughness: 0.9,
      metalness: 1,
      color: 0xffffff,
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

    const faceMat = new THREE.MeshBasicMaterial({
      map: self.face.texture,
      envMap: city,
      reflectivity: 0.1
    })

    // new THREE.TextureLoader().load("/models/texture/e.jpg", (t) => {
    //   shield.envMap = t;
    // });


    mesh.traverse((n) => {
      if (n.name.startsWith('Root')) {
        this._root = n;
      }
      if (n.type.endsWith("esh")) {
        if (n.material) {
          n.material.side = THREE.DoubleSide;
          n.material.transparent = true;
        }
        n.castShadow = n.receiveShadow = true;
        if (n.name === "hat" && n.material.name === 'hat_mat') {
          n.material = hat
        } else {

          //sconsole.log('mat', n.material.name, n.material.map);
          if (n.material.name.startsWith('Material #63') || n.material.name === "body_mat") {
            //shield.map = n.material.map;
            n.material = shield;
          } else if (n.material.name.startsWith("Material #10")) {
            blue.map = n.material.map;
            blue.alphaMap = n.material.alphaMap;
            blue.transparent = true;
            n.material = blue;
          } else if (n.material.name === 'face_mat') {

            n.material = faceMat;
            self.face.update()
            //self.facial.UpdatePath('left', 'happy')
          } else {
            const etc = shield.clone()
            //etc.map = n.material.map;
            etc.color = n.material.color;
          }
        }
      } else if (n.type == 'Bones') {
        if (n.name.startsWith('Hand')) {
          const pl = new THREE.PointLight(0x00cbfe, 0.4, 0.1);
          n.add(pl);
        }
      }
    });
    //SceneManager._reflect.texture.needsUpdate = true;
    //mesh.position.set(0, 1, 0);
    this.__init(mesh);
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
    m.layers.set(2);
    const self = this;
  }

  lookAt(target, eyeLevel = true) {
    if (target instanceof THREE.Object3D) {
      target = target.position.clone();
    }
    if (eyeLevel) target.y = this.position.y;
    this.mesh.lookAt(target)

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

  appear(clip = 0) {
    if (!this.visible) {
      this.visible = true;
      this.play(clip);
    }
  }

  disappear(clip = 0) {
    if (this.visible) {
      this.stopSound();
      this.visible = false;
    }
  }

  startAnalyze() {
    const mod = 128;
    const mx = 5;
    const self = this;
    if (!this.__tm) {
      this.__tm = setInterval(_ => {
        self.analyser.getByteTimeDomainData(self.dataArray);
        const id = self.dataArray[512] % mod;
        const mouthIndex = Math.round(id / mod * mx)
        self.face.setLip(mouthIndex);
      }, 100);
    }
    return this.__tm;
  }

  async playSound(src, autoSpeak = true) {
    return await new Promise((res, rej) => {
      if (this._sounds[src]) {
        this._sound = this._sounds[src];
        if (this._sound.playing) {
          this._sound.stop()
        }
        res(this._sound);
        return
      }
      const self = this;
      this.face.useAudio = autoSpeak;
      this._sound = new Howl({
        src: src,
        autoplay: false,
        userWebAudio: true,
        onplay: () => {
          self.face.talking = (self.face.useAudio);
          if (!self.analyser) self.setupAnalyzer()
          if (self.face.useAudio) self.startAnalyze();
          // if (!this._aa) {
          //   this._aa = true;
          // } else {
          //   if (self._autoAnimate && self.face.talking) 
          //     self.randomClip();
          // }

          // self.play(0);
          //self.dispatchEvent({ type: 'audioplay' });
        },
        onstop: () => {
          if (self.__tm) {
            clearInterval(self.__tm);
            self.__tm = null;
          }
          self.face.talking = false;
          //self.dispatchEvent({ type: 'audiostop' });
        },
        onended: () => {
          if (self.__tm) {
            clearInterval(self.__tm);
            self.__tm = null;
            self.face.talking = false;
            //self.dispatchEvent({ type: 'audioend' });
          }
        }
      });

      this._sound.once('load', () => {
        res(self._sound);
      })
      this._sounds[src] = this._sound;

    });
  }

  soundPosition(tm = 0) {
    if (this._sound) {
      this._sound.pause();
      this._sound.pos = tm;
      this._sound.play();
    }
  }

  disableAutoSpeak() {
    if (this.__tm) {
      clearInterval(this.__tm);
      this.__tm = null;
    }
  }

  soundDuration() {
    if (this._sound && this._sound.playing) {
      const seek = this._sound.seek() || 0;
      const timeDisplay = formatTime(Math.round(seek));
      const duration = this._sound.duration();
      return { timeDisplay, seek, duration }
    }
    return null;
  }

  stopSound() {
    if (this._sound && this._sound.playing) {
      this._sound.stop();
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
    this.face.update(elapse);
    this._mixer.update(delta);

  }

  async loadTracks(scene, name = undefined) {
    scene.name = name;
    return this.__loadAnimations(scene, true);
  }


  setupAnalyzer(source = undefined) {
    if (source instanceof HTMLVideoElement) {
      const ctx = new webkitAudioContext();
      const n = ctx.createMediaElementSource(source);
      this.analyser = ctx.createAnalyser();
      n.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    } else {
      this.analyser = Howler.ctx.createAnalyser();
      Howler.masterGain.connect(this.analyser);
      this.analyser.connect(Howler.ctx.destination);

    }

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    // Get the Data array
    this.analyser.getByteTimeDomainData(this.dataArray);
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