import { SceneConfig } from "../app";
import { BackSide, Box2, Box3, DoubleSide, FrontSide, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, RepeatWrapping, Vector3, VideoTexture } from "../build/three.module";
import { SceneManager } from "../controllers/view";
import Emitter from "../events/emitter";
import { createVideoElement } from "../interact/pano";
import { SpriteButton, SpriteLayer } from "../objects/sprites";
import { degToRad } from "../utils/helpers";

export class IOCScene extends Emitter {


    constructor() {
        super();
        this._mainButton = [];
        this._group;
        this._container;
        this._state = 0;
        this._screenVideo;
        this._monitor;
        this._hud;
        this._videoList;
        this._videoEl;
        this._activeList;
        this._activeIndex = 0;
    }

    /**
     * @source = ioc or cyber
     */
    setCurrentPlaylist(source = 'ioc') {
        this._activeIndex = 0;
        this._activeList = this._videoList[source];
    }

    nextVideo() {
        const self = this;
        this._videoEl = this._screenVideo.image;
        console.log(this._videoEl);
        if (this._videoEl) {
            this._videoEl.addEventListener('loaded', (e) => {
                console.log('loaded');
                //self._videoEl.play();
                self.emit('videoloaded', { event: e, el: this._videoEl });
                
            });
            this._videoEl.onerror = (e) => {
                this.emit('videoerror', e);
            }
            this._videoEl.onend = (e) => {
                console.log('ended');
            }
            this._videoEl.src = this._activeList[this._activeIndex];
            this._videoEl.muted = true;
            this._videoEl.volume = 0.5;
            
            SceneManager.tomi.playSound( this._activeList[this._activeIndex]).then(media=>{
              
                this._videoEl.muted = true;
                this._videoEl.play();
                media.play();
            })       
            if (!this.endOfList()) this._activeIndex++;
        }
    }

    endOfList() {
        return this._activeIndex == this._activeList.length - 1;
    }

    async loadVideoList() {
        const url = './app/list_ioc.json';
        const result = await fetch(url).then(data => data.json());
        if (result) {
            this._videoList = result;
            return this._videoList;
        }
        return;
    }

    resetVideo() {
        if (this._videoEl) {
            console.log(this._videoEl, this._screenVideo);
        }
    }

    selectedMonitor(target) {
        this._monitor = target;
        const box = new Box3().setFromObject(this._monitor)

        // target.position.x = 0;
        console.log(target.scale);
        const size = box.getSize(target.position.clone())
        const hudgeo = new PlaneGeometry(size.x * 1.4, size.y * 1.4, 4, 4);
        const hudMat = new MeshBasicMaterial({ transparent: true, side: BackSide, opacity: 0 });
        this._hud = new Mesh(hudgeo, hudMat);
        //this._hud.scale.set(-1, 1, 1);

        //this._hud.position.y = (size.y * 1.1)/2;
        //this._hud.position.x = (size.x * 1.1)/2;
        target.position.x += 0.0791;
        this._hud.position.copy(target.position);
        this._hud.position.x -= 0.002;
        this._hud.position.y += (size.y * 0.65);
        this._hud.position.z -= 0.08;
        target.scale.x *= -1;
        //this._hud.position.z += (size.z * 0.5) + .081
        target.parent.add(this._hud);
    }

    async screenMonitorVideo(videoSrc) {
        const self = this;
        return await new Promise((res, rej) => {
            if (!this._screenVideo) {
                createVideoElement(videoSrc).then(videoEl => {
                    if (videoEl) {
                        self._videoEl = videoEl;
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
            await new SpriteButton().load('/ui/main/TEST.png').then(s => s),
        );

        const btns = this._mainButton;

        btns[0].position.x -= .25;
        btns[0].state = 1;
        btns[0].position.y = 0.25;
        btns[1].position.y = 0.25;

        btns[0].position.z = -.15;
        btns[1].position.z = -.15;

        btns[0].userData = { content: "ioc" }
        btns[1].state = 1;
        btns[1].userData = { content: "cyber" }
        btns[2].state = 0;
        const t = new Vector3(
            2.7386961282304516,
            1.4184025920287329,
            -3.224884850247932);
        t.y = 1;
        btns[2].userData = { content: "move", target: t, position: SceneConfig.TerminalPosition[0] }
        btns[1].position.x += .25;

        btns[2].position.set(0, -.5, -2);
        btns[2].lookAt(SceneManager.camera.position.clone())

        this._hud.add(btns[0]);
        this._hud.add(btns[1]);
        this._group.add(btns[2]);
        // this._group.position.set(this._monitor.position.clone());


        this._buttons = btns;
        this.__updateUI();
        // this._monitor.add(this._group);
        return this._group;
    }

    get GUIGroup() {
        return this._group;
    }

    set state(s) {
        this._state = s;
        this.emit('statechange', this._state);
        this.__updateUI();
    }

    __updateUI() {
        this._buttons.forEach((b, i) => {
            const s = b.state;
            if (this._state === s) {
                b.show(i * 50, (i < 2) ? .5 : 1);
            } else {
                if (!b.selected)
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

    setupContent(tomi,) {

    }
}