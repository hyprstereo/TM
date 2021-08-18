import { SceneConfig } from "../app";
import * as THREE from "/build/three.module.js";
import { SceneManager } from "../controllers/view";
import Emitter from "../events/emitter";
import { createVideoElement } from "../interact/pano";
import { SpriteButton, SpriteLayer } from "../objects/sprites";
import { degToRad } from "../utils/helpers";
import { GLTFLoader } from "../jsm/loaders/GLTFLoader";
import { TomiPositions } from "./debug";
import { Mesh, MeshBasicMaterial } from "../build/three.module";

export class IOCScene extends Emitter {
    constructor() {
        super();
        this._mainButton = [];
        this._group;
        this._container;
        this._state = 0;
        this._screenVideo;
        this._monitor;
        this._leds = [];
        this._hud;
        this._videoList;
        this._videoEl;
        this._activeList;
        this._activeIndex = 0;
        this._audioList = [];
        this._currentSet = '';
        this._alarm = null;
        this._fx = {};
        this._pos = [];
        this.guides = {
            next: false
        }
    }

    /**
     * @source = ioc or cyber
     */
    setCurrentPlaylist(source = 'ioc', audioSource = undefined) {
        this._currentSet = source;
        this._activeIndex = 0;
        this._activeList = this._videoList[source];
        this._audioList = audioSource || [];
        this.emit('newplaylist', this._activeList);
    }

    replay() {
        const self = this;
        this._videoEl = this._screenVideo.image;

        if (this._videoEl) {
            SceneManager.tomi.stopSound();
            const self = this;
            this._videoEl.pause();
            this._videoEl.onloaded = (e) => {
                console.log('loaded');
                //self._videoEl.play();
                self.emit('videoloaded', { event: e, el: this._videoEl });

            };

            this._videoEl.onended = (e) => {
                self.emit('videoended', (e));
            }
            this._videoEl.onerror = (e) => {
                this.emit('videoerror', e);
            }
            this._videoEl.onend = (e) => {
                console.log('ended');
            }
            this._videoEl.src = this._activeList[this._activeIndex];
            this._videoEl.muted = true;
            this._videoEl.volume = 0.5;

            SceneManager.tomi.playSound(this._activeList[this._activeIndex]).then(media => {
                this._videoEl.muted = true;
                this._videoEl.play();
                if (media) {
                    media.volume = 0.5;
                    media.play();
                }
                self.emit("onmediastart", self._videoEl, media, self._currentSet, self._activeIndex);
            })
        }
    }

    nextVideo() {
        const self = this;
        this._videoEl = this._screenVideo.image;

        if (this._videoEl) {
            SceneManager.tomi.stopSound();
            const self = this;
            this._videoEl.pause();
            this._videoEl.onloaded = (e) => {
                console.log('loaded');
                //self._videoEl.play();
                self.emit('videoloaded', { event: e, el: this._videoEl });

            };

            this._videoEl.onended = (e) => {
                self.emit('videoended', (e));
            }
            this._videoEl.onerror = (e) => {
                this.emit('videoerror', e);
            }
            this._videoEl.onend = (e) => {
                console.log('ended');
            }
            this._videoEl.src = this._activeList[this._activeIndex];
            this._videoEl.muted = true;
            this._videoEl.volume = 0.5;

            SceneManager.tomi.playSound(this._activeList[this._activeIndex]).then(media => {
                this._videoEl.muted = true;
                this._videoEl.play();
                if (media) {
                    media.volume = 0.5;
                    media.play();
                }
                self.emit("onmediastart", self._videoEl, media, self._currentSet, self._activeIndex);
            })
            if (!this.endOfList()) this._activeIndex++;
        }
    }

    endOfList() {
        return (this._activeIndex >= this._activeList.length - 1);
    }

