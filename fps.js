// fps.js (Grok 3 optimized)

export class FPS {
    #ticks = 0;
    #fps = 60;
    #startTime = 0;
    #nextSecond = performance.now() + 1000;
    #frameCount = 0;

    startFrame() {
        this.#startTime = performance.now();
        return this.#startTime;
    }

    endFrame() {
        const endTime = performance.now();
        this.#frameCount++;
        if (endTime > this.#nextSecond) {
            this.#nextSecond += 1000;
            this.#fps = this.#frameCount;
            this.#frameCount = 0;
        }
        this.#ticks++;
        return endTime - this.#startTime;
    }

    fps() {
        return this.#fps;
    }
}