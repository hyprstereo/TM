import { degToRad } from "./utils/helpers.js";
import * as THREE from "/js/build/three.module.js";
import { GLTFLoader } from "/js/jsm/loaders/GLTFLoader.js";

const eyes = {
  left: {
    default: [
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
    ],
    blink: [
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
      {
        value: `M 122.56094,69.094091 c -12.29652,-5.502993 -16.09265,-8.37494 -27.707897,-4.50747 -5.24985,2.557003 -14.222423,10.925242 -3.868213,11.542426 4.09885,-4.214399 8.460767,-6.999264 12.26168,-8.289086 6.17423,-2.096272 12.86381,1.25413 19.31443,1.25413`,
      },
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
    ],
  },
  right: {
    default: [
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
    ],
    blink: [
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
      {
        value: `M 122.56094,69.094091 c -12.29652,-5.502993 -16.09265,-8.37494 -27.707897,-4.50747 -5.24985,2.557003 -14.222423,10.925242 -3.868213,11.542426 4.09885,-4.214399 8.460767,-6.999264 12.26168,-8.289086 6.17423,-2.096272 12.86381,1.25413 19.31443,1.25413`,
      },
      {
        value: `M 122.56094,69.094091 c 3.90488,-20.069386 -22.7813,-39.291366 -36.47746,-18.033406 -3.46621,5.381099 -5.45286,24.451178 4.90135,25.068362 4.09885,0.244701 8.75804,-3.877894 12.55895,-5.167716 6.17423,-2.096272 12.56654,-1.86724 19.01716,-1.86724`,
      },
    ],
  },
};

const lips = {
  talk: [
    {
      value: `M 59.170377,85.970279 v 0 c 0.854888,11.785301 20.50065,7.97247 20.284973,1.205432 v 0 c -7.237993,2.416434 -12.350709,3.630278 -20.284973,-1.205432 z`,
    },
    {
      value: `M 59.170377,85.970279 v 0 c 0.854888,11.785301 22.135654,8.121106 20.284973,1.205432 v 0 c -7.237993,0.03825 -12.053436,0.954818 -20.284973,-1.205432 z`,
    },
    {
      value: `M 59.170377,85.970279 v 0 c 0.854888,11.785301 20.50065,7.97247 20.284973,1.205432 v 0 c -7.237993,2.416434 -12.350709,3.630278 -20.284973,-1.205432 z`,
    },
    {
      value: `m 59.170377,85.970279 v 0 c 0.854888,11.785301 20.50065,7.97247 20.284973,1.205432 v 0 c -3.455834,-2.264666 -7.185904,-2.054697 -10.627383,-2.210268 -2.942691,-0.133024 -5.405859,-0.333493 -9.65759,1.004836 z`,
    },
    {
      value: `M 59.170377,85.970279 v 0 c 0.854888,11.785301 22.135654,8.121106 20.284973,1.205432 v 0 c -7.237993,0.03825 -12.053436,0.954818 -20.284973,-1.205432 z`,
    },
  ],
  smile: [
    {
      value: `m 59.170377,85.970279 v 0 c 0.854888,11.785301 20.50065,7.97247 20.284973,1.205432 v 0 c -3.158561,2.78898 -7.185904,4.633953 -10.627383,4.478382 -2.942691,-0.133024 -6.594952,-1.968497 -9.65759,-5.683814 z`,
    },
  ],
};

const audioSources = [
  "./audio/cm_audio/0_Benefits01NEW.mp3",
  "./audio/cm_audio/0_BenefitsAgility.mp3",
];

const faceActions = {
  idle: { x: 0, y: 2 },
  smile: { x: 3, y: 2 },
  curious: { x: 0, y:   1  },
  talk: { x: 0, y: 0 },
  talk2: { x: 1, y: 3 },
  joy: { x: 1, y: 2 },
  dead: { x: 1, y: 1 },
  angry: { x: 1, y: 0 },
  sad: { x: 2, y: 2 },
  duh: { x: 2, y:1 },
  annoyed: { x: 2, y: 0 },
  happy: { x: 1, y: 2 },
  error: { x: 3, y: 1 },
  amazed: { x: 0, y: 3 },
};