    async loadVideoList() {
        const url = './list_ioc.json';
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
        const box = new THREE.Box3().setFromObject(this._monitor)

        // target.position.x = 0;
        console.log(target.scale);
        const size = box.getSize(target.position.clone())
        const hudgeo = new THREE.PlaneGeometry(size.x * 1.4, size.y * 1.4, 4, 4);
        const hudMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, opacity: 0, wireframe: false });
        this._hud = new THREE.Mesh(hudgeo, hudMat);
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
                createVideoElement({ preload: true, autoplay: false }, videoSrc).then(videoEl => {
                    if (videoEl) {
                        self._videoEl = videoEl;
                        document.body.appendChild(videoEl);
                        this._screenVideo = new THREE.VideoTexture(videoEl);
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

    async create(scene = undefined) {
        // this._container = 
        this._group = new THREE.Object3D();
        this._group.layers.set(SpriteLayer);
        this._buttons;
        this._mainButton.push(
            await new SpriteButton().load('/ui/cybersecurity/btn_ioc.png').then(s => s),
            await new SpriteButton().load('/ui/cybersecurity/btn_cyber.png').then(s => s),
            await new SpriteButton().load('/ui/main/TEST.png').then(s => s),
            await new SpriteButton().load('/ui/main/next.png').then(s => s),
            await new SpriteButton().load('/ui/main/restart.png').then(s => s)
        );

        const btns = this._mainButton;
        const offset = 0.29;
        btns[0].position.x -= offset;
        btns[1].position.x += offset;
        btns[0].state = 1;
        btns[0].position.y = 0.25;
        btns[1].position.y = 0.25;
        btns[0].maxScale = btns[1].maxScale = 0.6;

        btns[0].position.z = -.15;
        btns[1].position.z = -.15;



        btns[3].state = btns[4].state = 5;

        //btns[4].hide();

        btns[0].userData = { content: "ioc" }
        btns[1].state = 1;
        btns[1].userData = { content: "cyber" }
        btns[2].state = 0;

        const t = new THREE.Vector3(
            2.7386961282304516,
            1.4184025920287329,
            -3.224884850247932);
        t.y = 1;
        const npos = { ...SceneConfig.TerminalPosition[0] };
        npos.y = SceneConfig.TomiInitialPosition.y;
        btns[2].userData = { content: "move", target: t, position: npos }


        btns[2].position.set(0, -.5, -2);

        btns[3].position.x -= .48;
        btns[4].position.x = btns[3].position.x;

        btns[3].position.z = -.25;
        btns[3].position.y += 0.1;
        btns[4].position.y = btns[3].position.y;
        btns[4].position.z = -.25;
        btns[3].userData = { content: 'next' }
        btns[4].userData = { content: 'restart' }
        //btns[4].position.y -= 0.1;
        btns[3].maxScale = btns[4].maxScale = 0.2;

        //btns[4].state = 5;
        btns[4].hide();

        //btns[2].lookAt(SceneManager.camera.position.clone())
        this._hud.add(btns[3], btns[4]);
        this._hud.add(btns[0]);
        this._hud.add(btns[1]);
        this._group.add(btns[2]);
        // this._group.position.set(this._monitor.position.clone());


        this._buttons = btns;


        this.createFX(scene);

        this.__updateUI();

        return this._group;
    }

    async createFX(scene) {
        // this._monitor.add(this._group);
        const alarm = new ScenePropFX();
        let vrat;
        const self = this;
        new GLTFLoader().load('/models/ioc/virus-base.glb', (s) => {
            const sce = s.scene || s;


            const help = new THREE.AxesHelper(1);
            help.layers.set(7);
            const ratRef = help.clone();
            ratRef.position.copy(sce.children[2].position);
            ratRef.name = 'rat-ref';

            const ratT = new THREE.TextureLoader().load('/texture/ioc/rat.png');
            const ratio = ratT.height / ratT.width
            const ratPlane = new THREE.PlaneGeometry(ratio, 1, 1);
            vrat = new Mesh(ratPlane, new MeshBasicMaterial({ map: ratT, side: THREE.DoubleSide }));
            vrat.position.copy(ratRef.position);
            vrat.rotateX(degToRad(-90));

            sce.children.forEach(n => {

                const h = help.clone();
                h.name = n.name;
                h.position.copy(n.position);
                self._pos.push(n.position.clone());
                scene.add(h);
            });
            scene.add(ratRef);


            alarm.add(vrat);
            alarm.add(sce);
        });



        const redLight = new THREE.AmbientLight(0xff0000, 2.0);
        // const redHelper = new THREE.PointLightHelper(redLight, 0.1, 0xff00ff);
        // redHelper.layers.set(7);
        // redLight.add(redHelper);

        redLight.position.set(0, 3, 4);
        const tween = gsap.to(redLight, 2, { intensity: 0.5, yoyo: true, repeat: -1 });

        const ratMesh = await new SpriteButton().load('/texture/ioc/VirusRat.png');
        const ledPos = this._leds[1].position.clone();
        const monitorPos = this._monitor.position.clone();
        alarm
            .create(scene, redLight, ratMesh)
            .setAudio("/video/cyber/audio/C01.mp3", "/video/cyber/audio/C02a.mp3", "/video/cyber/audio/C02b.mp3")
            .story = {
            start: () => {
                ratMesh.position.x = ledPos.x;
                ratMesh.position.y = ledPos.y;
                ratMesh.position.z = ledPos.z - .5;

                tween.pause();
                alarm._howl.stop();
            },
            active: () => {
                gsap.to(ratMesh.position, 2, { x: monitorPos.x, y: monitorPos.y, z: monitorPos.z });
                alarm._howl.play();
                tween.play();
            },
            success: () => {
                alarm._howl.stop();
                tween.stop();
            }
        };
        this._fx['alarm'] = alarm;
    }

    FX(name) {
        return this._fx[name];
    }

    get GUIGroup() {
        return this._group;
    }

    set state(s) {
        this._state = s;
        this.emit('statechange', this._state);
        this.__updateUI();
    }

    Button(index) {
        return this._buttons[index];
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

export class ScenePropFX extends THREE.Object3D {
    constructor() {
        super();
        this._enabled = false;
        this._howl = null;
        this._story = {
            start: null,
            active: null,
            success: null
        }
        this._scene = null;
        return this;
    }

    setAudio(...src) {
        this._howl = new Howl({
            src: src,
            html5: true,
            volume: 1,
            autoplay: false
        });
        return this;
    }

    set story(s) {
        this._story = s;
    }

    get story() {
        return this._story;
    }

    create(scene, ...child) {
        this._scene = scene;
        this.add(...child);
        this.dispatchEvent({ type: 'created' });
        if (this._story.start) {
            this._story.start();
        } else {
            this.visible = false;
        }
        return this;
    }

    activate() {


        if (this._story.active) {
            this._story.active();
        }
        this._scene.add(this);
        this.visible = true;
        this.dispatchEvent({ type: 'activated' });
        return this;
    }

    deactivate() {
        if (this._activator) {
            this._activator(true);
        }
        this.visible = false;
        this.dispatchEvent({ type: 'deactivated' });
        if (this._story.success) {
            this._story.success();
        }
        this._scene.remove(this);
        return this;
    }

    respond(opts = 0) {

    }
}