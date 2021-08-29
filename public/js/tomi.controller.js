import * as THREE from "../build/three.module.js";
import { GLTFLoader } from "../js/GLTFLoader.js";

export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined, scale = 1, envMap = undefined) {
    super();
    this._mixer = null;
    this._clips = [];
    this._actionSet = {}
    this.states = {};
    if(mesh)this.mesh = mesh.scene || mesh;
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
      this.bind(this.mesh, scale, envMap)
      if (mesh.animations) {
        this.__loadAnimations(mesh);
      }
    }
  }

  bind(mesh, scale = 1, envMap = undefined) {
    this.mesh = mesh;
    const group = new THREE.Object3D();
    group.add(mesh);
    console.log(mesh.scale)
    //group.rotation.set(degToRad(-90), degToRad(0), degToRad(-90))
    this.add(group);
    // mesh.scale.set(scale, scale, scale);
    const self = this;

    this.shield = new THREE.MeshPhysicalMaterial({
      metalness: 0.5,
      roughness: 0.4,
      envMap : envMap
    });

    const blue = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      emissive: 0xffffff,
    });

    //new THREE.TextureLoader().load("../models/texture/e.jpg", (t) => {
    //  shield.envMap = t;
   // });


    const eye = new THREE.MeshLambertMaterial({
      //map: self._faceTexture,
    });
    
    mesh.traverse((n) => {
      if (n.type.endsWith("esh")) {
        if (n.name == "facexxx" || n.name == "xxxbody_15") {
          SpriteTexture(n, "../models/texture/faces.png")
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

            // n.material.emissive = 0x58F4F5;
            eye.map = n.material.map;
            eye.alphaMap = n.material.alphaMap;
            n.material = eye;
            //n.material.transparent = true;
            //n.material.emissive = 0x58F4F5;
          }
          if (n.material) {
            if(n.material.envMap && envMap)n.material.envMap = envMap;
            n.material.side = THREE.DoubleSide;
            n.material.transparent = true;
          }
          // } else if(n.material.name === 'Material #63') {
          //   n.material = body
          //   n.material.map = textures[0];
          // }  else if(n.material.name === 'Material #10') {
          //   n.material = blue;
          // }
        }
      }
    });
    mesh.position.set(0, 1, 0);
    this.__init(mesh);
    window.addEventListener('keydown', (e) => {

      if (e.key == 't') this.randomClip();
    })
  }

  async load(
    src = "../models/tom.gltf",
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
      clip.tracks.splice(3, 1)
      this._clips.push(clip);
      return
    }

    const mixer = new THREE.AnimationMixer(this.mesh);

    mixer.timeScale = 1;
    //this._clips = scene.animations;
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

    let name = this._clips[animationId].name;
    if (parseInt(name)) name = "hand.idle";
    this.play(name);
  }

  play(clipName, loop = THREE.LoopPingPong, repeat = 10) {
    const clip = THREE.AnimationClip.findByName(this._clips, clipName);
    //this._mixer.timeScale = 1;
    if (clip) {
      const action = this._mixer.clipAction(clip);

      // action.timeScale = 1 * this._mixer.timeScale;

      //action.repetitions = repeat;
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
    this._mixer.update(delta) ;
  }

  async loadTracks(scene) {
    return this.__loadAnimations(scene, true)
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

export const SpriteTexture = async (target, src) => {
  const texture = await new THREE.TextureLoader().load(src);
  texture.flipY =false
  return texture;
};
