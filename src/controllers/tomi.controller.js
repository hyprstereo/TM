import * as THREE from "../build/three.module.js";
import * as dat from '../build/dat.gui.module.js';
import { GLTFLoader } from "../jsm/loaders/GLTFLoader.js";
import { Facial } from "./tomi.facial.js";
import { SceneManager } from "./view.js";
import { ExportToGLTF, loadTextures } from "../scene/props.js";
import { SaveString } from "../utils/helpers.js";
import { SceneConfig } from "../app.js";



const ActionClip = {
  greeting: 0,
  idle: 1,
  idle_afk: 2,
  talk: 3
}
const NLA = {
  intro: [ActionClip.idle, ActionClip.greeting, ActionClip.talk, ActionClip.idle_afk]
}

const ActionProps = (Ctx, Face) => ({
  running: false,
  wink: () => {
    Face.action(8, Face._eyeRight, -1, 250);
  },
  blink: () => {
    Face.action(9, 9, -1, 100);
  },
  grin: () => {
    Face.action(3, -1, -1, 2000);
  },
  error: () => {

    const p = SceneManager.tomi.root.position.clone();
    p.x = SceneManager.tomi.position.x;
    let t = setInterval(_ => {
      p.y = SceneManager.tomi.root.position.y + 1.78;
      SceneManager.controls.lookAt(p);
    }, 25)

    Face.action(10, -1, 7, 0);
    Ctx.play(23, THREE.LoopOnce, 0, () => {
      console.log('error end');
      Face.reset();
      if (t) {
        clearInterval(t);
        t = null;
      }
      const pp = SceneManager.tomi.position.clone()
      pp.y = 1.48;
      SceneManager.controls.lookAt(pp)


    });

  },
  sigh: () => {
    Ctx.play(25);
    Face.action(9, -1, 6, 2000);
  },
  serious: (d = 3000) => {
    Ctx.play(18, THREE.LoopRepeat, 5);
    Face.action(6, -1, 1, d);
  },
  thinking: () => {
    Ctx.play(21, THREE.LoopRepeat);
    Face.action(9, -1, 0, 1000);
  },
  eureka: () => {
    Ctx.play(22, THREE.LoopPingPong, 1);
    Face.action(5, -1, 5, 1200);
  },
  talkAction: (index = 14) => {
    Ctx.play(index);
  },
  talkAction2: () => {
    Ctx.play(15);
  },
  talkAction3: () => {
    Ctx.play(16);
  },
  talkAction4: () => {
    Ctx.play(17);
  }
})

export const TomiProp = {
  StartingPos: new THREE.Vector3(0, 0, 0),
  Face: {
    eyesIndex: 0,
    defaultLipIndex: 0,
    talking: true,
  },
  Animation: {
    clip: '',
    loop: THREE.LoopOnce,
    loopCount: 0,
    blendTime: 0.8,
  }
}