const sequences = {
  lips: {},
};
const tomiFace = {
  el: null,
  eyes: [0, 0],
  lips: "talk",
  lipsIndex: 0,
  timer: null,
  lipEl: null,
};

export const setupTomiFacial = (src, lip = "talk") => {
  if (!tomiFace.el) {
    tomiFace.el = document.querySelector(src);
    if (tomiFace.el) {
      tomiFace.lipEl = tomiFace.el.querySelector("#mouth");
    }
    tomiFace.lips = lip;
    if (!sequences.lips[lip]) {
      const lanim = lips[tomiFace.lips];
      const max = lanim.length;

      const anim = anime({
        targets: tomiFace.lipEl,
        d: lips[tomiFace.lips],
        loop: max > 1,
        duration: 500,
        easing: "linear",
        direction: max > 1 ? "alternate" : "",
        elasticity: 100,
        autoplay: true,
      });
      sequences.lips[lip] = anim;
    }
    //sequences.lips[lip].play();
  }

  return sequences.lips[lip];
};

export const stopAnimation = (id) => {
  if (tomiFace && tomiFace.timer) {
    clearInterval(tomiFace.timer);
    tomiFace.timer = null;
  }
};

export const path2Points = (path) => {
  let points = [];
  const len = path.getTotalLength();
  for (let i = 0; i < len; i++) {
    var point = path.getPointAtLength(i);
    points.push(point);
  }
  return points;
};

export class TomiModel {
  constructor(
    target,
    targetFace = "#tomi-face",
    scene = undefined,
    voices = undefined,
    row = 4,
    col = 4
  ) {
    if (!voices) voices = audioSources;
    this.model = target.getObjectByName("bot");
    this.face = document.querySelector(targetFace);

    this._row = row;
    this._col = col;
    this.animInstance = {};
    this.texture;
    this.canvas;
    this.imageInstance;
    this.faceMat;
    this._clock = new THREE.Clock(false);
    this._analyzer;
    this._dest = 0;
    this._cur = 0;
    this._talking = false;

    this._faceLoaded = false;
    this._voices = voices;
    this._voice;
    this._analyzerTM;
    this.prop = { x: 0, y: 0, z: 0 , h: 1};

    const mf = this.model.getObjectByName("face");


    const mf = this.model.children[0].getObjectByName("shield");

    if (scene) {
      this._mixer = new THREE.AnimationMixer(
        this.model.getObjectByName("main_ctrl")
      );
      console.log("scene", scene, this._mixer);
      this._clips = scene.animations;
    }

    console.log(this.model)
    const self = this;
    // const shield = this.model.children[0].getObjectByName('shield');
    // new THREE.TextureLoader().load('/models/shield.jpg', (t) =>{
    //   t.flipY = false;
    //   shield.material.emissive = 0x00eeff;
    //   shield.material.alphaMap = t;
    //   shield.material.transparent = true;
    // })

    SpriteTexture(targetFace, "./models/texture/faces.png")
      .then((texture) => {
        self._faceLoaded = true;
        self.texture = texture;
        self.faceIndex("talk");

        const faceMat = new THREE.MeshLambertMaterial({
          map: self.texture,
         color: 0x00eeff,
        })
        mf.material = faceMat;
        // mf.material.map = self.texture;
        // mf.material.metalness = 0.4;

        // mf.material.flatShading =
      })
      .catch((e) => console.warn(e));
  }

  get faceLoaded() {
    return this._faceLoaded;
  }

