import * as THREE from '/build/three.module.js';

export class ScreenDisplay extends THREE.Mesh {
    static Screens = [];
    constructor(mediaSrc = undefined) {
        super();
        this._audio;
        this._video;
        this._videoTexture;
        this._src;
        ScreenDisplay.Screens.push(this);
        if (mediaSrc) this.loadMedia(mediaSrc);
    }

    async loadMedia(...src) {
        return await new Promise((res, rej) => {
            this._src = src;
           //if (mediaType(src) === 'video') {
                this.video.src = src;
            //}
        })
    }

    copy(mesh) {
        super.copy(mesh);
        if (!this.material) {
            this.material = new THREE.MeshBasicMaterial({color:0xffeeff});
        }
        this.material.map = this._videoTexture;
    }

    get video() {
        if (!this._video) {
            const video = document.createElement("video");
            video.preload = true;
            video.playsInline = video.muted = true;
            video.loop = true;
            this._src.forEach((src) => {
                const source = document.createElement("source");
                source.src = src;
                video.appendChild(source);
            });
            video.style.display = "none";
            //video.crossOrigin = "anonymous";
            video.autoplay = true;
            document.body.appendChild(video);
            this._video = video;
        }
        return this._video;
    }

    set video(v) {
        this._video = v;
    }

    get texture() {
        if (!this._videoTexture) {
            this._videoTexture = new THREE.VideoTexture(this.video);
        }
        return this._videoTexture;
    }

    set texture(t) {
        this._videoTexture = t;
    }
}

export const mediaType = (src) => {
    if (src.endsWith('.mp3') || src.endsWith('.wav')) {
        return 'audio';
    } else if (src.endsWith('.mp4') || src.endsWith('.m4v')) {
        return 'video';
    } else {
        return 'unknown'
    }
}