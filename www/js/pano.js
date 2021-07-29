import * as THREE from "./build/three.module.js";
import { degToRad } from "./utils/helpers.js";
import { OrbitControls } from "/js/jsm/controls/OrbitControls.js";

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
    video.crossOrigin = "anonymous";

    video.autoplay = true;
    video.onload = () => resolve(video);
    video.onerror = (e) => rej(null);
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
    this.target =
      target && target.position ? target.position : new THREE.Vector3();
    this.camera = camera;
    this.isInteracting = false;
    this.orbitMode = orbit;
    if (this.orbitMode) {
      this.c = new OrbitControls(camera, renderer.domElement);
    }
    this.data = {
      lon: 0,
      lat: 0,
      theta: 0,
      phi: 0,
      maxPolarAngle: 30,
      minPolarAngle: -30,
      dist: config.dist || 50,
      ...config,
      vector: new THREE.Vector2(),
      decay: false,
    };
    this.event = {
      onPointerX: 0,
      onPointerY: 0,
      onPointerLon: 0,
      onPointerLat: 0,
      vector: new THREE.Vector2(),
    };
    if (!orbit) {
    }
    this._target = orbit ? this.c.target : new THREE.Vector3();
    return this;
  }

  set target(v) {
    this._target = v;
    if (this.orbitMode) this.c.target = v;
  }
  get target() {
    return this._target;
  }

  update() {
    if (this.orbitMode) this.c.update();
  }

  destroy() {
    this._listeners.removeEventListener("pointerdown", this.onPointerDown);
    this._listeners.removeEventListener("pointermove", this.onPointerMove);
    this._listeners.removeEventListener("pointerup", this.onPointerUp);
  }

  changeMode(mode) {
    this.orbitMode = mode == "orbit";
    if (!this.orbitMode) {
      this._euler = new THREE.Euler(0, 0, 0, "YXZ");
      this._listeners = dome || document.body;

      this.needsUpdating = true;
      const self = this;

      this.onPointerDown = (evt) => {};

      this.onPointerMove = (evt) => {};

      this.onPointerUp = (evt) => {};

      this._listeners.addEventListener("pointerdown", this.onPointerDown);
      this._listeners.addEventListener("pointermove", this.onPointerMove);
      this._listeners.addEventListener("pointerup", this.onPointerUp);
      this._listeners.addEventListener("mousedown", this.onPointerDown);
      this._listeners.addEventListener("mousemove", this.onPointerMove);
      this._listeners.addEventListener("mouseup", this.onPointerUp);
    }
  }

  __onPointerDown(evt) {
    const self = this;
    self.isInteracting = true;
    self.event.onPointerX = evt.clientX;
    self.event.onPointerY = evt.clientY;
    self.event.onPointerLon = self.data.lon;
    self.event.onPointerLat = self.data.lat;
    self.needsUpdating = true;
  }

  __onPointerMove(evt) {
    const self = this;
    if (self.isInteracting) {
      self.data.lon =
        (self.event.onPointerX - evt.clientX) * 0.1 + self.event.onPointerLon;
      self.data.lat =
        (self.event.onPointerY - evt.clientY) * 0.1 + self.event.onPointerLat;
      if (!self.orbitMode) {
        const movementY =
          evt.movementX || evt.mozMovementX || evt.webkitMovementX || 0;
        const movementX =
          evt.movementY || evt.mozMovementY || evt.webkitMovementY || 0;
        self.event.vector.x = movementX;
        self.event.vector.y = movementY;
      }
    }
  }

  __onPointerUp(evt) {
    self.isInteracting = false;
    self.event.vector.x = self.event.y = 0;
  }

  get updated() {
    return this.needsUpdating || this.isInteracting;
  }

  get isLocked() {
    return this._locked;
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
    this.camera.lookAt(target.position);
  }

  onRender(ms = 0) {
    const self = this;
    if (this.isInteracting) {
      const camera = self.camera;
      const target = self.target;

      if (this.orbitMode) {
        self.data.lat = Math.max(-85, Math.min(85, self.data.lat));
        const phi = degToRad(90 - self.data.lat);
        const theta = degToRad(self.data.lon);
        const distance = self.data.dist;
        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(target);
      } else {
        // const pos = new THREE.Vector3(
        //   distance * Math.sin(phi) * Math.cos(theta),
        //   distance * Math.cos(phi),
        //   -distance * Math.sin(phi) * Math.sin(theta)
        // );
        this._euler.setFromQuaternion(this.camera.quaternion);
        const event = this.event;
        const movementX = event.vector.x || 0;
        const movementY = event.vector.y || 0;

        this._euler.y -= movementY * 0.002;
        this._euler.x -= movementX * 0.002;

        this._euler.x = Math.max(
          PI_2 - this.data.maxPolarAngle,
          Math.min(PI_2 - this.data.minPolarAngle, this._euler.x)
        );

        // this._euler.x *= 0.98;
        // this._euler.y *= 0.98;
        // this.data.vector.x *= 0.98;
        // this.data.vector.y *= 0.98;

        this.camera.quaternion.setFromEuler(this._euler);
      }
      this.needsUpdating = false;
    }
  }

  moveTo(target) {
    let position =
      target instanceof THREE.Object3D ? target.position.clone() : target;
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
