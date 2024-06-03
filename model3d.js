// model3d.js

import { Matrix4 } from './matrix4.js';
import { Face } from './face.js';

export class Model3D {
	x = 0;
	y = 0;
	z = 0;
	scale = 1;
	xRot = 0;
	yRot = 0;
	zRot = 0;
	stroke = null;
	fill = null;
	parent = null;
	
	constructor() {
		this.vertices = [];
		this.faces = [];
		this.faces2 = [];
		this.subfaces = null;
	}
	
	initFromJSONData (jsonData) {
		if (jsonData.vertices) {
			this.vertices = jsonData.vertices.slice();
		}
		if (jsonData.faces2) {
			this.faces2 = jsonData.faces2.slice();
		} else if (jsonData.faces) {
			this.faces = jsonData.faces.slice();
		}
		if (jsonData.subfaces) {
			this.subfaces = jsonData.subfaces.slice();
		}
		
		this.x = jsonData.x;
		this.y = jsonData.y;
		this.z = jsonData.z;	
		this.scale = jsonData.scale;
		this.xRot = jsonData.xRot;
		this.yRot = jsonData.yRot;
		this.zRot = jsonData.zRot;
		this.fill = jsonData.fill;
		this.stroke = jsonData.stroke;
	}
	
	_wrapAngle(angle) {
		if ((angle < 0) || (angle > 2 * Math.PI)) {
			angle = angle % (2 * Math.PI);
			if (angle < 0) {
				angle += 2 * Math.PI;
			}
		}
		return angle;
	}
	
	localMatrix () {
		let m = new Matrix4();
		m.scale (this.scale, this.scale, this.scale);
		m.rotateX (this.xRot);
		m.rotateY (this.yRot);
		m.rotateZ (this.zRot);
		m.translate (this.x, this.y, this.z);
		if (this.parent) {
			m.multiplyMatrix(this.parent.localMatrix());
		}
		return m;
	}
	
	transformedPolygons (camera) {
		// Project vertices.
		const projectedVertices = camera.projectPoints (this.localMatrix(), this.vertices);
		
		// Create polygons with new vertices.
		const transformedPolygons = [];
		for (let f = 0; f < this.faces.length; f++) {
			const newPolygon = new Face();
			let oneFace = this.faces[f];
			const length = oneFace.length;
			for (let v = 0; v < length; v++) {
				newPolygon.vertices.push (projectedVertices[oneFace[v]]);
			}
			newPolygon.computeAverageDepth();
			newPolygon.fill = this.fill;
			newPolygon.stroke = this.stroke;
			transformedPolygons.push (newPolygon);
		}
		for (let f = 0; f < this.faces2.length; f++) {
			const newPolygon = new Face();
			let oneFace = this.faces2[f];
			const vertices = oneFace.vertices;
			const length = vertices.length;
			for (let v = 0; v < length; v++) {
				newPolygon.vertices.push (projectedVertices[vertices[v]]);
			}
			newPolygon.computeAverageDepth();
			newPolygon.fill = this.fill;
			newPolygon.stroke = this.stroke;
			if (oneFace.doublesided) {
				newPolygon.doublesided = oneFace.doublesided;
			}
			transformedPolygons.push (newPolygon);
		}
		
		if (this.subfaces) {
			for (let s = 0; s < this.subfaces.length; s++) {
				const newPolygon = new Face();
				let oneSubface = this.subfaces[s];
				const vertices = oneSubface.vertices;
				const length = vertices.length;
				for (let v = 0; v < length; v++) {
					newPolygon.vertices.push (projectedVertices[vertices[v]]);
				}
				newPolygon.fill = this.fill;
				newPolygon.stroke = this.stroke;
				const parentIndex = oneSubface.parent;
				transformedPolygons[parentIndex].subfaces.push(newPolygon);
			}
		}
		
		return transformedPolygons;
	}
}
