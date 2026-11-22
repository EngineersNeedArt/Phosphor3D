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
	
	// A face is only safe to build/draw/sort if every vertex it references
	// survived projection (see Matrix4.multiplyPoints -- points at or behind
	// the camera are flagged invalid rather than producing garbage coordinates).
	_allVerticesValid (indices, projectedVertices) {
		for (let i = 0; i < indices.length; i++) {
			if (!projectedVertices[indices[i]][3]) {
				return false;
			}
		}
		return true;
	}
	
	// A faces2 entry or subface may set its own "fill" and/or "stroke" (null for
	// none); otherwise it uses the model's.
	_faceColor (face, key) {
		return key in face ? face[key] : this[key];
	}
	
	// Model space to view space: the model's transform (and its parents'), then
	// the camera's, but not the perspective.
	_viewMatrix (camera) {
		const m = this.localMatrix();
		m.multiplyMatrix(camera._getCameraTransform());
		return m;
	}
	
	// A billboard face always turns its full face to the camera, like a sprite.
	// Only the face's centre (the average of its vertices) goes through the model's
	// rotation; the vertices' x/y offsets from that centre are then laid out flat
	// in view space, parallel to the screen, so one 20-sided circle can stand in
	// for a sphere. Offsets are scaled by the model's (and its parents') scale.
	// The polygon reads as it would for an unrotated model seen by an unrotated
	// camera. Vertices' z offsets are ignored: the face is flat, at the centre's depth.
	_billboardVertices (indices, viewMatrix, camera) {
		// Faces repeat the first vertex to close the outline; don't count it twice.
		const closed = indices.length > 2 && indices[0] === indices[indices.length - 1];
		const unique = closed ? indices.slice(0, -1) : indices;
		const center = [0, 0, 0, 1];
		for (const i of unique) {
			center[0] += this.vertices[i][0] / unique.length;
			center[1] += this.vertices[i][1] / unique.length;
			center[2] += this.vertices[i][2] / unique.length;
		}
		// (Not multiplyPoints: it flags any point without perspective's negative w as invalid.)
		const e = viewMatrix.elements;
		const [x, y, z] = center;
		const cx = e[0] * x + e[4] * y + e[8] * z + e[12];
		const cy = e[1] * x + e[5] * y + e[9] * z + e[13];
		const cz = e[2] * x + e[6] * y + e[10] * z + e[14];
		const scale = Math.hypot(e[0], e[1], e[2]);
		const viewPoints = indices.map(i => [
			cx + (this.vertices[i][0] - center[0]) * scale,
			cy + (this.vertices[i][1] - center[1]) * scale,
			cz,
			1,
		]);
		return camera.projectViewPoints(viewPoints);
	}
	
	transformedPolygons (camera) {
		// Project vertices.
		const projectedVertices = camera.projectPoints (this.localMatrix(), this.vertices);
		
		// Create polygons with new vertices.
		const transformedPolygons = [];
		let viewMatrix = null;	// model-to-view-space, built only if a billboard face needs it
		for (let f = 0; f < this.faces.length; f++) {
			const newPolygon = new Face();
			let oneFace = this.faces[f];
			const length = oneFace.length;
			newPolygon.valid = this._allVerticesValid(oneFace, projectedVertices);
			if (newPolygon.valid) {
				for (let v = 0; v < length; v++) {
					newPolygon.vertices.push (projectedVertices[oneFace[v]]);
				}
				newPolygon.computeAverageDepth();
			}
			newPolygon.fill = this.fill;
			newPolygon.stroke = this.stroke;
			transformedPolygons.push (newPolygon);
		}
		for (let f = 0; f < this.faces2.length; f++) {
			const newPolygon = new Face();
			let oneFace = this.faces2[f];
			const vertices = oneFace.vertices;
			const length = vertices.length;
			if (oneFace.billboard) {
				viewMatrix ??= this._viewMatrix(camera);
				newPolygon.vertices = this._billboardVertices(vertices, viewMatrix, camera);
				newPolygon.valid = newPolygon.vertices.every(vertex => vertex[3]);
				newPolygon.doublesided = true;	// it always faces the camera anyway
			} else {
				newPolygon.valid = this._allVerticesValid(vertices, projectedVertices);
				if (newPolygon.valid) {
					for (let v = 0; v < length; v++) {
						newPolygon.vertices.push (projectedVertices[vertices[v]]);
					}
				}
			}
			if (newPolygon.valid) {
				newPolygon.computeAverageDepth();
			}
			newPolygon.fill = this._faceColor(oneFace, 'fill');
			newPolygon.stroke = this._faceColor(oneFace, 'stroke');
			if (oneFace.doublesided) {
				newPolygon.doublesided = oneFace.doublesided;
			}
			if (oneFace.hiddenEdges) {
				newPolygon.hiddenEdges = oneFace.hiddenEdges;
			}
			transformedPolygons.push (newPolygon);
		}
		
		if (this.subfaces) {
			for (let s = 0; s < this.subfaces.length; s++) {
				const oneSubface = this.subfaces[s];
				const vertices = oneSubface.vertices;
				const parentIndex = oneSubface.parent;
				const parentPolygon = transformedPolygons[parentIndex];
				const subfaceValid = this._allVerticesValid(vertices, projectedVertices);
				// Only draw a subface if both it and the face it decorates survived projection.
				if (subfaceValid && parentPolygon && parentPolygon.valid) {
					const newPolygon = new Face();
					const length = vertices.length;
					for (let v = 0; v < length; v++) {
						newPolygon.vertices.push (projectedVertices[vertices[v]]);
					}
					newPolygon.fill = this._faceColor(oneSubface, 'fill');
					newPolygon.stroke = this._faceColor(oneSubface, 'stroke');
					if (oneSubface.hiddenEdges) {
						newPolygon.hiddenEdges = oneSubface.hiddenEdges;
					}
					parentPolygon.subfaces.push(newPolygon);
				}
			}
		}
		
		// Drop any face that couldn't be safely projected. Subfaces attached above
		// were already gated on their parent's validity, so nothing is left dangling.
		return transformedPolygons.filter(polygon => polygon.valid);
	}
}