  setupAnalyzer(sound = undefined) {
    const analyser = Howler.ctx.createAnalyser();
    const volume = Howler.ctx.createGain();
    volume.gain.value = 0;
    // Connect master gain to analyzer
    Howler.masterGain.connect(analyser);

    // Connect analyzer to destination
    analyser.connect(Howler.ctx.destination);

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get the Data array
    analyser.getByteTimeDomainData(dataArray);
    const self = this;
    let mouth = 0;
    this._analyzerTM = setInterval((_) => {
      analyser.getByteTimeDomainData(dataArray);
      console.log(dataArray[0], dataArray[511], dataArray[1023]);
      this._cur = (128 - dataArray[0]) * 0.025;
      this._rot = (128 - dataArray[1023]) * -0.045;
      this._dest = (128 - dataArray[511]) * 1;
      const Y = dataArray[511];
      if (Y != 128 && Y < 129) {
        self.faceIndex((mouth % 1 == 0) ? 'talk2': "talk");
        mouth ++;
      } else if (Y >= 129) {
        self.faceIndex("happy");
      } else if (Y == 128) {
        self.faceIndex("smile");
      } else {
        self.faceIndex("talk2");
      }
      anime({
        targets: self.model.position,
        y: this._dest,

        duration: 500,
        easing: "linear",
      });
      anime({
        targets: self.model.rotation,
        y: this._cur,
        x: this._rot,
        duration: 250,
        easing: "linear",
      });
    }, 500);
    console.log(analyser);
    this._analyzer = analyser;
  }

  play() {
    if (this._clips) {
      const self = this;
      this._clock.start();
      // this._clips.forEach(clip => {
      //   self._mixer.clipAction(clip).play();
      // })
      this.actions();
    }
  }

  actions(set = "talk") {
    // anime({
    //   targets: this.model.position,
    //   y: [0, 5],
    //   loop: true,
    //   direction: 'alternate',
    //   easing: 'linear',
    //   duration: 1800,
    // })
    // anime({
    //   targets: this.model.rotation,
    //   x: [0, 0.2],
    //   loop: true,
    //   direction: 'alternate',
    //   easing: 'linear',
    //   duration: 800,
    // })
  }

  update(delta = 0) {
    if (this._mixer) {
      this._mixer.update(this._clock.getDelta());
    }
  }

  async playVoice(src, vol = 0.1) {
    return await new Promise((res, rej) => {
      if (src) {
        if (!this._voice) {
          this._voice = new Howl({
            src: src,
            usingWebAudio: true,
            autoplay: false,
            volume: vol,
          });
          const self = this;
          this._voice.on("load", function () {
            self._talking = true;
            self._voice.play();
            self.setupAnalyzer();
            res(self._voice);
          });
          this._voice.on("end", function () {
            self._talking = false;
            clearInterval(self._analyzerTM);
            self._analyzerTM = null;
            anime({
              targets: self.model.position,
              y: [0, 5],
              loop: true,
              direction: "alternate",
              easing: "linear",
              duration: 1800,
            });
          });
          this._voice.on("loaderror", function (e) {
            rej(e);
          });
        } else {
          this._voice.src = [src];
        }
      }
    });
  }

  faceIndex(actions) {
    if (typeof actions === "string") actions = faceActions[actions];
    let x = actions.x;
    let y = actions.y;
    y = Math.min(y, this._row);
    x = Math.min(x, this._col);
    const texture = this.texture;
    texture.repeat.x = 1 / this._col;
    texture.repeat.y = 1 / this._row;
    texture.offset.x = actions.x / this._col;
    texture.offset.y = (actions.y / this._row) + 0.05;
  }

  render(fps = 0) {
    if (this.faceMat) {
      // this.canvas.getContext('2d').drawImage(this.imageInstance, 0, 0);
    }
  }

