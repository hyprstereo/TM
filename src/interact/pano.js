import * as THREE from "/build/three.module.js";
import { OrbitControls } from "/js/jsm/controls/OrbitControls.js";

export const isVideo = (src) => {
  return src.endsWith(".webm") || src.endsWith(".mp4") || src.endsWith(".mov");
};

export const createVideoElement = async (config = { preload: true, autoplay: true }, ...videoSrc) => {
  return await new Promise((resolve, rej) => {
    const video = document.createElement("video");
    video.preload = config.preload || false;
    video.playsInline = video.muted = true;

    videoSrc.forEach((src) => {
      const source = document.createElement("source");
      source.src = src;  
      video.appendChild(source);
    });
    
    video.style.display = "none";
    //video.crossOrigin = "anonymous";

    video.autoplay = config.autoplay || true;
    resolve(video);
  });
};

// create video mesh for 360 view
export const createPanoVideo = async (scene, ...videoSrc) => {
  return await new Promise((resolve, rej) => {
    const dome = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    dome.scale(-1, 1, 1);
    if (isVideo(videoSrc[0])) {
      createVideoElement(...videoSrc)
        .then((video) => {
          //console.log("video", video);
          if (video) {
            document.body.appendChild(video);
            const texture = new THREE.VideoTexture(video);
            const material = new THREE.MeshBasicMaterial({ map: texture });

            const mesh = new THREE.Mesh(dome, material);
            scene.add(mesh);
            resolve({ map: mesh, media: video });

            //video.play();
          } else {
            rej();
          }
        })
        .catch((e) => rej(e));
    } else {
      // const img = document.createElement("image");
      // img.src = videoSrc[0];
      const imgLoader = new THREE.TextureLoader();
      imgLoader.load(videoSrc[0], (t) => {
        console.log(t);

        const material = new THREE.MeshBasicMaterial({ map: t });

        const mesh = new THREE.Mesh(dome, material);
        scene.add(mesh);
        resolve({ map: mesh, media: t });
      });
    }
  });
};

const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI / 2;

/**
 * usage:
 * const videoPanorama = new panoControl([videoMesh], [optional config = {}])
 * TODO: dome is redundant now
 */
export class panoControl extends THREE.EventDispatcher {
  constructor(dome, config = {}, target, camera, orbit = false, renderer) {
    super();
    this._locked = true;
    this._target = (target && target.position) ? target.position : new THREE.Vector3();
    this.camera = camera;
    this.isInteracting = false;
    this.orbitMode = orbit;

    this.c = new OrbitControls(camera, renderer.domElement);
    this.setOrbit(orbit);
    this._maxDistance = this.c.maxDistance;
    this.c.screenSpacePanning = false;
    this.c.enablePan = true;
    this._lockTarget = null;
    this._tweening = false;
    this._camLook = new THREE.Vector3();
    return this;
  }

  setOrbit(state = true) {
    this.orbitMode = state;
    if (state) {
      this.c.target = this.target;
    } else {
      const cpos = this.target;
      cpos.z -= 0.1;
      this.camera.position = cpos;
      //this.camera.position.copy(this.target);
    }
    //this.c.enablePan = !state;
  }

  set target(src) {
    this._target = src.position || src;
    this.c.target = this._target;
  }

  get target() {
    return this._target;
  }


  update() {

    this.c.update()
  }

  destroy() {

  }

  get updated() {
    return this.needsUpdating || this.isInteracting;
  }

  get isLocked() {
    return this._locked;
  }

  lockOnTarget(target) {
    this._lockTarget = target;
  }

  centerPivot() {
    const cpos = this.camera.position.clone();
    cpos.z += 0.01;
    this.target = cpos;
  }

  lock() {
    this._locked = true;
    this.dispatchEvent({ type: "lock" });
  }

  unlock() {
    this._locked = false;
    this.dispatchEvent({ type: "unlock" });
  }

