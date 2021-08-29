import * as THREE from "/build/three.module.js";
import Emitter from "../events/emitter";
import { createVideoElement } from "../interact/pano";
import { SpriteButton, SpriteLayer } from "../objects/sprites";
import { CSS3DRenderer, CSS3DObject } from '/js/jsm/renderers/CSS3DRenderer.js';
import { Actioneer, Timeliner } from "../media/timeliner";
import { createInteractiveCanvas } from "../interact/web.game";
import { GlobalProps } from "./props";
import { MediaManager } from "../media/media.manager";
import { MeshBasicMaterial } from "../build/three.module";
import { dom } from "../build/dat.gui.module";


export class IOCScene extends Emitter {
    constructor(sceneMan = undefined) {
        super();
        this.sceneManager = sceneMan;
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
        this._oldSet = '';
        this._alarm = null;
        this._volume = 0.5;
        this._fx = {};
        this._pos = [];
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight)
        this._mediaManager = new MediaManager();
        this._configureMediaManager();
        this._activeFX;
        this._selected;

        this.haveCss = false;
        this.guides = {
            next: false
        }
        this.sets = {
            ioc: new Timeliner(),
            cyber: new Timeliner
        }
        this._activeTL = null;
        this._data = null;
        this._loading = false;
    }

    _configureMediaManager() {
        const mediaMan = this._mediaManager;
        const self = this;
        mediaMan.on('canplay', (media, video, audio) => {
            console.log('can play', media, video, audio);
            self.emit('canplay', media, video, audio);
        });

        mediaMan.on('fullyready', (video, audio) => {
            console.log('fullyready', video, audio);
            self.emit('fullyready', this.currentItem, video, audio);


            if (video.target) video.target.muted = false;
            if (video.play) {
                video.play()
            }
            if (audio && audio.play) {
                audio.play();
                if (video) video.muted = true;
            }
            if (video.target) {
                video.target.play()
            }
            if (this._selected) {
                if (video) video.muted = false;
                if (video) video.volume = .5;
                self.emit("onmediastart", video, audio, self._currentSet, self._selected.index, self._selected.data || { tomi: { visible: true } });
            }
            this._selected = null;

        });

        mediaMan.on('play', (e) => {

            self.emit('play', e)
        })

        mediaMan.on('ended', (e) => {

            console.log('ended', e);
            self.emit('videoended', e);
        })

        const video = mediaMan.createVideoElement();
        video.style.display = 'none';
        const audio = mediaMan.createAudioElement();
        audio.style.display = 'none';
        if (video) {
            document.body.appendChild(video);

        }

        if (audio) {
            document.body.appendChild(audio);
        }
    }

    get media() {
        return this._videoEl;
    }

    set media(m) {
        this._videoEl = m;
    }

    currentItem() {
        if (this._activeList && this._activeIndex > -1) {
            return this._activeList[this._activeIndex];
        } else {
            return null;
        }
    }

    setupTimeline(...setups) {
        const self = this;
        setups.forEach((setup, i) => {
            if (typeof setup === 'function') {
                const ret = Object.apply(setup, [this.sets]);
                if (ret) {
                    if (ret instanceof Actioneer) {
                        if (self._activeTL) {
                            self._activeTL.add(ret);
                        }
                    }
                }
            }
        })
    }


    loadData(src) {
        let data;
        if (typeof src === 'string') {
            data = JSON.parse(src);
        } else {
            data = src;
        }
        this._data = data;
        return this._data;
    }

    /**
     * @source = ioc or cyber
     */
    setCurrentPlaylist(source = 'ioc', audioSource = undefined) {
        if (source !== this._oldSet) {
            this._oldSet = this._currentSet;
            this._currentSet = source;
            this._activeIndex = 0;
            this._activeList = this._videoList[source].items;
            this._audioList = audioSource || [];

            this.emit('newplaylist', this._activeList, source, this._oldSet);
        } else {
            this._audioList = audioSource || [];
        }
    }




    nextVideo(index = -1, showOnMain = false) {

      

        if (!this.endOfList()) {
            this._videoEl = this._screenVideo.image;

            if (index>-1) this._activeIndex = index;
            if (index<0) this._activeIndex++;
            const mm = this._mediaManager;
            const item = this.currentItem();
            this._selected = item;
            console.log(item);
          
            mm.play(item.data.src, item.data.audio);
           
        }

        return this;

    }

    endOfList() {
        return (this._activeIndex >= this._activeList.length - 1);
    }

    mainLED(src = undefined) {
        if (src) {
            if (src !== this._leds[1].material.map) {
                this._oriSrc = this._leds[1].material.map;
                this._leds[1].material.map = src;
            }
        } else {
            this._leds[1].material.map = this._oriSrc;
        }
        return this;
    }

    loadScene(cat = 0, index = 0) {
        const keys = Object.keys(this._videoList);
        const sel = this._videoList[keys[cat]];
        const item = sel.items[index];
        console.log(sel.label, item.label);
    }

    screenTexture() {
        return this._screenVideo;
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

        this._mediaManager.pause();
    }
    

    async selectedMonitor(target) {
        
        const scss = document.createElement('div')
        scss.style.display="block";
        scss.style.width="1280px"
        scss.height ="720px";
        scss.style.background='#fff';
        scss.style.color='#ffffff';
        scss.style.background='#000';
        scss.innerText="gabzilla";
        
        // this.scene.add(cssObj);
        const cssObj = new CSS3DObject(scss);

        const screenDom = document.createElement('div');
        screenDom.display = 'block';
        screenDom.width='1280px';
        // const {stage, onRendor} = createInteractiveCanvas(document.body);
        const planegeo = new THREE.PlaneGeometry()
        const planeMat = new MeshBasicMaterial({color:0xff00000});

        this._monitor = target;
        console.log(this._monitor)
        this._defaultTexture = target.material.map;
        target.material.reflectivity = 0;
        const box = new THREE.Box3().setFromObject(this._monitor);
        //const canvasT = await stage.toCanvas({callback:(c)=>c})
        //const rt = new THREE.CanvasTexture(canvasT);
        //target.material.map = rt;
        // target.position.x = 0;
        console.log(target)

        const size = box.getSize(target.position.clone())
        const hudgeo = new THREE.PlaneGeometry(size.x * 1.4, size.y * 1.4, 4, 4);
        const hudMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, opacity: 0, wireframe: false });
        this._hud = new THREE.Mesh(hudgeo, hudMat);

        target.position.x += 0.0791;
        target.add(new CSS3DObjectme
            )
        this._hud.position.copy(target.position);
        this._hud.position.x -= 0.002;
        this._hud.position.y += (size.y * 0.65);
        this._hud.position.z += 0.128;
        target.scale.x *= -1;
        //this._hud.position.z += (size.z * 0.5) + .081
        
        target.parent.add(this._hud);
        target.parent.add(cssObj)
        document.body.appendChildcss

        //this._monitor = target;
    }

    async screenMonitorVideo(videoSrc, deco = false) {
        const self = this;
        return await new Promise((res, rej) => {
            if (!this._screenVideo) {
                this._screenVideo = new THREE.VideoTexture(this._mediaManager._videoEl);
                this._screenVideo.flipY = false;
                res(this._screenVideo)
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

    async create(scene = undefined, config = { terminalPosition: new THREE.Vector3(), tomiInitialPosition: new THREE.Vector3() }) {
        // this._container = 
        this._group = new THREE.Object3D();
        this._group.layers.set(SpriteLayer);
        this._buttons;
        this._mainButton.push(
            await new SpriteButton().load('/ui/cybersecurity/btn_ioc.png').then(s => s),
            await new SpriteButton().load('/ui/cybersecurity/btn_cyber.png').then(s => s),
            await new SpriteButton().load('/ui/main/TEST.png').then(s => s),
            await new SpriteButton().load('/ui/main/next.png').then(s => s),
            await new SpriteButton().load('/ui/main/restart.png').then(s => s),
            await new SpriteButton().load('/ui/reactive.png').then(s => s),
            await new SpriteButton().load('/ui/proactive.png').then(s => s)

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
        const npos = config.terminalPosition;
        npos.y = config.tomiInitialPosition.y;
        btns[2].userData = { content: "move", target: t, position: npos }


        btns[2].position.set(0, -.5, -2);

        btns[3].position.x -= .48;
        btns[4].position.x = btns[3].position.x;


        btns[3].position.y += 0.1;
        btns[4].position.y = btns[3].position.y;

        btns[3].userData = { content: 'next' }
        btns[4].userData = { content: 'restart' }
        //btns[4].position.y -= 0.1;
        btns[3].maxScale = btns[4].maxScale = 0.2;

        //btns[4].state = 5;
        btns[4].hide();

        const proact = btns[5];
        const react = btns[6];

        //btns[2].lookAt(SceneManager.camera.position.clone())
        this._hud.position.z = -0.26;
        this._hud.add(btns[3], btns[4]);
        this._hud.add(btns[0]);
        this._hud.add(btns[1]);
        this._hud.add(proact);
        this._hud.add(react);
        proact.state = 0;
        react.state = 0;
        react.maxScale = proact.maxScale = 0.22;
        react.position.x -= 4
            // create screen css here

            const cssScreenObj = new CSS3DObject(dom)
            // end here
        
DocumentType.body.appendChild(

)
        proact.position.x = btns[0].position.x;
        this._group.add(btns[2]);
        // this._group.position.set(this._monitor.position.clone());


        this._buttons = btns;

        this.__updateUI()
        await this.createFX(scene, config);


        return this._group;
    }

    async createFX(scene, config = { terminalPosition: new THREE.Vector3(), tomiInitialPosition: new THREE.Vector3() }) {
        // this._leds[0].material = this._leds[1].material.clone();
        // this._leds[2].material = this._leds[0].material;
        // this._leds[0].material.image.src = 
        // this._leds[0].material.map.flipY=true;
        // this._leds[0].material = this._leds[1].material.clone();
        // this._leds[2].material = this._leds[0].material;
        // createVideoElement({ preload: true, autoplay: true }, '/video/n_ioc/Ioc_01_journey_1.mp4').then(videoEl => {
        //     if (videoEl) {


        //         document.body.appendChild(videoEl);
        //         const vt = new THREE.VideoTexture(videoEl);
        //         //vt.flipY = true;
        //         vt.autoUpdate = true;

        //         this._leds[0].material.map = vt;
        //        // this._leds[2].material=this._leds[0].material;
        //         this._leds[0].material.needsUpdate = true;
        //         videoEl.play = true;

        //     } else {
        //         rej('error video');
        //     }
        // });



        const self = this;
        const alarm = new FXWidget(this, scene);
        const ratT = await new THREE.TextureLoader().load('/texture/ioc/rat.png', t => t);

        const ratio = ratT.height / ratT.width
        const ratPlane = new THREE.PlaneGeometry(1, 1, 1);
        const vrat = new THREE.Mesh(ratPlane, new THREE.MeshBasicMaterial({ map: ratT, side: THREE.DoubleSide, transparent: true }));
        vrat.position.set(-0.06, 4.463, 10.337);
        const redLight = new THREE.AmbientLight(0xff0000, 2.0);
        const ledPos = this._leds[1].position.clone();
        const monitorPos = config.terminalPosition;
        monitorPos.z -= 0.2;
        monitorPos.y += 0.2;

        const redBtn = await new SpriteButton().load('/texture/ioc/redbtn.png', t => t);
        redBtn.maxScale = 0.05;
        redBtn.position.x -= 0.3;
        //redBtn.position.z -= 0.1;

        this._hud.add(redBtn);


        redLight.position.set(0, 3, 4);
        const tween = gsap.fromTo(redLight, 2, { intensity: 2 }, { intensity: 0.5, yoyo: true, repeat: -1 });
        alarm.tween = tween;
        alarm.sound0 = new Howl({
            src: ['/video/cyber/audio/C02a.mp3'],
            html5: true,
            autoplay: false
        });
        alarm.sound1 = new Howl({
            src: ['/video/cyber/audio/C02b.mp3'],
            html5: true,
            autoplay: false
        });
        alarm.sound0.onend = function () {
            alarm.iocScene.nextVideo(1);
        }
        // alarm.sound1 = new Howl({
        //     src: ['/video/cyber/audio/C02b.mp3'],
        //     html5: true,
        //     autoplay: false
        // }) 
        alarm.add(redLight);
        alarm.add(vrat);
        alarm.rat = vrat;

        vrat.position.z -= 0.5;
        alarm.create(
            function (a) {

                a.rat.position.set(0, 4.463, 10.337);
                a.rat.scale.set(3, 3, 3);
                a.rat.visible = false;
            },
            function (a) {
                //self._leds[2].material = GlobalProps.screens['monitor'].material;
                alarm.tween.play();
                redLight.visible = true;
                alarm.rat.visible = true;
                const delay = 18;
                alarm.t = gsap.fromTo(alarm.rat.position, { x: 0, y: 4.463, z: 10.337 }, {
                    x: 2.56, y: 1.67, z: -1.65, duration: 2, delay: delay, onComplete: () => {
                        const s = new THREE.Vector3(0.3, 0.3, 0.3);
                        alarm.t = gsap.fromTo(alarm.rat.scale, { x: 4, y: 4, z: 4 }, {
                            ...s,
                            duration: 2, delay: delay, onComplete: () => {
                                alarm.sound0.play();
                                redBtn.show();
                            }
                        });
                    }
                });

                // });

            },
            function (a) {
                redLight.visible = false;
                alarm.rat.visible = false;
                alarm.tween.pause(0);
                redBtn.hide();
                if (alarm.t) alarm.t.pause(0);
                alarm.sound1.play();
                if (alarm.iocScene._mediaManager) {
                    alarm.iocScene._mediaManager.pause();
                };

                setTimeout(_ => {
                    alarm.iocScene.nextVideo();
                }, 2000);

            },
            function (a) {

                redBtn.hide();
                redLight.visible = false;
                alarm.rat.visible = false;
                //alarm.tween.pause();
                alarm.sound0.stop();
            }
        );
        redBtn.userData = {
            activate: () => {
                alarm.next();
            },
            content: 'red-btn'
        }
        this._fx['alarm'] = alarm;

        const boss = new FXWidget(this, scene);
        boss.pillBlue = await new SpriteButton().load('/texture/ioc/blue.png', t => t);
        boss.pillRed = await new SpriteButton().load('/texture/ioc/red.png', t => t);
        boss.pillBlue.position.copy(monitorPos);
        boss.pillRed.position.copy(monitorPos);
        boss.pillRed.position.x -= .5;
        boss.pillBlue.position.x += .5;
        // boss.pillBlue.position.z = boss.position.z = 0;
        boss.pillRed.maxScale = boss.pillBlue.maxScale = 0.3;
        boss.pillBlue.userData = {
            content: 'pill-blue',
            activate: () => {
                alarm.iocScene.nextVideo(6);
            }
        }
        boss.pillRed.userData = {
            content: 'pill-red',
            activate: () => {
                alarm.iocScene.nextVideo(7);
            }
        }
        boss.create(
            function () {
                boss.add(boss.pillBlue, boss.pillRed);
            },
            function () {
                boss.pillBlue.show();
                boss.pillRed.show();
            },
            function () {
                boss.pillBlue.hide();
                boss.pillRed.hide();
            },
            function () {
                boss.pillBlue.hide();
                boss.pillRed.hide();
            }
        )
        this._fx['boss'] = boss;



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

    resetFX() {
        const fx = this._fx;
        for (let n in fx) {
            fx[n].reset();
        }
    }

    reset() {
        this.state = 1;
        this.mainLED();
        this.resetFX();
        this._currentSet = ''
        this._monitor.material.map = this._defaultTexture;
    }

    Button(index) {
        return this._buttons[index];
    }

    __updateUI() {
        this._buttons.forEach((b, i) => {
            const s = b.state;
            if (this._state === s) {
                b.show(i * .25, (i < 2) ? .5 : 1);
            } else {
                if (!b.selected)
                    b.hide(i * .25);
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
        this._howl = [];
        this._story = {
            start: null,
            active: null,
            success: null
        }
        this._scene = null;
        return this;
    }

    setAudio(...src) {
        src.forEach(s => {
            this._howl.push(new Howl({
                src: src,
                html5: true,
                volume: 1,
                autoplay: false
            }));
        })

        return this;
    }

    reset() {
        //if (this._story.reset)this._story.reset();
        if (this._howl) {
            this._howl.forEach(h => {
                h.stop();
            })
        }
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



        this._scene.add(this);
        this.visible = true;
        if (this._story.active) {
            this._story.active();
        }
        this.dispatchEvent({ type: 'activated' });
        return this;
    }

    deactivate() {
        if (this._activator) {
            this._activator(true);
        }
        this.visible = false;

        if (this._story.success) {
            this._story.success();
        }
        this._scene.remove(this);
        this.dispatchEvent({ type: 'deactivated' });
        return this;
    }

    respond(opts = 0) {

    }
}

export class FXWidget extends THREE.Object3D {
    constructor(iocScene, scene) {
        super();
        this.scene = scene;
        this.iocScene = iocScene;

        this._assets = [];
        this._inits = [];
        this._activates = [];
        this._nexts = [];
        this._deactivates = [];
        this.scene.add(this)
    }

    create(inits, activates, nexts, deactivates) {
        this._inits = [inits];
        this._activates = [activates];
        this._nexts = [nexts];
        this._deactivates = [deactivates];
        this._inits.forEach(init => {
            init(this);
        });
        this.visible = false;
    }

    activate() {
        this.iocScene._activeFX = this;
        this.visible = true;
        const self = this;
        this._activates.forEach(act => {
            act(self);
        })
    }

    next() {
        const self = this;
        this._nexts.forEach(n => {
            n(self);
        })
    }

    reset() {
        this.deactivate();
    }

    deactivate() {
        const self = this;
        this._deactivates.forEach(deac => {
            deac(self);
        })
    }
}

export const HTMLLayer = (target, lyr) => {
    const layer = new CSS3DObject(lyr);
    layer.position.set(0, 1, 0);
    target.add(layer);

    const rendr = new CSS3DRenderer();

    return {
        rendr,
        layer
    }
}

export const HTMLFrame = (src) => {
    const dom = document.createElement('iframe');
    dom.sandbox = 'allow-scripts'
    dom.allow = 'microphone; camera'
    dom.allowFullscreen = true;
    dom.style.position = 'absolute';
    dom.style.display = 'block';
    dom.style.zIndex = 100;
    dom.width = 800;
    dom.height = 600;

    document.body.appendChild(dom);
    dom.src = src;
    return dom;
}