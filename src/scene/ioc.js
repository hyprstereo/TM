import { Object3D, VideoTexture } from "../build/three.module";
import Emitter from "../events/emitter";
import { createVideoElement } from "../interact/pano";
import { SpriteButton, SpriteLayer } from "../objects/sprites";

export class IOCScene extends Emitter {
    constructor() {
        super();
        this._mainButton = [];
        this._group;
        this._container;
        this._state = -1;
        this._screenVideo;
    }

    async screenMonitorVideo(videoSrc) {
        return await new Promise((res, rej) => {
            if (!this._screenVideo) {
                createVideoElement(videoSrc).then(videoEl =>{
                    if (videoEl) {
                        document.body.appendChild(videoEl);
                         this._screenVideo = new VideoTexture(videoEl);
                         
                         this._screenVideo.flipY = false;
                         videoEl.play()
                         res(this._screenVideo);
                     } else {
                         rej('error video');
                     }
                });
                
            }
        })
        
    }

    bindPointer(ptr) {
        ptr.on('pointertouch', (objs) => {
            console.log('pointertouch', objs, ptr.selectedObjects);
        })

        ptr.on('hover', (objs) => {
            console.log('hover', objs);
        })
    }

    async create() {
        // this._container = 
        this._group = new Object3D();
        this._group.layers.set(SpriteLayer);
        this._buttons;
        this._mainButton.push(
            await new SpriteButton().load('/ui/cybersecurity/btn_ioc.png').then(s => s),
            await new SpriteButton().load('/ui/cybersecurity/btn_cyber.png').then(s => s),
        );
        const btns = this._mainButton;
        btns[0].position.x -= .5;
        btns[0].state = 0;
        btns[1].state = 0;

        btns[1].position.x += .5;
        this._group.add(btns[0]);
        this._group.add(btns[1]);

        this._buttons = btns;
        return this._group;
    }

    get GUIGroup() {
        return this._group;
    }

    set state(s) {
        this._state = s;
        this.__updateUI();
    }

    __updateUI() {
        this._buttons.forEach((b, i) => {
            const s = b.state;
            if (this._state === s) {
                b.show(i * 500);
            } else {
                b.hide(i * 50);
            }
        })
    }

    get object() {
        return this._group;
    }

    set object(s) {
        this._group = s;
    }

    update(ms = 0) {

    }
}