import * as THREE from "../build/three.module.js";
import { degToRad } from "../utils/helpers.js";
import { OrbitControls } from "../jsm/controls/OrbitControls.js";
import { SceneManager } from "../controllers/view.js";

export const isVideo = (src) => {
  return src.endsWith(".webm") || src.endsWith(".mp4") || src.endsWith(".mov");
};

export const createVideoElement = async (...videoSrc) => {
  return await new Promise((resolve, rej) => {
    const video = document.createElement("video");
    video.playsInline = video.muted = true;

    videoSrc.forEach((src) => {
      const source = document.createElement("source");
      source.src = src;
      video.appendChild(source);
    });
    video.style.display = "none";
    //video.crossOrigin = "anonymous";

    video.autoplay = true;
    // video.onload = () => resolve(video);
    // video.onerror = (e) => rej(null);
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
    return this;
  }

  setOrbit(state = true) {
    this.orbitMode = state;
    if (state) {
     this.c.target = this.target;
    } else {
      
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

  lock() {
    this._locked = true;
    this.dispatchEvent({ type: "lock" });
  }

  unlock() {
    this._locked = false;
    this.dispatchEvent({ type: "unlock" });
  }

  lookAt(target) {
    this.target = target;
  }

  onRender(ms = 0) {
    if (this._lockTarget) {
      const pos = this._lockTarget.position.clone();
      this.camera.lookAt(pos);
    }
    this.c.update();
  }

  moveTo(target, delay=0, complete = undefined) {
    let pos = target.clone();
    createjs.Tween.get(this.camera.position, {onComplete: complete}).wait(delay).to(pos, 1200);
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
