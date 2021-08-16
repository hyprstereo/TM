import { TextureLoader, ImageLoader, Sprite, SpriteMaterial, Object3D, MeshBasicMaterial, BoxGeometry, Mesh, PlaneGeometry, DoubleSide } from "../build/three.module";
import { degToRad } from "../utils/helpers";
const spriteLoader = new TextureLoader();
export const SpriteLayer = 5;
export class SpriteButton extends Mesh {
    constructor(material = undefined) {
        const c = new PlaneGeometry(1, 1, 1);
        if (!material) material = new MeshBasicMaterial({transparent:true, side: DoubleSide});
        c.rotateY(degToRad(180));
        super(c, material);
        this.selected = false;
       

       //
       this.layers.set(SpriteLayer);
        this._hidden = false;
        this.state = -1;
        this.hide();
        return this;
    }

    async load(src) {
        return await new Promise((res, rej) =>{
            spriteLoader.load(src, (img) => {
                this.material.map = img;
                res(this); 
            },null, (e) => rej(e));
        });
    }

    onPointerDown(delay = 1200, scale = .6,cursor = undefined, cb = undefined) {
        this.selected = true;
        this.scale.set(0.5, 0.5, 0.5);
        createjs.Tween.get(this.scale, {onComplete:()=>{
            if (cb) cb(this.userData);
            this.selected = false;
            this.hide();
        }} ).wait(delay).to({x:scale, y: scale, z: scale}, 600, createjs.Ease.bounceOut);
    }

    show(delay = 0, scale = 1) {
        this._hidden = false;
        createjs.Tween.get(this.scale ).wait(delay).to({x:scale, y: scale, z: scale}, 600, createjs.Ease.bounceOut);
    }

    hide(delay=0) {
        this._hidden = true;
        this.selected = false;
        createjs.Tween.get(this.scale,{onComplete:()=>{
            this.selected = false;
        }}).wait(delay).to({x: 0, y: 0, z: 0}, 600, createjs.Ease.bounceOut);
    }
}