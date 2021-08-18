
import * as THREE from "/build/three.module.js";
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";

const bonesRef = [
  "Root",
  "Body_1",
  "ArmL",
  "HandL",
  "ArmR",
  "HandR",
  "Hat_Main",
  "Index_Thumb01L",
  "Index_Finger01L",
  "Index_Little01L",
  "Index_Thumb01R",
  "Index_Finger01R",
  "Index_Little01R",
];

const faceActions = {
  idle: { x: 0, y: 2 },
  smile: { x: 3, y: 2 },
  curious: { x: 0, y: 1 },
  talk: { x: 0, y: 0 },
  talk2: { x: 1, y: 3 },
  joy: { x: 1, y: 2 },
  dead: { x: 1, y: 1 },
  angry: { x: 1, y: 0 },
  sad: { x: 2, y: 2 },
  duh: { x: 2, y: 1 },
  annoyed: { x: 2, y: 0 },
  happy: { x: 1, y: 2 },
  error: { x: 3, y: 1 },
  amazed: { x: 0, y: 3 },
};

function haveAny(ref) {
  for (let i = 0; i < bonesRef.length; i++) {
    const b = bonesRef[i].toLowerCase();
    if (ref.startsWith(b)) {
      return b;
    }
  }
  return;
}

export class ActionTrigger {
  constructor(clipName = undefined, frame = undefined, duration = undefined) {
    this.clipName = clipName;
    this.frame = frame;
    this.duration = duration;
  }
}
export class ActionSet {
  constructor(model, label = undefined) {
    this._model = model;
    this.label = label;
    this._actions = {};
    this.defaultAction;
    this._currentAction;
  }

  addAction(clipName, frame, duration, defaultAction = false) {
    this._actions[clipName] = new ActionTrigger(clipName, frame, duration);
    if (defaultAction) this.defaultAction = this._actions[clipName];
  }

  playAction(clipName) {
    this._currentAction = this._actions[clipName];
    this._model.play(this._currentAction.name)
  }

  get actions() {
    return this._actions[clipName]
  }

  update(frame) {
    if (!this._currentAction && this._actions[frame]) {
      this._currentAction = this.actions[frame];
    }
    if (this._currentAction) {
      if (this._currentAction.duration > 0 && frame >= (frame + this._currentAction.duration)) {

      }
    }
  }

}

