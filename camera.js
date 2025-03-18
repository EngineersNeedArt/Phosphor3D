// camera.js (Grok 3 optimized)

import { Matrix4 } from './matrix4.js';

export class Camera {
    #position = new Float32Array([0, 0, 0]); // [x, y, z]
    #rotation = new Float32Array([0, 0, 0]); // [xRot, yRot, zRot]
    #viewPort = new Float32Array([1600, 900]); // [width, height]
    #projectionParams = new Float32Array([0.8, 1, 100]); // [fov, near, far]
    #velocity = 0;
    #perspectiveMatrix = new Matrix4();
    #viewMatrix = new Matrix4();

    constructor(viewPortWidth = 1600, viewPortHeight = 900, fov = 0.8, near = 1, far = 100) {
        this.#viewPort[0] = viewPortWidth;
        this.#viewPort[1] = viewPortHeight;
        this.#projectionParams[0] = fov;
        this.#projectionParams[1] = near;
        this.#projectionParams[2] = far;
        this.#updatePerspectiveMatrix();
    }

    get x() { return this.#position[0]; }
    set x(value) { this.#position[0] = value; this.#viewMatrixDirty = true; }

    get y() { return this.#position[1]; }
    set y(value) { this.#position[1] = value; this.#viewMatrixDirty = true; }

    get z() { return this.#position[2]; }
    set z(value) { this.#position[2] = value; this.#viewMatrixDirty = true; }

    get xRot() { return this.#rotation[0]; }
    set xRot(value) { this.#rotation[0] = value; this.#viewMatrixDirty = true; }

    get yRot() { return this.#rotation[1]; }
    set yRot(value) { this.#rotation[1] = value; this.#viewMatrixDirty = true; }

    get zRot() { return this.#rotation[2]; }
    set zRot(value) { this.#rotation[2] = value; this.#viewMatrixDirty = true; }

    get viewPortWidth() { return this.#viewPort[0]; }
    set viewPortWidth(value) {
        if (value <= 0) throw new Error('Viewport width must be greater than 0.');
        this.#viewPort[0] = value;
        this.#updatePerspectiveMatrix();
    }

    get viewPortHeight() { return this.#viewPort[1]; }
    set viewPortHeight(value) {
        if (value <= 0) throw new Error('Viewport height must be greater than 0.');
        this.#viewPort[1] = value;
        this.#updatePerspectiveMatrix();
    }

    get fov() { return this.#projectionParams[0]; }
    set fov(value) { this.#projectionParams[0] = value; this.#updatePerspectiveMatrix(); }

    get near() { return this.#projectionParams[1]; }
    set near(value) { this.#projectionParams[1] = value; this.#updatePerspectiveMatrix(); }

    get far() { return this.#projectionParams[2]; }
    set far(value) { this.#projectionParams[2] = value; this.#updatePerspectiveMatrix(); }

    get velocity() { return this.#velocity; }
    set velocity(value) { this.#velocity = value; }

    #updatePerspectiveMatrix() {
        this.#perspectiveMatrix.setPerspective(
            this.#projectionParams[0],
            this.#viewPort[0] / this.#viewPort[1],
            this.#projectionParams[1],
            this.#projectionParams[2]
        );
    }

    #viewMatrixDirty = true;
    transform() {
        const m = new Matrix4();
        m.translate(this.#position[0], this.#position[1], this.#position[2]);
        m.rotateX(this.#rotation[0]);
        m.rotateY(this.#rotation[1]);
        m.rotateZ(this.#rotation[2]);
        return m;
    }
    
    // transform() {
    //     if (this.#viewMatrixDirty) {
    //         this.#viewMatrix.setIdentity()
    //             .rotateZ(-this.#rotation[2])
    //             .rotateY(-this.#rotation[1])
    //             .rotateX(-this.#rotation[0])
    //             .translate(-this.#position[0], -this.#position[1], -this.#position[2]);
    //         this.#viewMatrixDirty = false;
    //     }
    //     return this.#viewMatrix;
    // }

    projectPoints(points) {
        const widthHalf = this.#viewPort[0] * 0.5;
        const heightHalf = this.#viewPort[1] * 0.5;
        const projected = this.#perspectiveMatrix.multiplyPoints(points);
        for (let i = 0; i < projected.length; i++) {
            const p = projected[i];
            p[0] = (p[0] + 1) * widthHalf;
            p[1] = (1 - p[1]) * heightHalf;
        }
        return projected;
    }
}