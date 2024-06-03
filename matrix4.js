// matrix4.js

// Matrix is defined Column-Major.

export class Matrix4 {
	constructor() {
		this.setIdentity();
	}
	
	setIdentity() {
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}
	
	setPerspective(fov, aspect, near, far) {
		const f = 1.0 / Math.tan(fov / 2.0);
		const rangeInv = 1.0 / (near - far);
		
		this.elements = [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * rangeInv, 2 * near * far * rangeInv,
			0, 0, -1, 0
		];
	}
	
	translate(x, y, z) {
		const translationMatrix = new Matrix4();
		translationMatrix.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		];
		this.multiplyMatrix(translationMatrix);
	}
	
	scale(x, y, z) {
		const scaleMatrix = new Matrix4();
		scaleMatrix.elements = [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		];
		this.multiplyMatrix(scaleMatrix);
	}
	
	rotateX(angle) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const rotationMatrix = new Matrix4();
		rotationMatrix.elements = [
			1,  0,   0,    0,
			0,  cos, -sin, 0,
			0,  sin, cos,  0,
			0,  0,   0,    1
		];
		this.multiplyMatrix(rotationMatrix);
	}
	
	rotateY(angle) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const rotationMatrix = new Matrix4();
		rotationMatrix.elements = [
			cos,  0, sin, 0,
			0,    1,   0, 0,
			-sin, 0, cos, 0,
			0,    0,   0, 1
		];
		this.multiplyMatrix(rotationMatrix);
	}
	
	rotateZ(angle) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const rotationMatrix = new Matrix4();
		rotationMatrix.elements = [
			cos, -sin, 0, 0,
			sin, cos,  0, 0,
			0,   0,    1, 0,
			0,   0,    0, 1
		];
		this.multiplyMatrix(rotationMatrix);
	}
	
	invert() {
		const m = this.elements;
		const inv = new Array(16);
		inv[0] = m[5] * m[10] * m[15] - 
			m[5]  * m[11] * m[14] - 
			m[9]  * m[6]  * m[15] + 
			m[9]  * m[7]  * m[14] +
			m[13] * m[6]  * m[11] - 
			m[13] * m[7]  * m[10];
		inv[4] = -m[4] * m[10] * m[15] + 
			m[4]  * m[11] * m[14] + 
			m[8]  * m[6]  * m[15] - 
			m[8]  * m[7]  * m[14] - 
			m[12] * m[6]  * m[11] + 
			m[12] * m[7]  * m[10];
		inv[8] = m[4] * m[9] * m[15] - 
			m[4]  * m[11] * m[13] - 
			m[8]  * m[5]  * m[15] + 
			m[8]  * m[7]  * m[13] + 
			m[12] * m[5]  * m[11] - 
			m[12] * m[7]  * m[9];
		inv[12] = -m[4] * m[9] * m[14] + 
			m[4]  * m[10] * m[13] +
			m[8]  * m[5]  * m[14] - 
			m[8]  * m[6]  * m[13] - 
			m[12] * m[5]  * m[10] + 
			m[12] * m[6]  * m[9];
		inv[1] = -m[1] * m[10] * m[15] + 
			m[1]  * m[11] * m[14] + 
			m[9]  * m[2]  * m[15] - 
			m[9]  * m[3]  * m[14] - 
			m[13] * m[2]  * m[11] + 
			m[13] * m[3]  * m[10];
		inv[5] = m[0] * m[10] * m[15] - 
			m[0]  * m[11] * m[14] - 
			m[8]  * m[2]  * m[15] + 
			m[8]  * m[3]  * m[14] + 
			m[12] * m[2]  * m[11] - 
			m[12] * m[3]  * m[10];
		inv[9] = -m[0] * m[9] * m[15] + 
			m[0]  * m[11] * m[13] + 
			m[8]  * m[1]  * m[15] - 
			m[8]  * m[3]  * m[13] - 
			m[12] * m[1]  * m[11] + 
			m[12] * m[3]  * m[9];
		inv[13] = m[0] * m[9] * m[14] - 
			m[0]  * m[10] * m[13] - 
			m[8]  * m[1]  * m[14] + 
			m[8]  * m[2]  * m[13] + 
			m[12] * m[1]  * m[10] - 
			m[12] * m[2]  * m[9];
		inv[2] = m[1] * m[6] * m[15] - 
			m[1]  * m[7] * m[14] - 
			m[5]  * m[2] * m[15] + 
			m[5]  * m[3] * m[14] + 
			m[13] * m[2] * m[7] - 
			m[13] * m[3] * m[6];
		inv[6] = -m[0] * m[6] * m[15] + 
			m[0]  * m[7] * m[14] + 
			m[4]  * m[2] * m[15] - 
			m[4]  * m[3] * m[14] - 
			m[12] * m[2] * m[7] + 
			m[12] * m[3] * m[6];
		inv[10] = m[0] * m[5] * m[15] - 
			m[0]  * m[7] * m[13] - 
			m[4]  * m[1] * m[15] + 
			m[4]  * m[3] * m[13] + 
			m[12] * m[1] * m[7] - 
			m[12] * m[3] * m[5];
		inv[14] = -m[0] * m[5] * m[14] + 
			m[0]  * m[6] * m[13] + 
			m[4]  * m[1] * m[14] - 
			m[4]  * m[2] * m[13] - 
			m[12] * m[1] * m[6] + 
			m[12] * m[2] * m[5];
		inv[3] = -m[1] * m[6] * m[11] + 
			m[1] * m[7] * m[10] + 
			m[5] * m[2] * m[11] - 
			m[5] * m[3] * m[10] - 
			m[9] * m[2] * m[7] + 
			m[9] * m[3] * m[6];
		inv[7] = m[0] * m[6] * m[11] - 
			m[0] * m[7] * m[10] - 
			m[4] * m[2] * m[11] + 
			m[4] * m[3] * m[10] + 
			m[8] * m[2] * m[7] - 
			m[8] * m[3] * m[6];
		inv[11] = -m[0] * m[5] * m[11] + 
			m[0] * m[7] * m[9] + 
			m[4] * m[1] * m[11] - 
			m[4] * m[3] * m[9] - 
			m[8] * m[1] * m[7] + 
			m[8] * m[3] * m[5];
		inv[15] = m[0] * m[5] * m[10] - 
			m[0] * m[6] * m[9] - 
			m[4] * m[1] * m[10] + 
			m[4] * m[2] * m[9] + 
			m[8] * m[1] * m[6] - 
			m[8] * m[2] * m[5];
		
		let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
		if (det === 0) {
			throw new Error("Matrix is not invertible");
		}
		det = 1.0 / det;
		for (let i = 0; i < 16; i++) {
			inv[i] *= det;
		}
		
		this.elements = inv;
	}
	
	multiplyMatrix(matrix) {
		const a = this.elements;
		const b = matrix.elements;
		const result = new Array(16);
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				result[row * 4 + col] = 
					a[row * 4 + 0] * b[0 * 4 + col] +
					a[row * 4 + 1] * b[1 * 4 + col] +
					a[row * 4 + 2] * b[2 * 4 + col] +
					a[row * 4 + 3] * b[3 * 4 + col];
			}
		}
		this.elements = result;
	}
	
	multiplyPoints(points) {
		const m = this.elements;
		return points.map(point => {
			const [x, y, z, w] = point;
			const tx = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
			const ty = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
			const tz = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
			const tw = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
			return [tx / tw, ty / tw, tz / tw, tw];
		});
	}
}