export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined, scale = 1) {
    super();
    this._mixer = null;
    this._clips = null;
    this._actionSet = {}
    this.mesh = mesh.scene || mesh;
    this.states = {};
    this._state = "idle";
    this._face = null;
    this.bones = {};
    this.rigs = {};
    this.useAnimations = true;
    this._currentClip = null;
    this._currentAction = null;
    this._resetPose = false;
    this._faceTexture = null;
    this._faceState = 'idle';
    this._talking = true;
    this._lastElapse = 0;
    this._effector = 0;
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

  bind(mesh, scale = 1) {
    // this.mesh = mesh;
    const group = new THREE.Object3D();
    group.add(mesh);
    this.add(group);
    const self = this;

    const shield = new THREE.MeshPhysicalMaterial({
      metalness: 0.5,
      roughness: 0.4,
    });

    const blue = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      emissive: 0xffffff,
    });

    new THREE.TextureLoader().load("/models/texture/e.jpg", (t) => {
      shield.envMap = t;
    });


    const eye = new THREE.MeshLambertMaterial({
      //map: self._faceTexture,

    });

    //dsconsole.log("yyyyy",textures);
    mesh.traverse((n) => {
      if (n.type.endsWith("esh")) {
        if (n.name == "facexxx" || n.name == "xxxbody_15") {
          SpriteTexture(n, "/models/texture/faces.png")
            .then((texture) => {
              texture.flipY = false;
              self._faceTexture = texture;
              self._faceTexture.flipY = false;
              self.__faceIndex("talk");
              const faceMat = new THREE.MeshLambertMaterial({
                map: self._faceTexture,
                // emissive: 0x58F4F5,
              });
              n.material = faceMat;
            })
            .catch((e) => console.warn(e));
        } else {

          //sconsole.log('mat', n.material.name, n.material.map);
          if (n.material.name === "Material #63") {
            shield.map = n.material.map;
            n.material = shield;
          } else if (n.material.name === "Material #10") {
            blue.map = n.material.map;
            blue.alphaMap = n.material.alphaMap;

            n.material = blue;
          } else if (n.material.name.startsWith('eye')) {

            eye.map = n.material.map;
            eye.alphaMap = n.material.alphaMap;
            n.material = eye;

          } else {
            n.material.side = THREE.DoubleSide;
            n.material.transparent = true;
          }
        }
      }
    });
    mesh.position.set(0, 1, 0);
    this.__init(mesh);
    window.addEventListener('keydown', (e) => {

      if (e.key == 't') this.randomClip();
    })
  }

  applyTextures() {


  }

  async load(
    src = "./models/tomi.glb",
    progress = undefined,
    compressed = false
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
    if (eyeLevel) target.y = 1;
    super.lookAt(target)

  }

  async __loadAnimations(scene, onlyClips = false) {
    console.log(scene.animations);
    if (onlyClips) {

      const clip = scene.animations[0];
      clip.name += this._clips.length;
      clip.tracks.splice(2, 2);
      this._clips.push(clip);
      return
    }

    const mixer = new THREE.AnimationMixer(this.mesh);

   // mixer.timeScale = 0.5;

    this._clips = scene.animations;
    const self = this;
    mixer.addEventListener("finished", (e) => {
      if (this._currentAction) {
        this._currentAction.fadeOut(1.2);
      }
      self.dispatchEvent({ type: "animationend" });
    });
    mixer.addEventListener("loop", (e) => {
      self.dispatchEvent({ type: "animationend" });
    });
    this._mixer = mixer;
  }

  randomClip() {
    if (this._clips.length < 1)
      return
    const animationId = Math.min(
      this._clips.length - 1,
      Math.round(Math.random() * this._clips.length)
    );
    console.log(animationId);
    let name = this._clips[animationId].name;
    if (parseInt(name)) name = "hand.idle";
    this.play(name);
  }

  play(clipName, loop = THREE.LoopPingPong, repeat = 10) {
    const clip = THREE.AnimationClip.findByName(this._clips, clipName);
    this._mixer.timeScale = 1;
    if (clip) {
      const action = this._mixer.clipAction(clip);
      if (
        this._currentAction &&
        this._currentAction.getClip().name !== clipName
      ) {
        const ca = this._currentAction;

        action.loop = loop;
        action.play();
        action.fadeIn(1.2);
        ca.fadeOut(1.2);

        setTimeout((_) => ca.stop(), 2000);
      } else {
        action.loop = loop;
        action.play();
      }
      this._currentClip = clip;
      this._currentAction = action;
    }
  }

  update(delta, elapse = 0, md = undefined) {
    if (this.mesh) {
      //this.mesh.position.y = 1 + Math.sin(0.3 + elapse * (3 + this._effector)) * 0.1;
    }


    const d = (elapse - this._lastElapse);// * this._mixer.timeScale;
    //console.log(d);
    this._mixer.update(delta);
    const self = this;
    if (d >= .25) {

      this._lastElapse = elapse;
      const state = this._faceState;
      self.__faceIndex(state);
      if (this._talking) {
        const r = Math.random() * 5;
        if (r < 1) this._faceState = 'smile';
        else if (r >= 1 && r < 3) this._faceState = 'joy';
        else this._faceState = (state == 'talk') ? 'talk2' : 'talk';
      }
    }
  }

  async loadTracks(mesh) {
    return await this.__loadAnimations(mesh, true)
  }

  __faceIndex(actions = "idle") {
    return
    if (typeof actions === "string") actions = faceActions[actions];
    let x = actions.x;
    let y = actions.y;
    y = Math.min(y, this._faceDim.row);
    x = Math.min(x, this._faceDim.col);
    const texture = this._faceTexture;
    texture.repeat.x = 1 / this._faceDim.col;
    texture.repeat.y = 1 / this._faceDim.row;
    texture.offset.x = actions.x / this._faceDim.col;
    texture.offset.y = (actions.y / this._faceDim.row) - 1;
  }
}
