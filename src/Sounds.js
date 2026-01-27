export class Sounds {
  constructor() {
    this._queue = [];
    this._audioCache = new Map();
    this._loadingPromises = new Map();
  }

  async loadSound(name, path) {
    if (this._audioCache.has(name)) {
      return this._audioCache.get(name);
    }

    if (this._loadingPromises.has(name)) {
      return this._loadingPromises.get(name);
    }

    const loadPromise = (async () => {
      try {
        const audio = new Audio(path);
        audio.preload = "auto";
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout loading sound: ${name}`));
          }, 10000);

          const checkReady = () => {
            if (audio.readyState >= 3) {
              clearTimeout(timeout);
              resolve();
            }
          };

          audio.addEventListener("canplaythrough", checkReady, { once: true });
          audio.addEventListener("error", (error) => {
            clearTimeout(timeout);
            reject(error);
          }, { once: true });
          
          audio.load();

          if (audio.readyState >= 3) {
            clearTimeout(timeout);
            resolve();
          }
        });

        if (audio.readyState < 3) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Sound not ready after canplaythrough: ${name}`));
            }, 5000);

            audio.addEventListener("canplaythrough", () => {
              clearTimeout(timeout);
              resolve();
            }, { once: true });
          });
        }

        this._audioCache.set(name, audio);
        this._loadingPromises.delete(name);
        return audio;
      } catch (error) {
        this._loadingPromises.delete(name);
        console.warn(`Could not load sound ${name}:`, error);
        return null;
      }
    })();

    this._loadingPromises.set(name, loadPromise);
    return loadPromise;
  }

  isSoundReady(name) {
    const audio = this._audioCache.get(name);
    return audio && audio.readyState >= 3;
  }

  async waitForAllSounds() {
    const allPromises = Array.from(this._loadingPromises.values());
    if (allPromises.length > 0) {
      await Promise.all(allPromises);
    }

    const soundNames = Array.from(this._audioCache.keys());
    const readyPromises = soundNames.map((name) => {
      const audio = this._audioCache.get(name);
      if (!audio) {
        return Promise.resolve();
      }
      if (audio.readyState >= 3) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        if (audio.readyState >= 3) {
          resolve();
          return;
        }
        audio.addEventListener("canplaythrough", resolve, { once: true });
      });
    });

    await Promise.all(readyPromises);
  }

  enqueue(soundName) {
    if (this.isSoundReady(soundName)) {
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
