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
	
	constructor() {
		// this.fov = 1.5;		// About 86 degrees.
		this.fov = 1.0;
		this.near = 1;
		this.far = 100;
	}
	
	transform () {
		const m = new Matrix4 ();
		m.translate (this.x, this.y, this.z);
		m.rotateX (this.xRot);
		m.rotateY (this.yRot);
		m.rotateZ (this.zRot);
		return m;
	}
	
	_getPerspectiveTransform () {
		const m = new Matrix4 ();
		m.setPerspective (this.fov, this.viewPortWidth / this.viewPortHeight, this.near, this.far);
		return m;
	}
	
	projectPoints(points) {
		const width = this.viewPortWidth;
		const height = this.viewPortHeight;
		const m = this._getPerspectiveTransform();
		const multipliedPoints = m.multiplyPoints (points);
		return multipliedPoints.map(point => {
			const [x, y, z] = point;
			const screenX = (x + 1) / 2 * width;
			const screenY = (1 - y) / 2 * height;
			return [screenX, screenY, z];
		});
	}
}
