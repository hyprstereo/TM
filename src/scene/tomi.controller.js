import { degToRad } from "../utils/helpers.js";
import * as THREE from "../build/three.module.js";
import {
  IK,
  IKHelper,
  IKBallConstraint,
  IKChain,
  IKJoint,
} from "../build/three.ik.js";

import { SpriteTexture, Tomi } from "./tomi.js";
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

export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined) {
    super();
    this._mixer = null;
    this._clips = null;
    this.mesh = mesh;
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
      this.bind(mesh);
    }
  }

  bind(mesh) {
    this.mesh = mesh;
    this.add(mesh);
    const self = this;
    console.log(mesh);
    const shield = new THREE.MeshPhysicalMaterial({
      metalness: 0.5,
      roughness: 0.4,
    });
    new THREE.TextureLoader().load("/models/texture/e.jpg", (t) => {
      shield.enMap = t;
    });
    mesh.traverse((n) => {
      if (n.type.endsWith("esh")) {
        if (n.name == "face") {
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
          if (n.material.name === "white_shd") {
            shield.map = n.material.map;
            n.material = shield;
          }
        }
      }
    });
    mesh.position.set(0, 1, 0);
    this.__init(mesh);
  }

  async load(
    src = "./models/tomi-anim2.glb",
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

  createTarget(position) {
    const gizmo = new THREE.TransformControls(
      this.camera,
      this.renderer.domElement
    );
    const target = new THREE.Object3D();
    gizmo.setSize(0.5);
    gizmo.attach(target);
    gizmo.target = target;
    target.position.copy(position);

    this.scene.add(gizmo);
    this.scene.add(target);
    this.gizmos.push(gizmo);
    this.frame = 0;

    gizmo.addEventListener("mouseDown", () => (this.controls.enabled = false));
    gizmo.addEventListener("mouseUp", () => (this.controls.enabled = true));
    Tomi.createTarget(tomi.bones["ArmR"]);

    return target;
  }

  __init(m) {
    m.layers.set(2);
    const self = this;
    m.traverse((node) => {
      if (node.type === "Bone") {
        let arr = bonesRef.join(" ");
        const name = node.name;
        if (arr.search(name) > -1) {
          this.bones[name] = node;
        }
      }
    });
  }

  lookAt(target, eyeLevel = true) {
    if (target instanceof THREE.Object3D) {
      target = target.position.clone();
    }
    if (eyeLevel) target.y = 1;
    super.lookAt(target)

  }

  async __setupIK(root, ...bones) {
    const constraints = [new IKBallConstraint(80)];
    let prevIK = root;
    bones.forEach((b, i) => {
      const j = new IKJoint(b, contraints);
      prevIK.add(j);
      prevIK = j;
    });
  }

  async __loadAnimations(scene) {
    console.log(scene.animations);
    const mixer = new THREE.AnimationMixer(this.bones["Root"]);
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
    console.log("play", clipName);
    if (clip) {
      const action = this._mixer.clipAction(clip);
      action.timeScale = clipName === "hand.idle" ? 1 : 1.5;

      //action.repetitions = repeat;
      if (
        this._currentAction &&
        this._currentAction.getClip().name !== clipName
      ) {
        const ca = this._currentAction;
        //ca.stop();
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

  update(delta, elapse = 0) {
    if (this._currentAction) this._mixer.update(delta);

    if (this.mesh) {
      this.mesh.position.y = 1 + Math.sin(0.3 + elapse * (3 + this._effector)) * 0.1;
    }

    const d = (elapse - this._lastElapse) ;
    //console.log(d);
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

  __faceIndex(actions = "idle") {
    if (typeof actions === "string") actions = faceActions[actions];
    let x = actions.x;
    let y = actions.y;
    y = Math.min(y, this._faceDim.row);
    x = Math.min(x, this._faceDim.col);
    const texture = this._faceTexture;
    texture.repeat.x = 1 / this._faceDim.col;
    texture.repeat.y = 1 / this._faceDim.row;
    texture.offset.x = actions.x / this._faceDim.col;
    texture.offset.y = actions.y / this._faceDim.row;
  }
}
