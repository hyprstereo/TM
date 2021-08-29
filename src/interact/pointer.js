import * as THREE from "/build/three.module.js";
import { SceneManager } from "../controllers/view.js";
import Emitter from "../events/emitter.js";
import { SpriteButton, SpriteLayer } from "../objects/sprites.js";
import { degToRad } from "../utils/helpers.js";

export const Selects = {
  child: []
};
export class Pointer3D extends Emitter {
  constructor(camera, scene, context, target = undefined, layerId = 6, outline = undefined, hover = true) {
    super();
    this.selectedObjects = [];
    this.cursor = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this._target = target || scene;
    this.raycaster.layers.disableAll();
    this.raycaster.layers.enable(SpriteLayer);
    this.raycaster.layers.enable(6);
    this._enable = true;
    this._cam = camera;
    this._scene = scene;
    this._listener = context;
    this._layerId = layerId;
    this.enabled = this._enable;
    this._pointerDown = false;
    this._outline = outline;
    this._hover = hover;
  }

  set enabled(s) {
    this._enable = s;
    if (s) {
      this._listener.style.touchAction = "none";
      this._listener.addEventListener(
        "pointermove",
        this.onPointerMove.bind(this)
      );
      this._listener.addEventListener(
        'pointerdown',
        this.onPointerTouch.bind(this));
      this._listener.addEventListener(
        'pointerup',
        this.onPointerUp.bind(this));
    } else {
      this._listener.removeEventListener(
        "pointermove",
        this.onPointerMove.bind(this)
      );
      this._listener.removeEventListener(
        "pointerdown",
        this.onPointerDown.bind(this)
      );
      this._listener.removeEventListener(
        "pointerup",
        this.onPointerUp.bind(this)
      );
      // this._listener.
    }
  }

  addSelected(res) {
    this.selectedObjects = [];
    if (!(res.object instanceof SpriteButton))
      Selects.child = [res.object];

    this.selectedObjects.push(res);

  }

  chkIntersection() {
    const {intersects} = this.pick();
    if (intersects.length > 0) {
      const res = intersects[0];
      if (res.object instanceof SpriteButton) {
        this.emit('buttonselected', res);
      }
      this.addSelected(res);

    } else {
      this.selectedObjects = [];
      this._listener.style.cursor = 'default';
    }
  }

  pick() {
    this.raycaster.setFromCamera(this.cursor, SceneManager.camera);
    const intersects = this.raycaster.intersectObject(this._target, true);
    const results = intersects.filter((res) => res && res.object);
    
    return {results, intersects};
  }

  onPointerMove(event) {
    if (!event.isPrimary) return;
    this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (this._outline || this._hover) {
      if (this._pointerDown && this.selectedObjects.length <= 0) return;
      this.chkIntersection();
      if (this._outline) this._outline.selects = [this.selectedObjects];
      this._listener.style.cursor = (this.selectedObjects.length) ? 'pointer' : 'default';
      this.emit("pointermove", { pos: this.cursor, objects: this.selectedObjects });
    }

  }

  onPointerTouch(event) {
    if (!event.isPrimary) return;
    this._pointerDown = true;
    this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.chkIntersection();

    this.emit("pointertouch", { pos: this.cursor, objects: this.selectedObjects });
  }

  onPointerUp(event) {
    if (!event.isPrimary) return;
    this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.emit("pointerup", { pos: this.cursor, objects: this.selectedObjects });
    this._pointerDown = false;
  }
}

export const BindPointerEvents = (scope, listener, ...types) => {
  types.forEach(t => {
    scope.addEventListener(t, listener)
  })
}

export const UnbindPointerEvents = (scope, listener, ...types) => {
  types.forEach(t => {
    scope.removeEventListener(t, listener)
  })
}

export class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}

export const makePickable = (target, conf = { data: null, type: null, states: null, onHit: undefined, cursor: 'pointer' }) => {
  if (target instanceof THREE.Object3D) {
    const newConfig = {
      label: conf.label || target.name,
      selected: conf.selectable ? false : null,
      states: conf.states || null,
      data: conf.data || null,
      onHit: conf.onHit || null,
      cursor: conf.cursor || 'default'
    }
    target.userData = {
      ...target.userData,
      ...newConfig,
    };
    target.layers.set(SpriteLayer);
    return target;
  } else {
    return;
  }
}

export const Indicator = (clr = 0xffffff, height = 1.3) => {
  const circle = new THREE.EllipseCurve(0, 0, 0.3, .3, 0, 2 * Math.PI, false, 0);
  const lineMat = new THREE.LineDashedMaterial({color: clr, linewidth: 1, dashSize: 3, gapSize: 1, scale: 1});
  const points = circle.getPoints(50);
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, 0, height * .5));
  points.push(new THREE.Vector3(0, 0, height));

  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const ind = new THREE.Line(geo, lineMat);
  const grp = new THREE.Object3D(); 

  grp.add(ind);
  ind.rotateX(degToRad(-90));
  ind.position.y = 0.01;
  return grp;
}