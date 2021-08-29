import * as THREE from '/build/three.module.js';
import { degToRad } from "../utils/helpers";
const spriteLoader = new THREE.TextureLoader();
export const SpriteLayer = 5;
export class SpriteButton extends THREE.Mesh {
    static __counter = 0
    constructor(material = undefined) {
        const c = new THREE.PlaneGeometry(1, 1, 1);
        if (!material) material = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
        c.rotateY(degToRad(180));
       
        
        super(c, material);
        
        SpriteButton.__counter++;
        this.position.z = (0.001 * SpriteButton.__counter);
        this.selected = false;
        this.maxScale = 1;
        this.heightRatio = 1;

        //
        this.layers.set(SpriteLayer);
        this.state = -1;
        this._oriPos = new THREE.Vector3()
        this._pos2d = new THREE.Vector2(this.position.x, this.position.y);
        this._t;
        this.hide();
      
        return this;
    }


    set pos(v) {
        this._pos2d = v;
        this.position.x = v.x;
        this.position.y = v.y;
    }

    get pos() {
        return this._pos2d;
    }

    saveState() {
        this._oriPos = this.position.clone();
        this._pos2d.x = this.position.x;
        this._pos2d.y = this.position.y;
       // this.maxScale =  this.scale.x;
    }

    set interactive(state) {
        this.layers.set(state ? SpriteLayer : 8);
    }

    get interactive() {
        return (this.layers.get() === SpriteLayer);
    }

    async load(src) {
        return await new Promise((res, rej) => {
            spriteLoader.load(src, (img) => {
                this.heightRatio = img.image.height / img.image.width;
                // this.scale.y = this.scale.x * this.heightRatio;
                // this.scale.z = 
                this.material.map = img;
                res(this);
            }, null, (e) => rej(e));
        });
    }

    onPointerDown(delay = 1.2, scale = -1, cursor = undefined, cb = undefined) {
        if (scale == -1) scale = this.maxScale;
        this.selected = true;
        this.scale.multiplyScalar(-0.1);
        const self = this;
        gsap.to(this.scale, {
            x: scale, y: scale * this.heightRatio, z: scale, duration: 0.8, ease: 'ease.out',
            delay: delay, onComplete: () => {
                if (cb) cb(self.userData);
                self.selected = false;
                self.hide();
            }
        });
    }

    show(delay = 0.2, scale = -1, complete = undefined) {
        scale = (scale<0)? this.maxScale : scale;
        const self = this;
        //createjs.Tween.get(this.scale).wait(delay).to({ x: scale, y: scale * this.heightRatio, z: scale }, 600, createjs.Ease.bounceOut);
        gsap.to(this.scale, {
            x: scale, y: scale * this.heightRatio, z: scale, duration: 0.8, ease: 'bounce',
            delay: delay, onComplete: complete, onStart: ()=>{
                self._visible = true;
            }
        });
    }

    hide(delay = 0, complete = undefined) {
        this.selected = false;
        const self = this;
        gsap.to(this.scale, {
            x: 0, y: 0, z: 0, duration: 0.8, ease: 'bounce',
            delay: delay, onComplete: ()=> {
                self._visible = false;
                if (complete)complete();
            }
        });
    }

    set opacity(v) {
        this.material.opacity = v;
    }

    get opacity() {
        return this.material.opacity;
    }

    slide(dir='right') {
        const np = this.pos.clone();
        let ox = 0, oy = 0;
        switch(dir) {
            case 'right':
                ox = 0.1;
                break
            case 'left':
                ox = -0.1
                break;
            case 'up':
                oy = 0.1;
                break;
            case 'down':
                oy = -0.1;
                break;
        }
        np.x += ox;
        np.y += oy;
        if (this._t && this._t.running) this._t.kill();
        this._t = gsap.to(this.pos, {x: np.x, y: np.y, duration: 0.8});
        return this;
    }
}