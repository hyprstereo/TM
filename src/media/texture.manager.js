
import * as THREE from "../build/three.module";
import Emitter from "../events/emitter";

export class TextureManager extends Emitter {
    constructor(scope = undefined) {
        super();
        this.scope = scope;
        this._textures = [];
    }

    async loadTextures(...src) {
        const loader = new THREE.TextureLoader();
        const self = this;
        src.forEach(async (s, i) => {
            if (s.type === 'video') {
                s.material.side = THREE.DoubleSide;
                
                const videoEl = self.createVideoElement(`video-${s.label}`);
                videoEl.onload = function(e) {
                    
                    s.image = new THREE.VideoTexture(videoEl);
                    if (s.material) {
                        s.material.map = s.image;
                        s.material.needsUpdate = true;
                    }
                    videoEl.play();
                }
                videoEl.src = s.src;
                s.video = videoEl;
            } else {
                if (s.src) {
                    const texture = await loader.load(s.src, t => t);
                    if (texture) {
                        if (s.type === 'canvas') {
                            s.image = new THREE.CanvasTexture(s.image);
                        } else if (s.type === 'video') {

                        } else {
                            s.image = texture;
                        }
                        
                       
                    }
                }
            }
            if (s.material && s.type !== 'video') {
                s.material.map = s.image;
                s.material.needsUpdate = true;
            }
            src[i] = s;
            if (i == src.length - 1) {
                self.emit('loaded', this, src);
            }
            this._textures.push(s);
        })
        return src;
    }



    createVideoElement(id = undefined, config = { preload: true, autoplay: false, muted: true, playsinline: true }) {
        const video = document.createElement('video');
        if (id) video.id = id;
        for (let j in config) {
            video[j] = config[j];
        }
        video.style.display = 'none';
        document.body.appendChild(video);

        return video;
    }

    getTexture(id) {
        return this._textures[id];
    }

    getTextureByType(type = 'src', match = undefined) {
        const result = this._textures.filter((els, i) => {
            return els[type] === match;
        });
        return result;
    }

    updateTexture(id, imageData) {
        this._textures[id].image = imageData;
        this._textures[id].needsUpdate = true;
    }
}