
(function () {
    var UITemplate = `
<section class="tm-card tm-panel tm-tray tm-bg tm-size-content">
    <header class="tm-card-header"><span class="tm-title"></span><nav class="tm-tiles tm-justify-around"></nav></header>
    <hr>
    <div class="tm-tray-body">
        
    </div>
    <footer class="tm-flex-rows">
    </footer>
    <!--/end of action buttons -->
</section>
`
    var MediaControlTemplate = `
    <div class="tm-tiles tm-justify-around">
    <button data-ctl="list" class="i-btn"><i class="material-icons">list</i></button>
    <button data-ctl="replay" class="i-btn"><i class="material-icons">replay</i></button>
    <button data-ctl="play" class="i-btn"><i class="material-icons">play_arrow</i></button>
    <button data-ctl="skip" class="i-btn"><i class="material-icons">skip_next</i></button>
    <button data-ctl="volume" class="i-btn"><i class="material-icons">volume_down</i></button>
    </div>
    <span class="tm-flex" style="width:100%;text-align:center;"></span>
    `
    var ICONS = {
        List: `iVBORw0KGgoAAAANSUhEUgAAACIAAAAeCAYAAABJ/8wUAAAACXBIWXMAAAsSAAALEgHS3X78AAAA1klEQVRYhe2XwQ3CMAxFH1EHYBM6AiOEDdiAMglhAzagI3SEsEk3MDKKparlHOfQJ1WqcsmT4+8oBxGhEIGeumRg1B074AhMwKmyhPEBzlqRBNycJIxncDiOf/ShAQllVpHUgMgLTY2IRBHJUp9c9mYZX1da6ZFdZEO3WNAJ6zHi599fSU1ySIyRLDUD8KhciTX3UG5db2JTqZka8Bibalazco3vftes2UXWmEgsjSOVv2wDVZtVf97OBbloRa7OEsoQyvxwJ5Rz8iZrjzTz5LQFv0c48AUTTt3Ala/hCQAAAABJRU5ErkJggg==`,
    }

    function TrayUI() {
        this.tray = null;
        this.header = null;
        this.nav = null;
        this.body = null;
        this.footer = null;
        this.root = document.documentElement;
        this._mode = 'content';
    }

    function createTMOverlay(content = undefined) {
        const overlay = document.createElement('div');
        overlay.classList.add('tm', 'tm-wrapper', 'tm-overlay');
        if (content) {
            overlay.innerHTML = content;
        }
        return overlay;
    }

    TrayUI.prototype.init = function (container, data = {}) {
        if (!container) {
            container = document.body;
        }

        const tmUI = createTMOverlay(UITemplate);
        container.appendChild(tmUI);

        this.tray = document.querySelector('.tm-tray');
        this.context = tmUI;
        if (this.tray) {
            this.header = this.tray.querySelector('header');
            this.nav = this.header.querySelector('nav');
            this.body = this.tray.querySelector('.tm-tray-body');
            this.footer = this.tray.querySelector('footer');
        }
        this.data = data;
        return this;
    }
    // mode = content, panel, compact 
    TrayUI.prototype.setMode = function (mode) {
        const prev_class = `tm-size-${this._mode}`;
        const next_class = `tm-size-${mode}`;
        this.tray.classList.replace(prev_class, next_class);
        switch (mode) {
            case 'compact':
                this.body.style.display = 'none';
                this.header.style.display = 'none';
                this.tray.classList.remove('tm-bg');
                this.tray.querySelector('hr').style.display = 'none';
                break
            case 'panel':
            default:
                this.tray.querySelector('hr').style.display = '';
                this.tray.classList.add('tm-bg');
                this.header.style.display = '';
                this.body.style.display = '';
                break;
        }
        this._mode = mode;
    }

    TrayUI.prototype.title = function (title) {
        this.header.querySelector('span').innerText = title;
    }

    TrayUI.prototype.show = function () {
        this.tray.classList.remove('tm-hide');
    }

    TrayUI.prototype.hide = function () {
        this.tray.classList.add('tm-hide');
    }

    TrayUI.prototype.createPlaylist = function (data) {
        const playlist = new Playlist(this, data);
        return playlist;
    }

    TrayUI.prototype.toggleCompact = function () {
        if (this._mode == 'compact') {
            this.setMode('panel');
        } else {
            this.setMode('compact');
        }
    }

    function Playlist(tray, data = undefined) {
        this.tray = tray;
        this.items = data;
        this.tabEl = null;
        this.listEl = null;
        this.controller = null;

        this._events = {};
        if (this.tray) {
            const tab = document.createElement('ul');
            tab.classList.add(...'tm-tab-tiles tm-justify-around'.split(' '))
            this.tray.nav.appendChild(tab);
            this.tabEl = tab;
            const list = document.createElement('ul');
            list.classList.add('tm-list');
            this.tray.body.appendChild(list);
            this.listEl = list;
        }
        return this;
    }
    Playlist.prototype.refresh = function (tabIndex = 0) {
        if (this.tray) {
            const keys = Object.keys(this.items)
            this.tabEl.innerHTML = '';
            const tab = this.tabEl;
            if (Array.isArray(this.items)) {
                this.listUpdate(this.items);
            } else {
                for (let t in this.items) {
                    const content = this.items[t];
                    const li = document.createElement('li');
                    li.innerHTML = `<button>${content.label}</button>`;
                    tab.appendChild(li);
                }
                console.log(this.items[keys[tabIndex]])
                this.listUpdate(this.items[keys[tabIndex]].items)
            }
        }
    }

    Playlist.prototype.on = function (type, listener) {
        this._events[type] = listener;
    }

    Playlist.prototype.listUpdate = function (items) {
        this.listEl.innerHTML = ``
        const list = this.listEl;
        items.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerText = `${item.label}`;
            
            a.onclick = () => {
                const e = this._events['itemselect'] || null;
                if (e) {
                    e(item);
                }
            };
            li.appendChild(a);
            list.appendChild(li);
        })
    }

    Playlist.prototype.createController = function () {
        const controller = new MediaController(this.tray, this);
        controller.init();

        return controller;
    }

    function MediaController(tray, playlist) {
        this.tray = tray;
        this.playlist = playlist;
        this.titleEl = null;
        this._playEl = null;
        playlist.controller = this;
        if (this.playlist) {
            this.playlist.controller = this;
        }
        this.states = {
            playing: false,
            status: '',
            engine: Howler || null,
            ctx: null,
            snd: null,
            src: null,
            title: null,
            global: false
        };
        this._timerId;
        return this;
    }

    MediaController.prototype.init = function () {
        this.tray.footer.innerHTML = MediaControlTemplate;
        this.titleEl = this.tray.footer.querySelector('span');
    }

    MediaController.prototype.playAudio = function (src, title = undefined) {
        if (Howler) {
            if (!title) title = src;
            if (this.states.src === src && this.states.title === title) {
                console.warn('already playing')
                //this.states.snd.play();
            } else {
                if (this.states.playing) {
                    this.states.snd.stop();
                }
                if (!this.states.snd) {
                    const snd = new Howl({
                        src: src,
                        useWebAudio: true,
                        autoplay: true
                    });

                    const c = this;
                    c.states.src = src;
                    c.states.title = title;
                    c.title(c.states.title);


                    snd.on('play', function (e) {
                        c._playstate(true);
                    });

                    snd.on('ended', function (e) {
                        c._playstate(false);
                    });

                    c.states.snd = snd;
                } else {
                    this.states.snd.load(src);
                }
            }
        }
    }

    MediaController.prototype._playstate = function (state) {
        if (!this._playEl) return;
        if (state) {
            this._playEl.dataset.ctl = 'pause';
            this._playEl.firstChild.innerText = 'pause';
        } else {
            this._playEl.dataset.ctl = 'play';
            this._playEl.firstChild.innerText = 'play_arrow';
        }
    }

    MediaController.prototype.on = function (type, listener) {
        const btns = this.tray.footer.querySelectorAll('button');
        const c = this;
        btns.forEach(btn => {
            if (btn.dataset.ctl === 'play') {
                this._playEl = btn;
            }
            btn.addEventListener(type, function (e) {
                if (btn.dataset.ctl === 'pause' || btn.dataset.ctl === 'play') {
                    if (c.states.playing && (c.states.ctx || c.states.snd)) {
                        c._playstate(false);
                        c.states.playing = false;
                        //if (c.states.global) c.states.ctx.suspend();
                        if (c.states.snd) c.states.snd.pause();
                    } else if (!c.states.playing && (c.states.ctx || c.states.snd)) {
                        //if (c.states.global) c.states.ctx.resume();
                        if (c.states.snd) c.states.snd.resume();
                        c._playstate(true);
                        c.states.playing = true;
                    }
                }
                listener(btn.dataset.ctl);
            }, false);
            btn.firstChild.style.pointerEvents = 'none';
        })
    }

    MediaController.prototype.off = function (type, listener) {
        const btns = this.tray.footer.querySelectorAll('button');
        btns.forEach(btn => {
            btn.removeEventListener(type, listener, false);
        })
    }

    MediaController.prototype.title = function (txt) {
        this.titleEl.innerHTML = txt;
    }

    MediaController.prototype.globalDetect = function (state) {
        if (!Howler) {
            throw new Error('now Howler.js detected');
        }
        this.states.global = state;
        if (state) {

            if (!this._timerId) {
                var c = this;
                var lastState = c.states.status;
                this._timerId = setInterval(function () {
                    c.states.status = Howler.state;
                    c.states.playing = (Howler.state === 'running');

                    if (c.states.engine.ctx && !c.states.ctx) {
                        c.states.ctx = c.states.engine.ctx;

                        c._playstate(c.states.playing);

                        c.states.engine.ctx.onstatechange = function (e) {
                            c.states.status = Howler.state;
                            if (lastState !== c.states.status) {
                                c._playstate(c.states.playing);
                                lastState = c.states.status;
                            }
                            console.log('ctx', e);
                        }
                        clearInterval(c._timerId)
                        this._timerId = null;
                    }

                }, 1000);
            }
        } else {
            if (this._timerId) {
                clearInterval(this._timerId);
                this._timerId = false;
            }
        }
    }

    const gfont = document.createElement('link');
    gfont.rel = 'stylesheet';
    gfont.type = 'text/css';
    gfont.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.getElementsByTagName('head')[0].appendChild(gfont);
    window.TrayUI = new TrayUI();

})();