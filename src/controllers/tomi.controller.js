import * as THREE from "../build/three.module.js";
import * as dat from '../build/dat.gui.module.js';
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";
import { Eyes, Facial, Mouths, MouthSeq } from "./tomi.facial.js";
import { SceneManager } from "./view.js";

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
export class TOMIController extends THREE.Object3D {
  constructor(mesh = undefined, scale = 1) {
    super();
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
    this._pane;
   
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

  showProps(state = true) {
    const self = this;
    const Face = this.face;
    const faceProps = {
      mouthIndex: 0,
      wink: ()=>{
       Face._maxLip = 7
      }
    }

    if (!this._pane && state) {
      let mouths = [... Object.keys(Mouths)];
     mouths[mouths.length-1] ='talks';
      const gui = new dat.gui.GUI();
      const face_group = gui.addFolder('Face')
      const stateCtl = face_group.add(this.face,'state', this.face.states);
      stateCtl.onChange((value)=>{
        self.face.setState(value);
      })
     const mouthCtl = face_group.add(faceProps, 'mouthIndex', 0, MouthSeq.length-1).step(1)
     mouthCtl.onChange((value)=>{
       console.log(value)
        Face._lipId = value;
        Face.update()
      })

      gui.add(faceProps, 'wink').name('Wink')

      face_group.add(this.face, 'talking').onChange(value=>{
        mouthCtl.enabled = !value;
      });

      const anim_group = gui.addFolder('Animations');
      const animClips =[];
      this._clips.forEach(n=>{
        animClips.push(n.name)
      });
      const AnimProp = {
        loop: THREE.LoopRepeat,
        clips:  animClips,
        currentClip: ''
      }
      anim_group.add(AnimProp, 'loop', [THREE.LoopOnce, THREE.LoopRepeat, THREE.LoopPingPong])
      anim_group.add(AnimProp, 'currentClip', animClips).onChange(value => {
        console.log(value);
        self.play(value, AnimProp.loop);
      })
      
      

      this._pane = gui;
    } else {
      if (state) this._pane.show()
     else  this._pane.hide();
    }
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
      const p = self.setupAnalyzer();
      this._analyzer = p.analyser;
      this._analyzerTM = p.Analyze;
    })
  }

  async loadSound(src, autoPlay = true) {
    return await new Promise((res, rej) =>{
      const snd = new Howl({
        src: [...src],
        html5: true,
      });
      const p = this.setupAnalyzer();
      this._analyzer = p.analyser;
      this._analyzerTM = p.Analyze;

      if (autoPlay) {
        snd.on('play', (e)=> {
          res(snd);
        });
        snd.play()
      } else {
        res(snd);
      }
    })
  }

  bind(mesh, scale = 1) {
    this.mesh = mesh;
    // this._reflect = new THREE.CubeCamera(-1, 1000, )
    // this.add(this._reflect)
    // SceneManager._reflect.position.set(0, 0, 0)
    const group = new THREE.Object3D();
    group.add(mesh);

    this.add(group);
    // mesh.scale.set(scale, scale, scale);
    const self = this;

    const shield = new THREE.MeshPhongMaterial({
      // side: THREE.DoubleSide,
      shininess: 100,
      color: 0xffffff,
      specular: 0xffffff,
    });
    const hat = shield.clone()
    //SceneManager._reflect.texture.needsUpdate = true;

    const blue = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.5,
      emissive: 0x59F4F6,
      side: THREE.DoubleSide
    });

    const faceMat = new THREE.MeshBasicMaterial({
      map: self.face.texture,
    })

    // new THREE.TextureLoader().load("/models/texture/e.jpg", (t) => {
    //   shield.envMap = t;
    // });


    mesh.traverse((n) => {
      if (n.type.endsWith("esh")) {
        if (n.material) {
          n.material.side = THREE.DoubleSide;
          n.material.transparent = true;
        }
        if (n.name === "hat" && n.material.name === 'hat_mat') {
          n.material = hat
        } else {

          //sconsole.log('mat', n.material.name, n.material.map);
          if (n.material.name === "body_mat") {
            shield.map = n.material.map;
            n.material = shield;
          } else if (n.material.name === "blue_mat") {
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
            etc.map = n.material.map;
            etc.color = n.material.color;
          }
        }
      }
    });
    //SceneManager._reflect.texture.needsUpdate = true;
    mesh.position.set(0, 1, 0);
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
    if (eyeLevel) target.y = this.mesh.position.y;
    this.mesh.lookAt(target)

  }

  async __loadAnimations(scene, onlyClips = false) {
    console.log(scene.animations);
    if (onlyClips) {

      scene.animations.forEach(clip=>{
        clip.name += this._clips.length;
        this._clips.push(clip);
      });
      return
    }
    this._clips.push(...scene.animations);
    const mixer = new THREE.AnimationMixer(this.mesh);

    mixer.timeScale = 1;
    //this._clips = scene.animations;
    const self = this;
    mixer.addEventListener("finished", (e) => {

      // if (this._currentAction) {
      //   this._currentAction.fadeOut(1.2);
      // }


      self.nextAction()

    });
    mixer.addEventListener("loop", (e) => {
      this._currentIndex = 0;
      self.dispatchEvent({ type: "animationend" });
    });
    this._mixer = mixer;
  }

  nextAction() {
    if (this._currentSequence && this._currentIndex < this._currentSequence.length) {
      this._currentIndex++;
      console.log("Actions", this._currentIndex)
      this.play(this._currentAction[this._currentIndex])
    } else {
      this._currentIndex = 0;
      this.dispatchEvent({ type: "animationend" });
    }
  }

  randomClip() {

    if (this._clips.length < 1)
      return
    const animationId = Math.min(
      this._clips.length - 1,
      Math.round(Math.random() * this._clips.length)
    );

    this.play(animationId, THREE.LoopRepeat);
  }

  play(clipNameOrIndex, loop = THREE.LoopOnce, repeat = 10) {
    let clip;
    if (typeof clipNameOrIndex === 'number') {
      clip = this._clips[clipNameOrIndex]
    } else {
      clip = THREE.AnimationClip.findByName(this._clips, clipNameOrIndex);
    }


    //this._mixer.timeScale = 1;
    if (clip) {
      const action = this._mixer.clipAction(clip);

      if (
        this._currentAction &&
        this._currentAction.getClip().name !== clip.name
      ) {
        const ca = this._currentAction;
        action.loop = loop;

        action.play();
        ca.stop();
        setTimeout((_) => ca.stop(), 2000);
      } else {
        action.loop = loop;
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

  playSound(audioIndex, syncClip = -1) {
    if (this._sounds[audioIndex]) {
      this._syncClip = syncClip;
      this._sound.src = this._sounds[audioIndex]
     
      this._sound.play()
    }
  }

  update(delta, elapse = 0, md = undefined) {
    if (this.mesh) {
      //this.mesh.position.y = 1 + Math.sin(0.3 + elapse * (3 + this._effector)) * 0.1;
    }
    if (this._analyzerTM) {
      this._analyzerTM(delta)
      console.log(this._dataArray[1])
    }
    this.face.update(elapse);
    this._mixer.update(delta);
  }

  async loadTracks(scene) {
    return this.__loadAnimations(scene, true)
  }

  __faceIndex(actions = "idle") {
    return;
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

  setupAnalyzer(sound = undefined) {
    const analyser = Howler.ctx.createAnalyser();
  //  const volume = Howler.ctx.createGain();
  //  volume.gain.value =1;
    // Connect master gain to analyzer
    Howler.masterGain.connect(analyser);

    // Connect analyzer to destination
    analyser.connect(Howler.ctx.destination);

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get the Data array
    //analyser.getByteTimeDomainData(dataArray);
    const self = this;
    const Analyze = (ms = 0) => {
      analyser.getByteTimeDomainData(dataArray);
     // console.log(dataArray[0], dataArray[511], dataArray[1023]);
      console.log(JSON.stringify(Object.values(dataArray)));
     return dataArray
    }
   
    this._analyzer = analyser;
    return {
      analyser,
      Analyze,
      dataArray
    }
  }
}

export const SpriteTexture = async (target, src) => {
  const texture = await new THREE.TextureLoader().load(src);
  texture.flipY = false
  return texture;
};
