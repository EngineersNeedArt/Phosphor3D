// model3d.js -- fixed up by Deep Seek.

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

    get scale() {
        return this.#scale;
    }

    set scale(value) {
        this.#scale = value;
    }

    get xRot() {
        return this.#xRot;
    }

    set xRot(value) {
        this.#xRot = this.#wrapAngle(value);
    }

    get yRot() {
        return this.#yRot;
    }

    set yRot(value) {
        this.#yRot = this.#wrapAngle(value);
    }

    get zRot() {
        return this.#zRot;
    }

    set zRot(value) {
        this.#zRot = this.#wrapAngle(value);
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
    }

    get vertices() {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
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
        if (jsonData.vertices) {
            this.#vertices = jsonData.vertices.slice();
        }
        if (jsonData.faces) {
            this.#faces = jsonData.faces.slice();
        }
        if (jsonData.subfaces) {
            this.#subfaces = jsonData.subfaces.slice();
        }

        this.#x = jsonData.x || 0;
        this.#y = jsonData.y || 0;
        this.#z = jsonData.z || 0;
        this.#scale = jsonData.scale || 1;
        this.#xRot = this.#wrapAngle(jsonData.xRot || 0);
        this.#yRot = this.#wrapAngle(jsonData.yRot || 0);
        this.#zRot = this.#wrapAngle(jsonData.zRot || 0);
        this.#fill = jsonData.fill || null;
        this.#stroke = jsonData.stroke || null;
    }

    /**
     * Wraps an angle to the range [0, 2π].
     * @param {number} angle - The angle to wrap.
     * @returns {number} The wrapped angle.
     */
    #wrapAngle(angle) {
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
            m.multiplyMatrix(this.#parent.localMatrix());
        }

        return m;
    }

    /**
     * Transforms the model's faces using the camera's transformation.
     * @param {Camera} camera - The camera used for transformation.
     * @returns {Array<Face>} The transformed faces.
     */
    transformedFaces(camera) {
        // Transform vertices.
        const m = this.localMatrix();
        m.multiplyMatrix(camera.transform());
        const transformedVertices = m.multiplyPoints(this.#vertices);

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
                newFace.depth = parent.depth;
                parent.subfaces.push(newFace);
            }
        }

        return transformedFaces;
    }
}