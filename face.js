// face.js (Grok 3 optimized)

export class Face {
    #vertices = [];
    #subfaces = [];
    #stroke = null;
    #fill = null;
    #doublesided = false;
    #depth = 0;
    #backface = false;

    constructor(vertices = [], subfaces = [], stroke = null, fill = null, doublesided = false) {
        this.#vertices = vertices;
        this.#subfaces = subfaces;
        this.#stroke = stroke;
        this.#fill = fill;
        this.#doublesided = doublesided;
    }

    get vertices() { return this.#vertices; }
    set vertices(value) { this.#vertices = value; }

    get subfaces() { return this.#subfaces; }
    set subfaces(value) { this.#subfaces = value; }

    get stroke() { return this.#stroke; }
    set stroke(value) { this.#stroke = value; }

    get fill() { return this.#fill; }
    set fill(value) { this.#fill = value; }

    get doublesided() { return this.#doublesided; }
    set doublesided(value) { this.#doublesided = value; }

    get depth() { return this.#depth; }
    set depth(value) { this.#depth = value; }

    get backface() { return this.#backface; }
    set backface(value) { this.#backface = value; }

    computeDepth() {
        const verts = this.#vertices;
        if (verts.length === 0) {
            this.#depth = 0;
            return;
        }
        let minDepth = verts[0][2];
        let maxDepth = minDepth;
        for (let i = 1; i < verts.length; i++) {
            const z = verts[i][2];
            minDepth = Math.min(minDepth, z);
            maxDepth = Math.max(maxDepth, z);
        }
        this.#depth = (minDepth + maxDepth) * 0.5;
    }

    computeIsBackface() {
        if (this.#doublesided || this.#vertices.length < 3) {
            this.#backface = false;
            return;
        }
        const [v1, v2, v3] = this.#vertices;
        const e1x = v2[0] - v1[0];
        const e1y = v2[1] - v1[1];
        const e2x = v3[0] - v2[0];
        const e2y = v3[1] - v2[1];
        this.#backface = (e1x * e2y - e1y * e2x) > 0; // Right-handed
    }
}