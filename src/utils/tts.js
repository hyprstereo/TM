/**
 * Text-To-Speech JS Utility
 * author: Gabriel Lim (hello@gabriellim.com)
 */


 export class TTS  {
  constructor(config = {}) {

    this.speech = new SpeechSynthesisUtterance();
    this.lang = config.lang || 'en-US';
    this.populateVoices()
    this.pitch = config.pitch || 1.2;
    this.voice = config.voice || 0;
    this.volume = 0.5;
    this.speech.onstart = (e) => this.emit('onstart', e);
    this.speech.onend = (e) => this.emit('onstart', e);
    this.speech.onmark = (e) => this.emit('onmark', e);

    const self = this;
    window.speechSynthesis.onvoiceschanged = () => {
      //self.populateVoices()
     // self.emit('onvoiceschanged', self.voices);
    };

    return this;
  }

  populateVoices() {

    this._voices = window.speechSynthesis.getVoices();
    const self = this;
  }

  get voices() {
    return this._voices;
  }


  set lang(lang) {
    this.speech.lang = lang;
  }

  get lang() {
    return this.speech.lang;
  }

  set voice(id) {
    this.speech.voice = this.voices[id] || this.voices[0];
  }

  get voice() {
    return this.speech.voice;
  }

  set pitch(p) {
    this.speech.pitch = p;
  }

  get pitch() {
    return this.speech.pitch;
  }

  set volume(v) {
    this.speech.volume = v;
  }

  get volume() {
    return this.speech.volume;
  }

  speak(text) {
    this.speech.text = text;
    this.synthesizer.speak(this.speech);
  }

  cancel() {
    this.synthesizer.cancel();
  }

  pause() {
    this.synthesizer.pause();
  }

  resume() {
    this.synthesizer.resume();
  }
  get synthesizer() {
    return window.speechSynthesis;
  }
}
