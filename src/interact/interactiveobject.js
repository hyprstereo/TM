import { Box3, Box3Helper, Object3D } from "../build/three.module.js";


export const PointerStates = {
  Default: 0,
  Hover: 1,
  Hit: 2
}

export class InteractiveObject extends Object3D {
  constructor(target, id = undefined) {
    super()
    this._id = id || target.name;
    this._pointerState = PointerStates.Default;
    this.add(target);
    this._box = new Box3().setFromObject(target);
    this._boxH = new Box3Helper(this._box, 0xff00ff);
    this._boxH.layers.set(6);
    this.add(this._boxH);
    target.userData = {
      interactive: true,
      id: this._id,
      state: ()=> this.state
    }
    target.layers.set(6);
  }

  get state() {
    return this._pointerState;
  }

  set interactive(v) {
    this.children[0].layers.enabled = v;
  }

  get interactive() {
    return this.children[0].layers.enabled;
  }

  get interactables() {
    return this._boxH;
  }
}