
export const setupAudio = (tomi, mod = 128, mx = 5) => {
    const self = tomi;
    if (!self.autoAnimate) self.autoAnimate = true;
    const setupAnalyzer = (source = undefined) => {
        let analyser, audioCtx;
        if (source instanceof HTMLVideoElement) {
            const ctx = new webkitAudioContext();
            const n = ctx.createMediaElementSource(source);
            analyser = ctx.createAnalyser();
            n.connect(analyser);
            analyser.connect(ctx.destination);
            audioCtx = ctx.destination.context;
        } else {
            analyser = Howler.ctx.createAnalyser();
            Howler.masterGain.connect(analyser);
            analyser.connect(Howler.ctx.destination);
            audioCtx = Howler.ctx.destination.context;
        }


        // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Get the Data array
        analyser.getByteTimeDomainData(dataArray);

        self.analyser = analyser;
        self.dataArray = dataArray;
        self.audioCtx = audioCtx;
    }
    let silenceCount = 0;
    const startAnalyze = () => {
        if (self.autoAnimate) {
            self.selfAware(true);
        }
        const tm = setInterval(_ => {
            
            self.analyser.getByteTimeDomainData(self.dataArray);
            const id = self.dataArray[512] % mod;
            const mouthIndex = Math.round(id / mod * mx)
            self.face.setLip(mouthIndex);
            if (id < 1) {
                silenceCount++;
            } else {
                silenceCount = 0;
            }
            if (silenceCount > 50) {
                stopAnalyze();
            }
            //console.log(self.audioCtx.context.state,self.audioCtx.context);
        }, 100);
        self.__tm = tm;
        return { tm };
    }

    const stopAnalyze = () => {
        if (self.autoAnimate) {
            self.selfAware(false);
        }
        if (self.__tm) {
            
            clearInterval(self.__tm);
            self.__tm = null;
        }
    }

    const addSound = (...src) => {
        self._sounds.push(...src);
        self._sound = new Howl({
            src: self._sounds,
            html5: true,
            autoUnlock: true
        });

        self._sound.on('play', (e) => {
            if (self._syncClip > -1) {
                self.play(self._syncClip);
            }
        })
    }

    const playSound = async (src, autoSpeak = true) => {
        return await new Promise((res, rej) => {
          if (self._sounds[src]) {
            self._sound = self._sounds[src];
            if (self._sound.playing) {
                self._sound.stop()
            }
            res(self._sound);
            return
          }

          self.face.useAudio = autoSpeak;
          self._sound = new Howl({
            src: src,
            autoplay: false,
            userWebAudio: true,
            onplay: () => {
              self.face.talking = (self.face.useAudio);
              if (!self.analyser) self.setupAnalyzer()
              if (self.face.useAudio) self.startAnalyze();

            },
            onstop: () => {
              if (self.__tm) {
                clearInterval(self.__tm);
                self.__tm = null;
              }
              self.face.talking = false;
              //self.dispatchEvent({ type: 'audiostop' });
            },
            onended: () => {
              if (self.__tm) {
                clearInterval(self.__tm);
                self.__tm = null;
                self.face.talking = false;
              }
            }
          });
    
          self._sound.once('load', () => {
            res(self._sound);
          })
          self._sounds[src] = self._sound;
    
        });
      }
    
      const soundPosition = (tm = 0) => {
        if (self._sound) {
            self._sound.pause();
            self._sound.pos = tm;
            self._sound.play();
        }
      }
    
      const disableAutoSpeak = ()=> {
        if (self.__tm) {
          clearInterval(self.__tm);
          self.__tm = null;
        }
      }
    
      const soundDuration = () => {
        if (self._sound && self._sound.playing) {
          const seek = self._sound.seek() || 0;
          const timeDisplay = formatTime(Math.round(seek));
          const duration = self._sound.duration();
          return { timeDisplay, seek, duration }
        }
        return null;
      }
    
      const stopSound = () => {
        if (self._sound && self._sound.playing) {
            self._sound.stop();
        }
      }

    if (self) {
        self.setupAnalyzer = setupAnalyzer;
        self.startAnalyze = startAnalyze;
        self.stopAnalyze = stopAnalyze;
        self.addSound = addSound;
        self.playSound = playSound;
        self.soundPosition = soundPosition;
        self.disableAutoSpeak = disableAutoSpeak;
        self.soundDuration = soundDuration;
        self.stopSound = stopSound;
    }
}