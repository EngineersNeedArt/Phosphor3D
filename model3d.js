// model3d.js (Grok 3 optimized)

import { Matrix4 } from './matrix4.js';
import { Face } from './face.js';

export class Model3D {
    #position = new Float32Array([0, 0, 0]); // [x, y, z]
    #rotation = new Float32Array([0, 0, 0]); // [xRot, yRot, zRot]
    #scale = 1;
    #stroke = null;
    #fill = null;
    #parent = null;
    #vertices = [];
    #faces = [];
    #subfaces = null;
    #cachedTransformMatrix = null;

    constructor(vertices = [], faces = [], subfaces = null) {
        this.#vertices = vertices;
        this.#faces = faces.map(f => new Face(f.vertices, [], f.stroke, f.fill, f.doublesided));
        this.#subfaces = subfaces;
    }

    get x() { return this.#position[0]; }
    set x(value) { this.#position[0] = value; this.#cachedTransformMatrix = null; }

    get y() { return this.#position[1]; }
    set y(value) { this.#position[1] = value; this.#cachedTransformMatrix = null; }

    get z() { return this.#position[2]; }
    set z(value) { this.#position[2] = value; this.#cachedTransformMatrix = null; }

    get scale() { return this.#scale; }
    set scale(value) { this.#scale = value; this.#cachedTransformMatrix = null; }

    get xRot() { return this.#rotation[0]; }
    set xRot(value) { this.#rotation[0] = this.#wrapAngle(value); this.#cachedTransformMatrix = null; }

    get yRot() { return this.#rotation[1]; }
    set yRot(value) { this.#rotation[1] = this.#wrapAngle(value); this.#cachedTransformMatrix = null; }

    get zRot() { return this.#rotation[2]; }
    set zRot(value) { this.#rotation[2] = this.#wrapAngle(value); this.#cachedTransformMatrix = null; }

    get stroke() { return this.#stroke; }
    set stroke(value) { this.#stroke = value; }

    get fill() { return this.#fill; }
    set fill(value) { this.#fill = value; }

    get parent() { return this.#parent; }
    set parent(value) { this.#parent = value; this.#cachedTransformMatrix = null; }

    get vertices() { return this.#vertices; }
    set vertices(value) { this.#vertices = value; this.#cachedTransformMatrix = null; }

    get faces() { return this.#faces; }
    set faces(value) { this.#faces = value; }

    get subfaces() { return this.#subfaces; }
    set subfaces(value) { this.#subfaces = value; }

    initFromJSONData(jsonData) {
        this.#vertices = jsonData.vertices?.slice() || [];
        this.#faces = (jsonData.faces || []).map(f => new Face(f.vertices, [], f.stroke, f.fill, f.doublesided));
        this.#subfaces = jsonData.subfaces?.slice() || null;
        this.#position[0] = jsonData.x || 0;
        this.#position[1] = jsonData.y || 0;
        this.#position[2] = jsonData.z || 0;
        this.#scale = jsonData.scale || 1;
        this.#rotation[0] = this.#wrapAngle(jsonData.xRot || 0);
        this.#rotation[1] = this.#wrapAngle(jsonData.yRot || 0);
        this.#rotation[2] = this.#wrapAngle(jsonData.zRot || 0);
        this.#fill = jsonData.fill || null;
        this.#stroke = jsonData.stroke || null;
        this.#cachedTransformMatrix = null;
    }

    #wrapAngle(angle) {
        if (typeof angle !== 'number' || !Number.isFinite(angle)) return 0;
        angle %= Math.PI * 2;
        return angle < 0 ? angle + Math.PI * 2 : angle;
    }

    localMatrix() {
        const m = new Matrix4()
            .scale(this.#scale, this.#scale, this.#scale)
            .rotateX(this.#rotation[0])
            .rotateY(this.#rotation[1])
            .rotateZ(this.#rotation[2])
            .translate(this.#position[0], this.#position[1], this.#position[2]);
        if (this.#parent) {
            m.multiplyMatrix(this.#parent.localMatrix());
        }
        return m;
    }
    
    // localMatrix() {
    //     const m = new Matrix4()
    //         .scale(this.#scale, this.#scale, this.#scale)
    //         .rotateX(this.#rotation[0])
    //         .rotateY(this.#rotation[1])
    //         .rotateZ(this.#rotation[2])
    //         .translate(this.#position[0], this.#position[1], this.#position[2]);
    //     if (this.#parent) m.multiplyMatrix(this.#parent.localMatrix());
    //     return m;
    // }

    transformedFaces(camera) {
        if (!this.#vertices.length || !this.#faces.length) return [];
        // Always recompute to ensure parent changes propagate
        const transformMatrix = this.localMatrix().multiplyMatrix(camera.transform());
        const transformedVertices = transformMatrix.multiplyPoints(this.#vertices);
        const faces = this.#faces.map(face => {
            const newFace = new Face(
                face.vertices.map(i => transformedVertices[i]),
                [],
                this.#stroke || face.stroke,
                this.#fill || face.fill,
                face.doublesided
            );
            newFace.computeDepth();
            return newFace;
        });
        // ... subfaces handling ...
        return faces;
    }
    
//     transformedFaces(camera) {
//         if (!this.#vertices.length || !this.#faces.length) return [];
// 
//         if (!this.#cachedTransformMatrix) {
//             this.#cachedTransformMatrix = this.localMatrix().multiplyMatrix(camera.transform());
//         }
// 
//         const transformedVertices = this.#cachedTransformMatrix.multiplyPoints(this.#vertices);
//         const faces = this.#faces.map(face => {
//             const newFace = new Face(
//                 face.vertices.map(i => transformedVertices[i]),
//                 [],
//                 this.#stroke || face.stroke,
//                 this.#fill || face.fill,
//                 face.doublesided
//             );
//             newFace.computeDepth();
//             return newFace;
//         });
// 
//         if (this.#subfaces) {
//             this.#subfaces.forEach((subface, i) => {
//                 const newSubface = new Face(
//                     subface.vertices.map(i => transformedVertices[i]),
//                     [],
//                     this.#stroke || subface.stroke,
//                     this.#fill || subface.fill,
//                     subface.doublesided
//                 );
//                 const parent = faces[subface.parent];
//                 if (parent) {
//                     newSubface.depth = parent.depth;
//                     parent.subfaces.push(newSubface);
//                 }
//             });
//         }
// 
//         return faces;
//     }
}