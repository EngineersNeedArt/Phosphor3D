// model3d3.js -- further improvements from Deep Seek.

import { Matrix4 } from './matrix4.js';
import { Face } from './face.js';

export class Model3D {
    // Private fields
    #x = 0;
    #y = 0;
    #z = 0;
    #scale = 1;
    #xRot = 0;
    #yRot = 0;
    #zRot = 0;
    #stroke = null;
    #fill = null;
    #parent = null;
    #vertices = [];
    #faces = [];
    #subfaces = null;
    #cachedTransformMatrix = null;

    /**
     * Creates a new Model3D instance.
     * @param {Array<Array<number>>} vertices - The vertices of the model.
     * @param {Array<Face>} faces - The faces of the model.
     * @param {Array<Face>} subfaces - The subfaces of the model.
     */
    constructor(vertices = [], faces = [], subfaces = null) {
        this.#vertices = vertices;
        this.#faces = faces;
        this.#subfaces = subfaces;
    }

    // Getters and setters for private fields
    get x() {
        return this.#x;
    }

    set x(value) {
        this.#x = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get y() {
        return this.#y;
    }

    set y(value) {
        this.#y = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get z() {
        return this.#z;
    }

    set z(value) {
        this.#z = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get scale() {
        return this.#scale;
    }

    set scale(value) {
        this.#scale = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get xRot() {
        return this.#xRot;
    }

    set xRot(value) {
        this.#xRot = this.#wrapAngle(value);
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get yRot() {
        return this.#yRot;
    }

    set yRot(value) {
        this.#yRot = this.#wrapAngle(value);
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get zRot() {
        return this.#zRot;
    }

    set zRot(value) {
        this.#zRot = this.#wrapAngle(value);
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get stroke() {
        return this.#stroke;
    }

    set stroke(value) {
        this.#stroke = value;
    }

    get fill() {
        return this.#fill;
    }

    set fill(value) {
        this.#fill = value;
    }

    get parent() {
        return this.#parent;
    }

    set parent(value) {
        this.#parent = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get vertices() {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    get faces() {
        return this.#faces;
    }

    set faces(value) {
        this.#faces = value;
    }

    get subfaces() {
        return this.#subfaces;
    }

    set subfaces(value) {
        this.#subfaces = value;
    }

    /**
     * Initializes the model from JSON data.
     * @param {Object} jsonData - The JSON data containing model properties.
     */
    initFromJSONData(jsonData) {
        if (!jsonData) {
            throw new Error('JSON data is required.');
        }

        this.#vertices = jsonData.vertices ? jsonData.vertices.slice() : [];
        this.#faces = jsonData.faces ? jsonData.faces.slice() : [];
        this.#subfaces = jsonData.subfaces ? jsonData.subfaces.slice() : null;

        this.#x = jsonData.x || 0;
        this.#y = jsonData.y || 0;
        this.#z = jsonData.z || 0;
        this.#scale = jsonData.scale || 1;
        this.#xRot = this.#wrapAngle(jsonData.xRot || 0);
        this.#yRot = this.#wrapAngle(jsonData.yRot || 0);
        this.#zRot = this.#wrapAngle(jsonData.zRot || 0);
        this.#fill = jsonData.fill || null;
        this.#stroke = jsonData.stroke || null;

        this.#cachedTransformMatrix = null; // Invalidate cache
    }

    /**
     * Wraps an angle to the range [0, 2π].
     * @param {number} angle - The angle to wrap.
     * @returns {number} The wrapped angle.
     */
    #wrapAngle(angle) {
        if (typeof angle !== 'number' || isNaN(angle) || !isFinite(angle)) {
            console.warn(`Invalid angle: ${angle}. Defaulting to 0.`);
            return 0;
        }

        if ((angle < 0) || (angle > 2 * Math.PI)) {
            angle = angle % (2 * Math.PI);
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
        }

        return angle;
    }

    /**
     * Computes the local transformation matrix for the model.
     * @returns {Matrix4} The local transformation matrix.
     */
    localMatrix() {
        const m = new Matrix4();
        m.scale(this.#scale, this.#scale, this.#scale);
        m.rotateX(this.#xRot);
        m.rotateY(this.#yRot);
        m.rotateZ(this.#zRot);
        m.translate(this.#x, this.#y, this.#z);

        if (this.#parent) {
            const parentMatrix = this.#parent.localMatrix();
            if (parentMatrix instanceof Matrix4) {
                m.multiplyMatrix(parentMatrix);
            } else {
                console.warn('Parent matrix is not a valid Matrix4 object.');
            }
        }

        return m;
    }

    /**
     * Transforms the model's faces using the camera's transformation.
     * @param {Camera} camera - The camera used for transformation.
     * @returns {Array<Face>} The transformed faces.
     */
    transformedFaces(camera) {
        if (!camera || typeof camera.transform !== 'function') {
            throw new Error('Invalid camera object.');
        }

        if (!this.#vertices.length || !this.#faces.length) {
            console.warn('No vertices or faces to transform.');
            return [];
        }

        // Recompute the transformation matrix only if necessary.
        if (!this.#cachedTransformMatrix) {
            const m = this.localMatrix();
            m.multiplyMatrix(camera.transform());
            this.#cachedTransformMatrix = m;
        }

        const transformedVertices = this.#cachedTransformMatrix.multiplyPoints(this.#vertices);

        // Create polygons with transformed vertices.
        const transformedFaces = [];
        for (let f = 0; f < this.#faces.length; f++) {
            const newFace = new Face();
            const oneFace = this.#faces[f];
            const vertices = oneFace.vertices;
            const length = vertices.length;

            for (let v = 0; v < length; v++) {
                newFace.vertices.push(transformedVertices[vertices[v]]);
            }

            newFace.fill = this.#fill;
            newFace.stroke = this.#stroke;

            if (oneFace.doublesided) {
                newFace.doublesided = oneFace.doublesided;
            }

            newFace.computeDepth();
            transformedFaces.push(newFace);
        }

        // Handle subfaces if they exist.
        if (this.#subfaces) {
            for (let s = 0; s < this.#subfaces.length; s++) {
                const newFace = new Face();
                const oneSubface = this.#subfaces[s];
                const vertices = oneSubface.vertices;
                const length = vertices.length;

                for (let v = 0; v < length; v++) {
                    newFace.vertices.push(transformedVertices[vertices[v]]);
                }

                newFace.fill = this.#fill;
                newFace.stroke = this.#stroke;

                const parentIndex = oneSubface.parent;
                const parent = transformedFaces[parentIndex];

                if (parent) {
                    newFace.depth = parent.depth;
                    parent.subfaces.push(newFace);
                } else {
                    console.warn(`Parent face at index ${parentIndex} not found.`);
                }
            }
        }

        return transformedFaces;
    }
}