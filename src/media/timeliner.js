import Emitter from '../events/emitter'
export const DefaultConfig = {
    ease: 'sine.out',
    duration: 1.2,
}

export class Timeliner extends Emitter {
    constructor(config = {}) {
        super();
        config = { ...DefaultConfig, ...config };
        this._master = gsap.timeline(config);
        this.tls = [];
    }

    insert(actioneer) {
        this.tls.push(actioneer);
    }

    clearActions() {
        this.timeline.clear();
        this.tls = [];
    }

    updateTime() {
        this.timeline.clear();
        this.tls.forEach((tl,i) => {
            this.add(tl.timeline, tl.label);
        })
    }

    add(tween, dur = undefined) {
        if (!dur) dur = '>';
        this._master.add(tween, dur);
    }

    newTimeline(lbl = undefined, starts = 0, config = undefined) {
        const c = {
            onComplete: config.complete || null,
            onUpdate: config.update || null,
            onStart: config.start || null,
        }
        const tl = new Actioneer(this, lbl, config);
        this._master.add(tl.timeline, tl.label);
        return tl;
    }

    timeScale(ts) {
        this._master.timeScale(ts);
    }


    get timeline() {
        return this._master;
    }

    set timeline(tl) {
        this._master = tl;
    }

}


export class Actioneer extends Emitter {
    constructor(par = undefined, lbl = undefined, config = undefined) {
        super();
        this._tl = gsap.timeline(config);
        this.type = config.type || 'default';
        this.label = lbl;
        this._parent = par;
        this.endBehavior = 'next';
        
        this.playFromAudio = false;
        this.playFromVideo = false;

        this.config = {
            onStart: this._starting.bind(this),
            onComplete: this._complete.bind(this),
            onUpdate: this._update.bind(this),
            ...config
        };
    }

    _starting() {
        this.emit('start', this);
    }

    _update() {
        this.emit('update', this)
    }

    _complete() {
        this.emit('complete', this);
        switch (this.endBehavior) {
            case 'next':
                if (this._parent && this._parent.timeline) {
                    this._parent.timeline.nextLabel();
                }
                break;
            case 'pause':
                this.emit('paused', this);
                break;
            case 'delay':
                this._tl.pause();
                let defs = {
                    duration: 1, fn: () => {
                        this._tl.resume();
                    },
                };
                this.emit('delay', defs);
                gsap.delayedCall(defs.duration, defs.fn, defs.params);
                break;
        }
    }

    get timeline() {
        return this._tl;
    }

    set timeline(tl) {
        this._tl = tl;
    }

    playAfterMediaLoads (mediaSrc) {
        const self = this;
        if (mediaSrc.onload) {
            mediaSrc.onload = (e) => {
                self.emit('medialoaded', mediaSrc, this);
                mediaSrc.play();
                self._tl.play();
            }
        }
        if (mediaSrc.onerror) {
            mediaSrc.onerror = (e) => {
                self.emit('mediaerror', mediaSrc, this);
            }
        }
        return this;
    }

    play(starts = undefined) {
        this.timeline.play(starts);
        return this;
    }
}