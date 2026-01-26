export class Sounds {
  constructor() {
    this._queue = [];
    this._audioCache = new Map();
  }

  async loadSound(name, path) {
    if (this._audioCache.has(name)) {
      return this._audioCache.get(name);
    }

    try {
      const audio = new Audio(path);
      audio.preload = "auto";
      await new Promise((resolve, reject) => {
        audio.addEventListener("canplaythrough", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
        audio.load();
      });
      this._audioCache.set(name, audio);
      return audio;
    } catch (error) {
      console.warn(`Could not load sound ${name}:`, error);
      return null;
    }
  }

  enqueue(soundName) {
    if (this._audioCache.has(soundName)) {
      this._queue.push(soundName);
    }
  }

  playQueue() {
    while (this._queue.length > 0) {
      const soundName = this._queue.shift();
      const audio = this._audioCache.get(soundName);
      if (audio) {
        const audioClone = audio.cloneNode();
        audioClone.play().catch((error) => {
          console.warn(`Could not play sound ${soundName}:`, error);
        });
      }
    }
  }

  clearQueue() {
    this._queue = [];
  }
}
