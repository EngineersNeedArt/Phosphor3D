// face.js

export class Face {
    // Private fields
    #vertices = [];
    #subfaces = [];
    #stroke = null;
    #fill = null;
    #doublesided = false;
    #depth = 0;
    #backface = false;

    /**
     * Creates a new Face instance.
     * @param {Array<Array<number>>} vertices - The vertices of the face.
     * @param {Array<Face>} subfaces - The subfaces of the face.
     * @param {string} stroke - The stroke color of the face.
     * @param {string} fill - The fill color of the face.
     * @param {boolean} doublesided - Whether the face is double-sided.
     */
    constructor(vertices = [], subfaces = [], stroke = null, fill = null, doublesided = false) {
        this.#vertices = vertices;
        this.#subfaces = subfaces;
        this.#stroke = stroke;
        this.#fill = fill;
        this.#doublesided = doublesided;
        this.#depth = 0;
        this.#backface = false;
    }

    // Getters and setters for private fields
    get vertices() {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
    }

    get subfaces() {
        return this.#subfaces;
    }

    set subfaces(value) {
        this.#subfaces = value;
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

    get doublesided() {
        return this.#doublesided;
    }

    set doublesided(value) {
        this.#doublesided = value;
    }

    get depth() {
        return this.#depth;
    }

    set depth(value) {
        this.#depth = value;
    }

    get backface() {
        return this.#backface;
    }

    set backface(value) {
        this.#backface = value;
    }

    /**
     * Computes the depth of the face based on its vertices.
     */
    computeDepth() {
        if (this.#vertices.length === 0) {
            this.#depth = 0;
            return;
        }

        let minDepth = this.#vertices[0][2];
        let maxDepth = this.#vertices[0][2];

        for (let i = 1; i < this.#vertices.length; i++) {
            const z = this.#vertices[i][2];
            if (z < minDepth) {
                minDepth = z;
            }
            if (z > maxDepth) {
                maxDepth = z;
            }
        }

        this.#depth = (minDepth + maxDepth) / 2.0;
    }

    /**
     * Computes whether the face is a backface based on its vertices.
     */
    computeIsBackface() {
        if (this.#doublesided || this.#vertices.length < 3) {
            this.#backface = false;
            return;
        }

        // Assume right-handed coordinate system
        const [v1, v2, v3] = this.#vertices;
        const e1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        const e2 = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];

        // Cross product in 2D (ignoring Z-axis for simplicity)
        const cp = e1[0] * e2[1] - e1[1] * e2[0];

        // Determine backface based on the sign of the cross product
        this.#backface = cp > 0;
    }
}