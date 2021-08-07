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
    this.raycaster.layers.disableAll()
    this.raycaster.layers.enable(2);
    this._enable = true;
    this._cam = camera;
    this._scene = scene;
    this._listener = context;
    this._layerId = layerId;
  }

  set enabled(s) {
    this._enable = s;
    if (s) {
      this._listener.style.touchAction = "none";
      this._listener.addEventListener(
        "pointermove",
        this.onPointerMove.bind(this)
      );
    } else {
      this._listener.removeEventListener(
        "pointermove",
        this.onPointerMove.bind(this)
      );
    }
  }

  addSelected(object) {

      this.selectedObjects = [];
      this.selectedObjects.push(object.parent.name.startsWith('Scene0') ? object.parent.children : object);

  }

  chkIntersection() {
    this.raycaster.setFromCamera(this.cursor, this._cam);
    const objects = this.raycaster.intersectObject(this._scene, true);

    if (objects.length > 0) {
      const selectedObject = objects[0].object;
      this.addSelected(selectedObject);
      this.emit("hover", this.selectedObjects);
    } else {
      //this.selectedObjects = [];
    }
  }

  onPointerMove(event) {
    if (!event.isPrimary) return;
    this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.cursor.y = (event.clientY / window.innerHeight) * 2 + 1;
    this.chkIntersection();
    this.emit("pointermove", this.cursor);
  }
}
