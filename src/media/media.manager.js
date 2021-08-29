import Emitter from "../events/emitter";
/*
    0 = HAVE_NOTHING - no information whether or not the audio/video is ready
1 = HAVE_METADATA - metadata for the audio/video is ready
2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
4 = HAVE_ENOUGH_DATA - enough data available to start playing
*/
export const MEDIA_STATES = {
    NOTHING: 0,
    METADATA: 1,
    PLAYABLE: 2,
    BUFFERING: 3,
    COMPLETED: 4
}
export class MediaManager extends Emitter {
    constructor() {
        super();
        this._playlist = [];
        this._currentIndex;
        this._media;
        this._videoEl;
        this._audioEl;
        this._ctx;
        this._analyser;
        this._config = {
            volume: 0.5,
            preload: true,
            autoplay: true,
            fadeAudio: true
        },
            this._syncMedia = false;
        this.v = false;
        this.a = false;
    }

    set playlist(lst) {
        this._playlist = lst;
        this._currentIndex = 0;
    }

    get playlist() {
        return this._playlist;
    }

    get context() {
        if (!this._ctx) {
            const ctx = Howler.ctx;
            const gain = ctx.createGain();
            const analyser = ctx.createAnalyser();
            this._ctx = ctx;
            this._analyser = analyser;

        }
        return this._ctx
    }

    get isReady() {
        if (this._syncMedia) {
            return this._videoEl.readyState >= MEDIA_STATES.PLAYABLE && this._audioEl.readyState >= MEDIA_STATES.PLAYABLE;
        } else {
            return this._videoEl.readyState >= MEDIA_STATES.PLAYABLE || this._audioEl.readyState >= MEDIA_STATES.PLAYABLE;
        }
    }

    connect(media) {
        const source = this.context.createMediaElementSource(media);
        source.connect(this._analyser);
        this._analyser.connect(this.context.destination);
    }

    play(videoSrc = undefined, audioSrc = undefined) {
        this.pause();
        this._syncMedia = (videoSrc && audioSrc);
   
        
       
        if (videoSrc) {
            this.v = false;
            this._videoEl.src = videoSrc;
        }

        if (audioSrc) {
             this.a = false;
            this._audioEl.src = audioSrc;
        }

        return this;
    }



    pause() {

        if (this._audioEl) this._audioEl.pause();

        if (this._videoEl) this._videoEl.pause();



        return this;
    }

    resume() {
        if (this._videoEl) this._videoEl.resume();
        if (this._audioEl) this._audioEl.resume();
        return this;
    }

    get progress() {
        return this._videoEl.progress || this._audioEl.progress;
    }

    get duration() {
        return this._videoEl.duration || this._audioEl.duration;
    }

    set volume(v) {
        this._config.volume = v;
        if (this._videoEl) this._videoEl.volume = v;
        if (this._audioEl) this._audioEl.volume = v;
    }

    get volume() {
        return this._config.volume;
    }

    get media() {
        return this._videoEl || this._audioEl;;
    }

    get readyState() {
        return this._audioEl.readyState | this._videoEl.readyState;
    }

    mediaSource() {
        const src = `${!this._videoEl.paused || !this._videoEl.ended ? 'video' : ''} ${!this._audioEl.paused || !this._audioEl.ended ? 'audio' : ''}`
        return src.trim();
    }

    mediaType() {
        if (this.media instanceof HTMLAudioElement) {
            return 'audio'
        } else if (this.media instanceof HTMLVideoElement) {
            return 'video'
        } else {
            return 'custom';
        }
    }

    createVideoElement(preload = true, autoplay = true, muted = true) {
        if (!this._videoEl) {
            const videoEl = document.createElement('video');
            videoEl.preload = preload;
            videoEl.autoplay = autoplay;
            videoEl.muted = muted;
            videoEl.playsInline = true;
            videoEl.addEventListener('load', (e) => {
                // if (!this.context) {
                //     this.connect(videoEl);
                // }

            }, false);
            //videoEl.addEventListener('canplay', this._mediaIsReady.bind(this), false);
            videoEl.addEventListener('canplaythrough', this._mediaIsFullyReady.bind(this), false);
            videoEl.addEventListener('ended', this._mediaEnded.bind(this), false);
            videoEl.addEventListener('play', (e)=> {
                console.log('kooooo',Howler)
                this.emit('play', e);
            })
            videoEl.addEventListener('timeupdate', (e) => {
                this.emit('timeupdate', e);
            }, false);
            videoEl.addEventListener('ratechange', (e) => {
                console.log('rate', e);
                this.emit('ratechange', e);
            }, false);
            videoEl.addEventListener('waiting', (e) => {
                console.log('waiting', e);
                this.emit('waiting', e);
            }, false);
            this._videoEl = videoEl;
        }
        return this._videoEl;
    }

    createAudioElement(preload = true, autoplay = true) {
        if (!this._audioEl) {
            const audioEl = new Audio();
            audioEl.preload = preload;
            audioEl.autoplay = autoplay;
            audioEl.addEventListener('load', (e) => {
              
                if (!this.context) {
                    this.connect(audioEl);
                }
                console.log(this.context)
            }, false);
            audioEl.addEventListener('canplay', this._mediaIsReady.bind(this), false);
            audioEl.addEventListener('canplaythrough', this._mediaIsFullyReady.bind(this), false);
            audioEl.addEventListener('ended', this._mediaEnded.bind(this), false);
            audioEl.addEventListener('timeupdate', (e) => {
                this.emit('timeupdate', e);
            }, false);
            audioEl.addEventListener('ratechange', (e) => {
                console.log('rate', e);
                this.emit('ratechange', e);
            }, false);
            audioEl.addEventListener('waiting', (e) => {
                console.log('waiting', e);
                this.emit('waiting', e);
            }, false);
            this._audioEl = audioEl;
           
        }
        return this._audioEl;
    }

    _mediaIsReady(e) {
        this.emit('ready', e);
        // if (this._config.fadeAudio) {
        //     gsap.fromTo(this.media, { volume: 0 }, { volume: this._config.volume, duration: 1.2, ease: 'sine' })
        // }

        this.emit('canplay', e)

    }

    _mediaIsFullyReady(e) {
        this.emit('fullyready', e);
        if(e.target === this._videoEl && !this.v)this.v = true; 
        if(e.target === this._audioEl && !this.a)this.a = true; 
        if (this._syncMedia) {
            if (this.a && this.v) {
                this.emit('fullyready', this._videoEl, this._audioEl)
            }
        } else {
            this.emit('fullyready',(e.target == this._videoEl) ? this._videoEl : null,(e.target == this._audioEl) ? this._audioEl : null)
        }
    }

    _mediaEnded(e) {
        this.emit('ended', e);
    }
}

export const createVideoTexture = (source) => {
    const videoTexture = new THREE.VideoTexture(source);
    videoTexture.flipY = false;
    return videoTexture;
}

export const createCanvasTexture = (canvas, ...mats) => {
    const canvasTexture = new THREE.CanvasTexture(canvas);
    const update = () => {
        mats.forEach(m => m.needsUpdate = true);
    }

    return {
        canvasTexture,
        update
    }
}

export const isAudio = (src) => {
    return src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.ogg')
}