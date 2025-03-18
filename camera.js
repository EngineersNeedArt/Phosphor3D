// camera2.js	Improvements made by Deep Seek.

import { Matrix4 } from './matrix4.js';

export class Camera {
    // Private fields
    #viewPortWidth = 1600;
    #viewPortHeight = 900;
    #x = 0;
    #y = 0;
    #z = 0;
    #xRot = 0;
    #yRot = 0;
    #zRot = 0;
    #velocity = 0;
    #fov = 0.8;
    #near = 1;
    #far = 100;
    #perspectiveMatrix = null; // Cached perspective matrix

    /**
     * Creates a new Camera instance.
     * @param {number} viewPortWidth - The width of the viewport.
     * @param {number} viewPortHeight - The height of the viewport.
     * @param {number} fov - The field of view in radians.
     * @param {number} near - The near clipping plane.
     * @param {number} far - The far clipping plane.
     */
    constructor(viewPortWidth = 1600, viewPortHeight = 900, fov = 0.8, near = 1, far = 100) {
        this.#viewPortWidth = viewPortWidth;
        this.#viewPortHeight = viewPortHeight;
        this.#fov = fov;
        this.#near = near;
        this.#far = far;
        this.#updatePerspectiveMatrix();
    }

    // Getters and setters for private fields
    get viewPortWidth() {
        return this.#viewPortWidth;
    }

    set viewPortWidth(value) {
        if (value <= 0) throw new Error('Viewport width must be greater than 0.');
        this.#viewPortWidth = value;
        this.#updatePerspectiveMatrix();
    }

    get viewPortHeight() {
        return this.#viewPortHeight;
    }

    set viewPortHeight(value) {
        if (value <= 0) throw new Error('Viewport height must be greater than 0.');
        this.#viewPortHeight = value;
        this.#updatePerspectiveMatrix();
    }

    get fov() {
        return this.#fov;
    }

    set fov(value) {
        this.#fov = value;
        this.#updatePerspectiveMatrix();
    }

    get near() {
        return this.#near;
    }

    set near(value) {
        this.#near = value;
        this.#updatePerspectiveMatrix();
    }

    get far() {
        return this.#far;
    }

    set far(value) {
        this.#far = value;
        this.#updatePerspectiveMatrix();
    }

    get x() {
        return this.#x;
    }

    set x(value) {
        this.#x = value;
    }

    get y() {
        return this.#y;
    }

    set y(value) {
        this.#y = value;
    }

    get z() {
        return this.#z;
    }

    set z(value) {
        this.#z = value;
    }

    get xRot() {
        return this.#xRot;
    }

    set xRot(value) {
        this.#xRot = value;
    }

    get yRot() {
        return this.#yRot;
    }

    set yRot(value) {
        this.#yRot = value;
    }

    get zRot() {
        return this.#zRot;
    }

    set zRot(value) {
        this.#zRot = value;
    }

    get velocity() {
        return this.#velocity;
    }

    set velocity(value) {
        this.#velocity = value;
    }

    /**
     * Updates the cached perspective matrix.
     */
    #updatePerspectiveMatrix() {
        const m = new Matrix4();
        m.setPerspective(this.#fov, this.#viewPortWidth / this.#viewPortHeight, this.#near, this.#far);
        this.#perspectiveMatrix = m;
    }

    /**
     * Computes the transformation matrix for the camera.
     * @returns {Matrix4} The transformation matrix.
     */
    transform() {
        const m = new Matrix4();
        m.translate(this.#x, this.#y, this.#z);
        m.rotateX(this.#xRot);
        m.rotateY(this.#yRot);
        m.rotateZ(this.#zRot);
        return m;
    }

    /**
     * Projects 3D points onto the 2D viewport.
     * @param {Array<Array<number>>} points - An array of 3D points (each point is [x, y, z]).
     * @returns {Array<Array<number>>} An array of 2D points (each point is [screenX, screenY, z]).
     */
    projectPoints(points) {
        if (!this.#perspectiveMatrix) {
            throw new Error('Perspective matrix is not initialized.');
        }

        const width = this.#viewPortWidth;
        const height = this.#viewPortHeight;
        const multipliedPoints = this.#perspectiveMatrix.multiplyPoints(points);

        return multipliedPoints.map(([x, y, z]) => {
            const screenX = ((x + 1) / 2) * width;
            const screenY = ((1 - y) / 2) * height;
            return [screenX, screenY, z];
        });
    }
}