import { TextureLoader } from "../build/three.module";
import { ImageLoader, Sprite, SpriteMaterial } from "../build/three.module";
const spriteLoader = new TextureLoader();
export const SpriteLayer = 4;
export class SpriteButton extends Sprite {
    constructor(material = undefined) {
        if (!material) material = new SpriteMaterial();
        super(material);
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

    show(delay = 0) {
        this._hidden = false;
        createjs.Tween.get(this.scale ).to({x: 1, y: 1}, 600, createjs.Ease.bounceOut).wait(delay);
    }

    hide(delay=0) {
        this._hidden = true;
        createjs.Tween.get(this.scale ).to({x: 0, y: 0}, 600, createjs.Ease.bounceOut).wait(delay);
    }
}