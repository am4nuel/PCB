export class RenderLoop {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.frameId = null;
        this.callbacks = new Set();
    }

    start() {
        if (this.frameId) return;

        const loop = () => {
            this.update();
            this.render();
            this.frameId = requestAnimationFrame(loop);
        };

        this.frameId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    addCallback(callback) {
        this.callbacks.add(callback);
    }

    removeCallback(callback) {
        this.callbacks.delete(callback);
    }

    update() {
        this.sceneManager.controls.update();
        this.callbacks.forEach(cb => cb());
    }

    render() {
        this.sceneManager.renderer.render(
            this.sceneManager.scene,
            this.sceneManager.camera
        );
    }
}
