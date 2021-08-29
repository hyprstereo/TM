import Emitter from "./events/emitter";
import { AmbientLight, Clock, HalfFloatType, Object3D, OrthographicCamera, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from "./build/three.module";

export class App extends Emitter {
    constructor() {
        super()
        this.renderer;
        this.props = {};
        this.states = {};
        this._renderTarget;
        this._currentScene;
        this._currentCamera;
        this._clock = new Clock(false);
    }

    setup(rendererConfig = undefined) {
        this.renderer = new WebGLRenderer({
            antialias: false,
            autoClear: false,
            depth: true,
            precisicion: HalfFloatType,
            ...rendererConfig
        });
        return this;
    }

    use(...addons) {
        Object.defineProperties(this, ...addons);
    }

    start() {
        this.emit('beforestart', this);
        this.emit('starting', this);
        this._clock.start();
        this.emit('started', this);
    }

    stop() {
        if(this._clock.running) {
            let cancel = false;
            this.emit('stopping', this, cancel);
            if (!cancel) this._clock.stop();
        }
    }
}

class SceneAbstract extends Scene {
    constructor(rootApp = undefined) {
        super();
        this._camera;
        this._composer;
        this._renderContext;
        this._app = rootApp;
        this._renderer;
        this._composer;
        this._clock = new Clock(false);
    }

    setup(renderer = undefined, camera = undefined) {
        this._renderer = renderer;
        this._camera = camera;
    }

    get camera() {
        return this._camera;
    }

    set camera(c) {
        this._camera = c;
    }

    get renderer() {
        return this._renderer;
    }
}

export class Scene extends Emitter {
    constructor() {
        super();
        Object.assign(this, SceneAbstract.prototype);
    }

    start() {
        this.emit('beforeStart', this);
        this.emit('starting', this);
        this._clock.start();
        this._emit('started', this);
    }

    stop() {
        this.emit('stopping', this);
        this._clock.start();
        this._emit('stopped', this);
    }
}