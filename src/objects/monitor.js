import * as THREE from "../build/three.module";
import Emitter from "../events/emitter";

export class ScreenDisplayTexture extends THREE.Texture {
    constructor(image = undefined,tiled = true, baseWidth = 1024, baseHeight = 1024) {
        super(image)
        this._x = 0;
        this._y = 0;
        this._baseWidth = baseWidth;
        this._baseHeight = baseHeight;
        this._stimer;
        this._interval;
        return this;
    }

    set interval(v) {
        this._interval = v;
        if (v > 0) {
            this._stimer = Date.now;
        }
    }

    get interval() {
        return this._interval;
    }

    shift(col = 0, row = 0) {
        this.offset.x = col * this._baseWidth;
        this.offset.y = row * this._baseHeight;
        this.needsUpdate = true;
        return this;
    }
}

export class CanvasPainter extends Emitter {
    constructor(cm = undefined, width = 256, height = 256) {
        super()
        this.width = width;
        this.height = height;
        this._lx = 0;
        this._ly = 0;
        this.cm = cm;
        this.ctx = (cm) ? cm.getContext('2d') : null;
    }

    clear() {
        if (this.ctx) {
            this.ctx.clearRect(this._lx, this._ly, this.width, this.height);
        }
    }
}

export class CanvasMosaic extends Emitter {
    constructor(width = 2048, height = 2048) {
        super()
        this._canvas = document.createElement('canvas');
        this._canvas.width = width;
        this._canvas.height = height;
        this._painters = [];
    }

    requestSpace(width, height) {
        const painter = new CanvasPainter(this, width, height);
    }
}