// camera.js

import { Matrix4 } from './matrix4.js';

export class Camera {
	viewPortWidth = 1600;
	viewPortHeight = 900;
	x = 0;
	y = 0;
	z = 0;
	xRot = 0;
	yRot = 0;
	zRot = 0;
	velocity = 0;
	
	// `fov` is the HORIZONTAL field of view, in radians, and stays constant no
	// matter what the canvas's aspect ratio is (resizing the window changes how
	// much vertical scene you see, not how stretched the edges look).
	// ~1.13 rad = 65 degrees, a "normal lens" feel with minimal edge distortion.
	static FOV_MIN = 20 * Math.PI / 180;
	static FOV_MAX = 150 * Math.PI / 180;
	
	constructor() {
		this.fov = 65 * Math.PI / 180;
		this.near = 1;
		this.far = 100;
	}
	
	_getCameraTransform () {
		const m = new Matrix4 ();
		m.translate (this.x, this.y, this.z);
		m.rotateX (this.xRot);
		m.rotateY (this.yRot);
		m.rotateZ (this.zRot);
		return m;
	}
	
	_getPerspectiveTransform () {
		const m = new Matrix4 ();
		const aspect = this.viewPortWidth / this.viewPortHeight;
		// Derive the vertical scale factor that yields our fixed horizontal FOV
		// at this aspect ratio: f = aspect / tan(hFov / 2).
		const f = aspect / Math.tan (this.fov / 2.0);
		m.setPerspective (f, aspect, this.near, this.far);
		return m;
	}
	
	projectPoints(matrix, points) {
		matrix.multiplyMatrix (this._getCameraTransform());
		matrix.multiplyMatrix (this._getPerspectiveTransform());
		return this._toScreen (matrix.multiplyPoints (points));
	}
	
	// Like projectPoints, for points already in view space (after the camera
	// transform): applies only the perspective. Used for billboard faces.
	projectViewPoints(points) {
		return this._toScreen (this._getPerspectiveTransform().multiplyPoints (points));
	}
	
	_toScreen (multipliedPoints) {
		const width = this.viewPortWidth;
		const height = this.viewPortHeight;
		return multipliedPoints.map(point => {
			const [x, y, z, w, valid] = point;
			const screenX = (x + 1) / 2 * width;
			const screenY = (1 - y) / 2 * height;
			return [screenX, screenY, z, valid];
		});
	}
}
