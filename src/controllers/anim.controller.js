import *  as THREE from "../build/three.module";
import Emitter from "../events/emitter";
import { SceneManager } from "./view";

export class AnimaxClip extends THREE.AnimationClip {
    constructor(name = undefined, duration = undefined, tracks = undefined, blendMode = undefined) {
        super(name, duration, tracks, blendMode);
        return this;
    }

    pause() {
        this.paused = true;
        return this;
    }

    continue() {
        this.paused = false;
        return this;
    }

    rewind() {
        this.timeScale *= -1;
        return this;
    }
}


function getAnimationList() {
    const list = SceneManager.tomi._clips;
    let data = ``;
    list.forEach((l, i) => {
        data += `
        <option value="${i}">${l.name}</option>`;
    });
    return data;
}

export class AnimaxTimeline extends Emitter {
    constructor() {
        super();
        this._media = null;
        this._duration = null;
        this._audio = null;
        this._tracks = {}
        this._pos = 0;
        this._el = null;
        this._tm = null;
        this._scrubber = null;
        this._pointerdown = false;
        this._modal = null;
        this._playing = false;
        this._lastF = -1;
        this.tl = gsap.timeline();
        this._label = 'def';
        this.recording = false;

        return this;
    }

    currentTL() {
        return this.tl[this._label];
    }

    newTrack(label, tl = undefined) {
        this._label = label;
        if (!this.tl == tl) {

            this.tl = tl || gsap.timeline();
        }
        return this.ti
    }

    addActionTrack(target, time = -1, props = undefined) {
        if (time < 0) time = this.time;
        if (props) this.tl.to(target, props, time);
        else this.tl.add(target, time);
    }

    setElement(target = undefined) {
        const parent = (target) ? document.querySelector(target) : document.body;
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.zIndex = 100;
        el.style.height = '1rem';
        el.style.fontSize = '0.7rem';
        el.style.width = '100%';
        el.style.display = `inline-flex`;
        el.style.flexDirection = 'columns';
        el.style.backgroundColor = `#888888`;
        el.style.bottom = '0';

        const scrubber = document.createElement('div');
        scrubber.style.position = `absolute`;

        scrubber.style.display = `inline-block`;
        scrubber.style.overflow = `hidden`;
        scrubber.style.pointerEvents = 'none'
        scrubber.style.backgroundColor = `#ffae00`;
        scrubber.style.width = '0';
        scrubber.style.height = '100%'
        scrubber.style.margin = '0';
        el.appendChild(scrubber);
        this._scrubber = scrubber;

        const modal = document.createElement('div');
        modal.classList.add('w3-modal');
        modal.id = 'id01';

        const dat = document.querySelector('div.dg');
        modal.innerHTML = `<div class="w3-modal-content w3-card-4 w3-half w3-center w3-responsive">
        <header class="w3-container">
        <span onclick="document.getElementById('id01').style.display='none'" class="w3-button w3-display-topright">&times;</span>
        <h2>Animation Manager</h2>        
        </header>
        <div class="w3-container cont">
        <table class="w3-table w3-striped w3-bordered w3-border w3-hoverable w3-responsive">
    <thead>
      <tr class="w3-light-grey">
        <th>Actions Set</th>
      </tr>
    </thead>
    <tr>
      <td></td>
    </tr>
    <tr>
    <td>Animation</td>
    <td><select onchange="(e)=>alert(e.target.value)">
        ${getAnimationList()}
    </select>
    <button class="w3-btn">Add</button>
    </td>
    </tr>
  </table>
</div>
        </div>
        </div>
        `;

        modal.style.display = 'none';
        parent.appendChild(modal);
        this._modal = modal;

        this._el = el;
        parent.appendChild(el);
        const self = this;
        el.addEventListener('pointerdown', (e) => {
            self._pointerdown = true;
            self.getTimePixel(e.clientX);
        })

        el.addEventListener('pointermove', (e) => {
            if (self._pointerdown) {
                self.getTimePixel(e.clientX);
            }
        });
        el.addEventListener('pointerup', (e) => {
            self._pointerdown = false;
        });
        el.addEventListener('dblclick', (e) => {
            self._media.pause();
            self._audio.pause();
            self._modal.querySelector(`h2`).innerText = `Add Actions on :${self.getTimePixel(e.clientX)}`;
            self._modal.style.display = `block`
        });
        return this._el;
    }

    useMedia(media = undefined, audio = undefined, duration = 0) {
        if (media || audio) {
            this._media = media;
            this._audio = audio;
            if (media instanceof HTMLVideoElement || media instanceof Howl) {
                this._duration = this.duration.toFixed(3);
                this._scrubber.innerHTML = `<div>${this.time} / ${this._media.duration}</div><div>${this._media}</div>`;
                this.play(0);
            }
        } else {
            this._media = {
                currentTime: 0,
                position: 0,
                duration: duration,
                pause: () => { },
                play: () => { },
                stop: () => { },
            }
            this._tm = 0;
            this._pos = 0;
        }
        this._timeline = gsap.timeline({ repeat: 0 });
    }

    play(label = 0) {
        this._playing = true;
        if (!this.recording) {
            if (this.tl) this.tl.play(label);
        }
    }

    pause() {
        this._playing = false;
        // this._media.pause()
    }

    stop() {
        this._playing = false;
        this._pos = 0;
        //this._media.stop();
    }

    getTimePixel(pos) {
        const tm = pos / parseFloat(this._el.clientWidth) * this.duration;
        this._media.currentTime = tm;

        this.emit('seek', tm);
        return tm;
    }

    update(delta = 0) {
        if (this._playing) {
            //this.tl.progress(this.time/this.duration);
            const ts = this.getTimeString()
            if (delta <= .025) {
                const self = this;

                self._scrubber.innerHTML = `<div>${ts.t} / ${ts.d}</div>`;
                self._scrubber.style.width = `${(self.time / self.duration) * 100}%`
                self.emit('tick', self.time, self.duration);

                //  if (this._pos >= this.duration) this._pos = this.duration;
                // self.emit('animationend', self._pos)
                //self.stop();
                // const f = Math.floor(this.time % 2);
                // if (this._tracks[f] && this._lastF < f) {
                //     this._lastF = f;
                //     const a = this._tracks[f];
                //     if (a.props) {
                //         for (let fn in a.props) {
                //             if (typeof a.props[fn] === 'function') {
                //                 a.props[fn]();
                //             }
                //         }

                //     }
                // }
            }


        }
    }

    getTimeString() {
        return { t: this.time.toFixed(3), d: this.duration.toFixed(3) }
    }

    get duration() {
        return this._media.duration;
    }

    get time() {
        return this._media.currentTime;
    }

    get domElement() {
        return this._el;
    }
}