import { degToRad } from "../utils/helpers";
const spriteLoader = new THREE.TextureLoader();
export const SpriteLayer = 5;
export class SpriteButton extends THREE.Mesh {
    constructor(material = undefined) {
        const c = new THREE.PlaneGeometry(1, 1, 1);
        if (!material) material = new THREE.MeshBasicMaterial({transparent:true, side: THREE.DoubleSide});
        c.rotateY(degToRad(180));
        super(c, material);
        this.selected = false;
        this.maxScale = 1;
        this.heightRatio = 1;

       //
       this.layers.set(SpriteLayer);
        this._hidden = false;
        this.state = -1;
        this.hide();
        return this;
    }

    set interactive(state) {
        this.layers.set(state? SpriteLayer : 8);
    }

    get interactive() {
        return (this.layers.get() === SpriteLayer);
    }

    async load(src) {
        return await new Promise((res, rej) =>{
            spriteLoader.load(src, (img) => {
                this.heightRatio = img.image.height/img.image.width;
                this.material.map = img;
                res(this); 
            },null, (e) => rej(e));
        });
    }

    onPointerDown(delay = 1200, scale = -1,cursor = undefined, cb = undefined) {
        if (scale == -1) scale = this.maxScale;
        this.selected = true;
        this.scale.multiplyScalar(-0.1);
        createjs.Tween.get(this.scale, {onComplete:()=>{
            if (cb) cb(this.userData);
            this.selected = false;
            this.hide();
        }} ).wait(delay).to({x:scale, y: scale * this.heightRatio, z: scale}, 600, createjs.Ease.bounceOut);
    }

    show(delay = 0, scale = -1) {
        scale = this.maxScale;
        this._hidden = false;
        createjs.Tween.get(this.scale ).wait(delay).to({x:scale, y: scale * this.heightRatio, z: scale}, 600, createjs.Ease.bounceOut);
    }

    hide(delay=0) {
        this._hidden = true;
        this.selected = false;
        createjs.Tween.get(this.scale,{onComplete:()=>{
            this.selected = false;
        }}).wait(delay).to({x: 0, y: 0, z: 0}, 600, createjs.Ease.bounceOut);
    }
}