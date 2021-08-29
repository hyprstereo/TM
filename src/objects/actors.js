import { GLTFLoader } from "../jsm/loaders/GLTFLoader";
import * as THREE from '../build/three.module';

export class Actors extends THREE.Object3D {
    constructor() {
        super();
        this._mixer;
        this._model;
        this._animations;
    }

    async load(src) {
        new GLTFLoader().load(src, scene => {
            console.log(scene)
            if (scene.animations) {
                this._animations = scene.animations;
                this._mixer = new THREE.AnimationMixer(scene.scene);
                this.add(scene.scene);
            }


        });
        return this;
    }

    play() {
        const action = this._animations[0];
        action.play();
        this.onBeforeRender = function (d) {
            this._mixer.update(d);
        }
        return this;
    }
}