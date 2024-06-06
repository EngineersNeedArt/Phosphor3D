// face.js

export class Face {
	vertices = [];
	subfaces = [];
	stroke = null;
	fill = null;
	doublesided = false;
	depth = 0;
	
	constructor() {
	}
	
	isBackface () {
		if (this.doublesided) {
			return false;
		}
		if (this.vertices.length > 2) {
			// Assume right-handed coordinate system
			const v1 = this.vertices[0];
			const v2 = this.vertices[1];
			const v3 = this.vertices[2];
			const e1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
			const e2 = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];
			const cp = e1[0] * e2[1] - e1[1] * e2[0];
			return cp > 0;
		}
		return false;
	}
}
