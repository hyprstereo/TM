export default class Emitter {
  constructor() {
    this.$listeners = {};
  }

  on(type, listener) {
    if (!this.$listeners[type]) {
      this.$listeners[type] = {};
    }
    this.$listeners[type][listener.name] = listener;
  }

  off(type, listener) {
    if (this.$listeners[type][listener.name]) {
      delete this.$listeners[type][listener.name];
    }
  }

  emit(type, ...args) {
    if (this.$listeners[type]) {
      for (let k in this.$listeners[type]) {
        const fn = this.$listeners[type][k];
        fn.apply(null, [...args]);
      }
    }
  }
}
