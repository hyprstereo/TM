import {
  Raycaster,
  Vector2,
} from "../build/three.module.js";
import { SceneManager } from "../controllers/view.js";
import Emitter from "../events/emitter.js";
import { SpriteButton, SpriteLayer } from "../objects/sprites.js";

export const Selects = {
  child: []
};
export class Pointer3D extends Emitter {
  constructor(camera, scene, context, target = undefined, layerId = 6, outline = undefined, hover = true) {
    super();
    this.selectedObjects = [];
    this.cursor = new Vector2();
    this.raycaster = new Raycaster();
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

  addSelected(object) {
    this.selectedObjects = [];
    if (!(object instanceof SpriteButton))
      Selects.child = [object];

    this.selectedObjects.push(object);

  }

  chkIntersection() {
    const intersects = this.pick();
    if (intersects.length > 0) {
      const res = intersects[0];
      if (res.object instanceof SpriteButton) {
        this.emit('buttonselected', res.object);
      }
      this.addSelected(res.object);

    } else {
      this.selectedObjects = [];
    }
  }

  pick() {
    this.raycaster.setFromCamera(this.cursor, SceneManager.camera);
    const intersects = this.raycaster.intersectObject(this._target, true);
    const results = intersects.filter((res) => res && res.object);
    return results;
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
    this.raycaster = new Raycaster();
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