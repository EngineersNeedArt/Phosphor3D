// face.js

export class Face {
	vertices = [];
	subfaces = [];
	stroke = null;
	fill = null;
	doublesided = false;
	depth = 0;
	
	constructor() {
		this.depth = 0;
		this.backface = false;
	}
	
	computeDepth () {
		if (0) {
			var totalDepth = 0;
			const numVertices = this.vertices.length - 1;
			// const numVertices = this.vertices.length;
			for (let v = 0; v < numVertices; v++) {
				const [x, y, z] = this.vertices[v];
				totalDepth += z;
			}
			this.depth = totalDepth / numVertices;	
		} else if (0) {
			const [x, y, z] = this.vertices[0];
			var refDepth = z;
			const numVertices = this.vertices.length;
			for (let v = 1; v < numVertices; v++) {
				const [x, y, z] = this.vertices[v];
				if (z > refDepth) {
					refDepth = z;
				}
			}
			this.depth = refDepth;
		} else {
			const [x, y, z] = this.vertices[0];
			var minDepth = z;
			var maxDepth = z;
			const numVertices = this.vertices.length;
			for (let v = 1; v < numVertices; v++) {
				const [x, y, z] = this.vertices[v];
				if (z < minDepth) {
					minDepth = z;
				}
				if (z > maxDepth) {
					maxDepth = z;
				}
			}
			this.depth = (minDepth + maxDepth) / 2.0;
		}
	}
	
	computeIsBackface () {
		if ((this.doublesided) || (this.vertices.length < 3)) {
			this.backface = false;
		} else {
			// Assume right-handed coordinate system
			const [v1, v2, v3] = this.vertices;
			const e1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
			const e2 = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];
			const cp = e1[0] * e2[1] - e1[1] * e2[0];
			this.backface = (cp > 0);
			// this.backface = (cp < 0);
		}
	}
}