export const TomiFace = Facial();
TomiFace.Face.reset();

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
    this._defaultClip = 1;
    this._actionCallbacks = {};
    this._root;
    this.dataArray;
    this.analyser;
    this._animating = false;

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
    let animClips = [];
    const reload = () => {
      animClips = []
      SceneManager.tomi._clips.forEach((n, i) => {
        animClips.push(`[${i}] ${n.name}`);
      });
      return animClips;
    }

    const faceProps = {
      mouthIndex: 0,
      eyesIndex: 0,
      ...ActionProps(this, Face),
    }

    const Tom = {
      position: SceneConfig.TomiInitialPosition,
    }

    if (!this._pane && state) {
      const gui = new dat.gui.GUI();
      const te_group = gui.addFolder('Tomi')
      te_group.add(Tom, 'position', Tom.position).onChange(v => {
        this.position.copy(v);
      })
      const face_group = gui.addFolder('Face')

      const mouthCtl = face_group.add(faceProps, 'mouthIndex', 0, this.face.lips.length - 1).step(1)
      mouthCtl.onChange((value) => {
        Face.setLip(value);
      })
      const eyeshCtl = face_group.add(faceProps, 'eyesIndex', 0, this.face.eyes.length - 1).step(1)
      eyeshCtl.onChange((value) => {
        Face.setEyes(value, value);
      })

      face_group.add(this.face, 'talking').onChange(value => {
        mouthCtl.enabled = !value;
      });
      const actionGroup = gui.addFolder('Actions')
      actionGroup.add(faceProps, 'talkAction').name('Talk');
      actionGroup.add(faceProps, 'talkAction2').name('Talk #2');
      actionGroup.add(faceProps, 'talkAction3').name('Talk #3');
      actionGroup.add(faceProps, 'talkAction4').name('Talk #4');
      actionGroup.add(faceProps, 'thinking').name('Thinking');
      actionGroup.add(faceProps, 'eureka').name('Eureka');
      actionGroup.add(faceProps, 'sigh').name('Sigh');
      actionGroup.add(faceProps, 'grin').name('Grin');
      actionGroup.add(faceProps, 'error').name('Error');
      actionGroup.add(faceProps, 'wink').name('Wink');
      actionGroup.add(faceProps, 'blink').name('Blink');
      actionGroup.add(faceProps, 'serious').name('Serious');


      const anim_group = gui.addFolder('Animations');

      let clipper;
      const lp = { Once: THREE.LoopOnce, Repeat: THREE.LoopRepeat, PingPong: THREE.LoopPingPong }
      const AnimProp = {
        loop: lp.Once,
        clips: animClips,
        currentClip: '',
        reload: () => {
          AnimProp.clips = reload();
          if (clipper) clipper.remove();
          clipper = anim_group.add(AnimProp, 'currentClip', AnimProp.clips).onChange(value => {
            self.play(value, AnimProp.loop);
          });
        },
        upload: () => setupUpload(AnimProp.reload),
      }

      anim_group.add(AnimProp, 'loop', ['Once', 'Repeat', 'PingPong']).onChange(v => {
        AnimProp.loop = lp[v];
      });

      AnimProp.reload();

      anim_group.add(AnimProp, 'upload', 'Upload');



      this._pane = gui;
    } else {
      if (state) this._pane.show()
      else this._pane.hide();
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

  async bind(mesh, scale = 1) {
    this.mesh = mesh;
    this.add(mesh);
    mesh.position.set(0, 0, 0);
    // this._reflect = new THREE.CubeCamera(-1, 1000, )
    // this.add(this._reflect)
    // SceneManager._reflect.position.set(0, 0, 0)
    const city = new THREE.TextureLoader().load('/models/tomi/city_02.jpg')

    const group = new THREE.Object3D();
    group.add(mesh);

    this.add(group);
    // mesh.scale.set(scale, scale, scale);
    const self = this;

    const shield = new THREE.MeshPhongMaterial({
      // side: THREE.DoubleSide,
      // envMap: city,
      roughness: 0.9,
      metalness: 1,
      shininess: 200,
      color: 0xffffff,
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
      if (n.name.startsWith('Root')) {
        this._root = n;
      }
      if (n.type.endsWith("esh")) {
        if (n.material) {
          n.material.side = THREE.DoubleSide;
          n.material.transparent = true;
        }
        if (n.name === "hat" && n.material.name === 'hat_mat') {
          n.material = hat
        } else {

          //sconsole.log('mat', n.material.name, n.material.map);
          if (n.material.name.startsWith('Material #63') || n.material.name === "body_mat") {
            shield.map = n.material.map;
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

  sortAnimationClips() {
    // this._clips = _.sortBy(this.clips, (o) => o.name.toLowerCase());
  }

  getClipsContaining(keywords, random = false) {
    const arr = this._clips.filter(c => c.name.startsWith(keywords))
    return (random) ? arr[_.random(false) * arr.length - 1] : arr;
  }

  async __loadAnimations(scene, onlyClips = false, overwrite = false) {
    console.log(scene.animations);
    if (onlyClips) {
      if (overwrite) this._clips = [];
      scene.animations.forEach(clip => {
        const index = this._clips.length;
        clip.name = `${clip.name.toLowerCase()}`;
        this._clips.push(clip);
      });
      return
    }
    scene.animations.forEach(clip => {
      const index = this._clips.length;
      clip.name = `${clip.name.toLowerCase()}`;
      this._clips.push(clip);
    });
    //this._clips.push(...scene.animations);
    const mixer = new THREE.AnimationMixer(this.mesh);

    mixer.timeScale = 1;
    //this._clips = scene.animations;
    const self = this;
    mixer.addEventListener("finished", (e) => {

      self.nextAction()

    });
    mixer.addEventListener("loop", (e) => {
      this._currentIndex = 0;
      self.dispatchEvent({ type: "animationend" });
    });
    this._mixer = mixer;
  }

  nextAction() {
    if (this._currentSequence.length > 0) {

      console.log("Actions", this._currentIndex)
      const lp = (this._currentSequence.length <= 1) ? THREE.LoopRepeat : THREE.LoopOnce;
      this.play(this._currentSequence.shift(), lp)
    } else {

      this._currentIndex = this._defaultClip;
      if (this._currentAction) {
        if (this._actionCallbacks[this._currentAction]) {
          this._actionCallbacks[this._currentAction]();
          this._actionCallbacks[this._currentAction] = null;
        }

        this._currentAction.fadeOut(0.5);
      }

      this.play(this._defaultClip, THREE.LoopRepeat);

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

  reset() {
    this._actionCallbacks = {};
    this.face.reset();
  }

  play(clipNameOrIndex, loop = THREE.LoopOnce, repeat = 0, ended = undefined) {
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

        if (ca) {
          action.fadeIn(0.5);
          ca.fadeOut(0.5);
          setTimeout((_) => ca.stop(), 2000);
        }
        action.play();
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

  async playSound(src, syncClip = -1) {
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
      this._syncClip = syncClip;
      this._sound = new Howl({
        src: src,
        autoplay: false,
        userWebAudio: true,
        onplay: () => {
          if (!self.analyser) self.setupAnalyzer()
          self.startAnalyze();
          // self.play(0);
          //self.dispatchEvent({ type: 'audioplay' });
        },
        onstop: () => {
          if (self.__tm) {
            clearInterval(self.__tm);
            self.__tm = null;
          }
          //self.dispatchEvent({ type: 'audiostop' });
        },
        onended: () => {
          if (self.__tm) {
            clearInterval(self.__tm);
            self.__tm = null;
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