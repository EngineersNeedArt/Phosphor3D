// matrix4.js (Grok 3 optimized)
export class Matrix4 {
    #elements;

    constructor(elements = null) {
        this.#elements = new Float32Array(elements || [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    setIdentity() {
        const e = this.#elements;
        e[0] = 1; e[1] = 0; e[2] = 0; e[3] = 0;
        e[4] = 0; e[5] = 1; e[6] = 0; e[7] = 0;
        e[8] = 0; e[9] = 0; e[10] = 1; e[11] = 0;
        e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;
        return this;
    }

    setPerspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov * 0.5);
        const rangeInv = 1.0 / (near - far);
        const e = this.#elements;

        e[0] = f / aspect; e[1] = 0; e[2] = 0; e[3] = 0;
        e[4] = 0; e[5] = f; e[6] = 0; e[7] = 0;
        e[8] = 0; e[9] = 0; e[10] = (far + near) * rangeInv; e[11] = -1;
        e[12] = 0; e[13] = 0; e[14] = 2 * near * far * rangeInv; e[15] = 0;
        return this;
    }

    translate(x, y, z) {
        const e = this.#elements;
        e[12] = e[0] * x + e[4] * y + e[8] * z + e[12];
        e[13] = e[1] * x + e[5] * y + e[9] * z + e[13];
        e[14] = e[2] * x + e[6] * y + e[10] * z + e[14];
        e[15] = e[3] * x + e[7] * y + e[11] * z + e[15];
        return this;
    }

    scale(x, y, z) {
        const e = this.#elements;
        e[0] *= x; e[1] *= x; e[2] *= x; e[3] *= x;
        e[4] *= y; e[5] *= y; e[6] *= y; e[7] *= y;
        e[8] *= z; e[9] *= z; e[10] *= z; e[11] *= z;
        return this;
    }

    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.#elements;
        const m1 = e[4], m2 = e[5], m3 = e[6], m4 = e[7];
        const m5 = e[8], m6 = e[9], m7 = e[10], m8 = e[11];

        e[4] = m1 * c + m5 * s;
        e[5] = m2 * c + m6 * s;
        e[6] = m3 * c + m7 * s;
        e[7] = m4 * c + m8 * s;
        e[8] = m5 * c - m1 * s;
        e[9] = m6 * c - m2 * s;
        e[10] = m7 * c - m3 * s;
        e[11] = m8 * c - m4 * s;
        return this;
    }

    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.#elements;
        const m1 = e[0], m2 = e[1], m3 = e[2], m4 = e[3];
        const m5 = e[8], m6 = e[9], m7 = e[10], m8 = e[11];

        e[0] = m1 * c - m5 * s;
        e[1] = m2 * c - m6 * s;
        e[2] = m3 * c - m7 * s;
        e[3] = m4 * c - m8 * s;
        e[8] = m1 * s + m5 * c;
        e[9] = m2 * s + m6 * c;
        e[10] = m3 * s + m7 * c;
        e[11] = m4 * s + m8 * c;
        return this;
    }

    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.#elements;
        const m1 = e[0], m2 = e[1], m3 = e[2], m4 = e[3];
        const m5 = e[4], m6 = e[5], m7 = e[6], m8 = e[7];

        e[0] = m1 * c + m5 * s;
        e[1] = m2 * c + m6 * s;
        e[2] = m3 * c + m7 * s;
        e[3] = m4 * c + m8 * s;
        e[4] = m5 * c - m1 * s;
        e[5] = m6 * c - m2 * s;
        e[6] = m7 * c - m3 * s;
        e[7] = m8 * c - m4 * s;
        return this;
    }

    invert() {
        const e = this.#elements;
        const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
        const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
        const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
        const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];

        const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
        const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
        const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
        const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if (det === 0) throw new Error("Matrix is not invertible");

        const detInv = 1 / det;
        e[0] = t11 * detInv;
        e[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        e[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        e[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
        e[4] = t12 * detInv;
        e[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        e[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        e[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
        e[8] = t13 * detInv;
        e[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        e[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        e[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
        e[12] = t14 * detInv;
        e[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        e[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        e[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return this;
    }

    multiplyMatrix(matrix) {
        const a = this.#elements;
        const b = matrix.#elements;
        const e = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            const i4 = i * 4;
            const a0 = a[i4], a1 = a[i4 + 1], a2 = a[i4 + 2], a3 = a[i4 + 3];
            e[i4] = a0 * b[0] + a1 * b[4] + a2 * b[8] + a3 * b[12];
            e[i4 + 1] = a0 * b[1] + a1 * b[5] + a2 * b[9] + a3 * b[13];
            e[i4 + 2] = a0 * b[2] + a1 * b[6] + a2 * b[10] + a3 * b[14];
            e[i4 + 3] = a0 * b[3] + a1 * b[7] + a2 * b[11] + a3 * b[15];
        }
        this.#elements.set(e);
        return this;
    }

    multiplyPoints(points) {
        const e = this.#elements;
        const result = new Array(points.length);
        for (let i = 0; i < points.length; i++) {
            const [x, y, z, w = 1] = points[i];
            const tw = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
            const invW = 1 / tw;
            result[i] = [
                (e[0] * x + e[4] * y + e[8] * z + e[12] * w) * invW,
                (e[1] * x + e[5] * y + e[9] * z + e[13] * w) * invW,
                (e[2] * x + e[6] * y + e[10] * z + e[14] * w) * invW,
                tw
            ];
        }
        return result;
    }

    getElements() {
        return new Float32Array(this.#elements);
    }

    clone() {
        return new Matrix4(this.#elements);
    }

    static perspective(fov, aspect, near, far) {
        return new Matrix4().setPerspective(fov, aspect, near, far);
    }
}