  mouth(action = "smile") {
    this.playVoice(0);
    if (this.animInstance.mouth) {
      this.animInstance.mouth.pause();
    }
    const currentLipAnim = this.lips[action];

    // this.animInstance.mouth = anime({
    //   targets: this.face.querySelector("#mouth"),
    //   d: currentLipAnim,
    //   loop: currentLipAnim.length > 1,
    //   duration: this.talkRate,
    //   easing: "linear",
    //   direction: currentLipAnim.length > 1 ? "alternate" : "",
    //   elasticity: 100,
    //   autoplay: true,
    // });
    const self = this;
    this.animInstance.mouth = this._animate(
      this.face.querySelector("#mouth"),
      currentLipAnim,
      this._talkRate,
      currentLipAnim.length > 1,
      currentLipAnim.length > 1 ? "alternate" : "",
      {
        loopBegin: (a) => {
          const r = Math.round(Math.random() * 10);
          if (r == 1) self.eyes("blink", "both");
          // else if (r == 5) self.eyes("blink", "left");
          // else if (r == 8) self.eyes("blink");
        },
        update: (a) => {
          //if (self.ct) self.ct.map.needsUpdate = true;
        },
      }
    );
  }

  set talkRate(v) {
    this._talkRate = v;
    if (this.animInstance.mouth) {
      this.animInstance.mouth.duration = this._talkRate;
    }
  }

  get talkRate() {
    return this._talkRate;
  }

  eyes(action = "blink", side = "both") {
    const self = this;
    if (side == "both" || side == "right") {
      if (!this.animInstance.right) {
        this.animInstance.right = this._animate(
          this.face.querySelector("#eye-right"),
          this.eye_r[action],
          this._blinkRate,
          false,
          "alternate",
          {
            complete: () => {
              self.animInstance.right = null;
            },
          }
        );
      }
    }

    if (side == "both" || side == "left") {
      if (!this.animInstance.left) {
        this.animInstance.left = this._animate(
          this.face.querySelector("#eye-left"),
          this.eye_l[action],
          this._blinkRate,
          false,
          "alternate",
          {
            complete: () => {
              self.animInstance.left = null;
            },
          }
        );
      }
    }
  }

  _animate(
    targets,
    values,
    rate = 100,
    loop = false,
    dir = "",
    adds = undefined
  ) {
    return anime({
      targets: targets,
      d: values,
      loop: loop,
      duration: rate,
      easing: "linear",
      direction: dir,
      elasticity: 100,
      autoplay: true,
      update: function (anim) {
        //console.log(anim);
      },
      ...adds,
    });
  }
}

export const SpriteTexture = async (target, src) => {
  const texture = await new THREE.TextureLoader().load(src);
  texture.flipY =false
  return texture;
};

export const SVGTexture = async (target, animated = true) => {
  return await new Promise((res, rej) => {
    const svg = document.querySelector(target);
    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    const ctx = canvas.getContext("2d");

    const img = document.createElement("img");
    img.setAttribute(
      "src",
      "data:image/svg+xml;base64," +
        window.btoa(unescape(encodeURIComponent(svgData)))
    );

    const animatedFrame = () => {
      ctx.drawImage(img, 0, 0);
    };

    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      //const material = new THREE.MeshBasicMaterial({ map: texture });
      //material.map.minFilter = THREE.LinearFilter;
      res(texture, img, canvas);
    };

    img.onerror = (e) => rej(e);
  });
};

export class Tomi extends THREE.Object3D {
  static STATES = {
    idle: 0,
    talk: 1,
    error: 2,
    joy: 3,
  };
  constructor() {
    super();
    this._face;
    this._clips;
    this._mixer;
    this._state = Tomi.STATES.idle;
    return this;
  }

  load(
    loader = undefined,
    src = "../models/tomi-anim.glb",
    oncomplete = undefined,
    progress = undefined,
    error = undefined
  ) {
    const self = this;
    if (!loader) loader = new GLTFLoader();

    loader.lood(src, oncomplete, progress, error);
  }

  set state(value) {
    this._state = value;
  }

  get state() {
    return this._state;
  }
}
