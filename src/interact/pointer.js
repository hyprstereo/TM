import {
  Box3,
  Box3Helper,
  Layers,
  Object3D,
  Raycaster,
  Vector2,
} from "../build/three.module.js";
import Emitter from "../events/emitter.js";
import { InteractiveObject, PointerStates } from "./interactiveobject.js";

export class Pointer3D extends Emitter {
  constructor(camera, scene, context, layerId = 6) {
    super();
    this.selectedObjects = [];
    this.cursor = new Vector2();
    this.raycaster = new Raycaster();
   // this.raycaster.layers.enableAll()
   this.raycaster.layers.disableAll()
    this.raycaster.layers.enable(layerId);
    this._enable = true;
    this._cam = camera;
    this._scene = scene;
    this._listener = context;
    this._layerId = layerId;
    this.enabled = this._enable;
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
    } else {
      this._listener.removeEventListener(
        "pointermove",
        this.onPointerMove.bind(this)
      );
      // this._listener.
    }
  }

  addSelected(object) {

    this.selectedObjects = [];
    this.selectedObjects.push(object);

  }

  chkIntersection() {
    this.raycaster.setFromCamera(this.cursor, this._cam);
    const objects = this.raycaster.intersectObject(this._scene, true);

    if (objects.length > 0) {
      const selectedObject = objects[0].object;
      this.addSelected(selectedObject);
     
    }
  }

  onPointerMove(event) {
    // if (!event.isPrimary) return;
    // this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    // this.cursor.y = (event.clientY / window.innerHeight) * 2 + 1;
    // this.chkIntersection();
    // this.emit("pointermove", this.cursor);
   // this.emit("hover", this.selectedObjects);
  }

  onPointerTouch(event) {
    if (!event.isPrimary) return;
    this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.cursor.y = (event.clientY / window.innerHeight) * 2 + 1;
    this.chkIntersection();
    this.emit("pointertouch", this.cursor);
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