  lookAt(target, tween = false, gaze = true) {
    // this.target = target;
    const self = this;
    let opos = new THREE.Vector3().copy(this.c.target);

    if (tween) {
      if (!this._tweening) {
        this._tweening = true;
        // gsap.to(this.c.target, {
        //   ...target, duration: 1.2, ease: 'sine.out', delay: 0.5, onComplete: () => {
        //     self._tweening = false;
        //     if (gaze) {
        //       this.c.target = this.target;
        //     }
        //   }
        // })
        gsap.to(this._camLook, {
          x: target.x, y: target.y, z: target.z, duration: 2, ease: 'sine.out', delay: 0.5, onComplete: () => {
            self._tweening = false;
          },
          onUpdate: () => {
            self.camera.lookAt(self._camLook);
          }
        })
      }
    } else {
      this.target = target;
    }
    this._target = target;
  }

  onRender(ms = 0) {
    if (this._lockTarget) {
      const pos = this._lockTarget.position.clone();
      this.camera.lookAt(pos);
    }
    this.c.update();
  }

  moveTo(target, delay = 0, complete = undefined) {
    let pos = target.clone();
    createjs.Tween.get(this.camera.position, { onComplete: complete }).wait(delay).to(pos, 1200);
  }
}

export const drawTexture = async (src, w = 512, h = 512) => {
  return await new Promise((res, rej) => {
    const img = document.createElement("img");
    img.width = w;
    img.height = h;
    const canv = document.createElement("canvas");
    canv.width = w;
    canv.height = h;

    img.onload = (e) => {
      canv.getContext("2d").drawImage(img);
      const ct = new THREE.CanvasTexture(canv);
      res(ct);
    };
    img.onerror = (e) => rej(e);
    img.src = src;
  });
};


export class EXRCamera extends OrbitControls {
  constructor(camera, renderer, config = { target: null }) {
    super(camera, renderer.domElement);
    this.camera = camera;
    this._locked = true;

    this.isInteracting = false;

    this.screenSpacePanning = false;
    this.enablePan = true;
    this._lockTarget = null;
    this._tweening = false;
    this._camLook = new THREE.Vector3();

    return this;
  }

  get updated() {
    return this.needsUpdating || this.isInteracting;
  }

  get isLocked() {
    return this._locked;
  }

  lockOnTarget(target) {
    this._lockTarget = target;
    return this;
  }

  centerPivot() {
    const cpos = this.camera.position.clone();
    cpos.addScaledVector(new THREE.Vector3(0,0,0.01));
    this.target = cpos;
    return this;
  }

  async after(duration = 0) {
    return await new Promise((res) => {
      if (duration) {
        setTimeout(_ => {
          res(this);
        }, duration)
      }
    })
  }

  lookOnSelf() {
    
  }

  lookAt(target = undefined) {
    if (target) {
      const t = (target instanceof THREE.Object3D)? target.position.clone() : t;
      gsap.to(this.target, {...t, duration: 1.2, ease: 'sine.out', onComplete: ()=> {
        const dir = this.camera.getWorldDirection(t);
        t = t.lerp(dir, 0.01)
        this.target = t;
      }})
    }
  }

  rotateTo(target, dur = 1) {
    if(target instanceof THREE.Object3D) target = target.position.clone();
    const v = new THREE.Vector3(0,0,0.01)
    v.applyQuaternion(this.camera.quarternion);
    const a = v.angleTo(target)
    gsap.to(this.camera.rotation, { ...a, duration: dur, ease: 'sine.out' });
  }

  lock() {
    this._locked = true;
    this.dispatchEvent({ type: "lock" });
  }

  unlock() {
    this._locked = false;
    this.dispatchEvent({ type: "unlock" });
  }

  lookAt(target, tween = false, gaze = true) {
    // this.target = target;
    const self = this;
    let opos = new THREE.Vector3().copy(this.target);

    if (tween) {
      if (!this._tweening) {
        this._tweening = true;

        gsap.to(this._camLook, {
          x: target.x, y: target.y, z: target.z, duration: 2, ease: 'sine.out', delay: 0.5, onComplete: () => {
            self._tweening = false;
          },
          onUpdate: () => {
            self.camera.lookAt(self._camLook);
          }
        })
      }
    } else {
      this.target = target;
    }
    this._target = target;
  }

  moveTo(target, delay = 0, complete = undefined, lookAt = undefined) {
    let pos = target.clone();

    gsap.to(this.camera.position, { ...pos, duration: 1, delay: delay, onComplete: complete })
    // createjs.Tween.get(this.camera.position, { onComplete: complete }).wait(delay).to(pos, 1200);
  }
}