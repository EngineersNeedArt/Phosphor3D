// phosphor.js

import { Matrix4 } from './matrix4.js';
import { Camera } from './camera.js';
import { Face } from './face.js';
import { Model3D } from './model3d.js';
import { FPS } from './fps.js';

export class Phosphor {
	constructor () {
		this.canvas = null;
		this.ctx = null;
		this.cameraMatrix = new Matrix4();
		this.camera = new Camera();
		this.crawler = null;
		this.treads = [];
		this.rotXVel = (Math.PI / 500);
		this.rotYVel = (Math.PI / 500);
		this.rotZVel = (Math.PI / 500);
		this.fps = new FPS ();
		
		this.velocity = 0;
		this.targetVelocity = 0;
		this.rotationalVelocity = 0;
		this.userControlling = false;
		this.upKeyDown = false;
		this.downKeyDown = false;
	}
	
	_primaryAction (down) {
	}

	_secondaryAction (down) {
	}
	
	_upAction (down) {
		if (down) {
			if (this.upKeyDown) {
				return;
			}
			this.upKeyDown = true;
			if (this.targetVelocity < 0) {
				this.targetVelocity = 0;
			} else {
				this.targetVelocity = 0.2;
			}
			this.userControlling = true;
		} else {
			this.upKeyDown = false;
		}
	}
	
	_downAction (down) {
		if (down) {
			if (this.downKeyDown) {
				return;
			}
			this.downKeyDown = true;
			if (this.targetVelocity > 0) {
				this.targetVelocity = 0;
			} else {
				this.targetVelocity = -0.2;
			}
			this.velocity = 0;
			this.userControlling = true;
		} else {
			this.downKeyDown = false;
		}
	}
	
	_leftAction (down) {
		if (down) {
			this.rotationalVelocity = (Math.PI / -500);			
		} else {
			this.rotationalVelocity = 0;
		}
		this.userControlling = true;
	}
	
	_rightAction (down) {
		if (down) {
			this.rotationalVelocity = (Math.PI / 500);
		} else {
			this.rotationalVelocity = 0;
		}
		this.userControlling = true;
	}
	
	_initKeyListeners () {
		document.addEventListener ("keydown", (e) =>{
			if ((e.code == "Space") || (e.code == "Enter")) {
				e.preventDefault ();
				this._primaryAction (true);
			} else if (e.code == "KeyZ") {
				this._secondaryAction (true);
			} else if ((e.code == "ArrowUp") || (e.code == "KeyW")) {
				e.preventDefault ();
				this._upAction (true);
			} else if ((e.code == "ArrowDown") || (e.code == "KeyS")) {
				e.preventDefault ();
				this._downAction (true);
			} else if ((e.code == "ArrowLeft") || (e.code == "KeyA")) {
				this._leftAction (true);
			} else if ((e.code == "ArrowRight") || (e.code == "KeyD")) {
				this._rightAction (true);
			}
		});
		
		document.addEventListener ("keyup", (e) =>{
			if ((e.code == "Space") || (e.code == "Enter")) {
				this._primaryAction (false);
			} else if (e.code == "KeyZ") {
				this._secondaryAction (false);
			} else if ((e.code == "ArrowUp") || (e.code == "KeyW")) {
				this._upAction (false);
			} else if ((e.code == "ArrowDown") || (e.code == "KeyS")) {
				this._downAction (false);
			} else if ((e.code == "ArrowLeft") || (e.code == "KeyA")) {
				this._leftAction (false);
			} else if ((e.code == "ArrowRight") || (e.code == "KeyD")) {
				this._rightAction (false);
			}
		});
	}
	
	initCrawler (jsonData) {
		this.crawler = new Model3D();
		this.crawler.initFromJSONData(jsonData);
		this.crawler.yRot = Math.PI / -2;
	}
	
	initTread (jsonData) {
		for (let i = 0; i < 4; i++) {
			const tread = new Model3D();
			tread.initFromJSONData(jsonData);
			tread.parent = this.crawler;
			this.treads.push (tread);
			if (i === 0) {
				tread.x = -0.5;
				tread.y = -1;
			} else if (i === 1) {
				tread.x = -8.5;
				tread.y = -1;
			} else if (i === 2) {
				tread.x = -0.5;
				tread.y = -15;
			} else if (i === 3) {
				tread.x = -8.5;
				tread.y = -15;
			}
		}
	}
	
	loadPixieModel (filePath, operation) {
		fetch (filePath)
		.then (response => response.json())
		.then (data => {
			operation.call(this, data);
		})
		.catch(error => console.error(error));
	}
	
	init (canvasElement) {
		this.canvas = canvasElement;
		this.ctx = this.canvas.getContext('2d');
		
		this._initKeyListeners();
		
		this.camera.y = 15;
		
		this.loadPixieModel ('models/crawler.json', this.initCrawler);
		this.loadPixieModel ('models/tread.json', this.initTread);
	}
	
	_depthSort (polygons) {
		// Sort polygons by depth in ascending order
		polygons.sort((a, b) => a.depth - b.depth);
	}
	
	_drawPolygon (polygon) {		
		this.ctx.beginPath();
		let vertex = polygon.vertices[0];
		this.ctx.moveTo (vertex[0], vertex[1]);
		for (let v = 1; v < polygon.vertices.length; v++) {
			vertex = polygon.vertices[v];
			this.ctx.lineTo(vertex[0], vertex[1]);
		}
		
		// Fill.
		if (polygon.fill) {
			this.ctx.fillStyle = polygon.fill;
			this.ctx.fill();
		}
		
		// Stroke.
		if (polygon.stroke) {
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = polygon.stroke;
			this.ctx.stroke();
		}
	}
	
	draw () {
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect (0, 0, this.canvas.width, this.canvas.height);
		this.ctx.lineJoin = "bevel";
		
		this.ctx.beginPath();
		this.ctx.moveTo (0, this.canvas.height / 2.0);
		this.ctx.lineTo (this.canvas.width, this.canvas.height / 2.0);
		this.ctx.lineWidth = 3;
		this.ctx.strokeStyle = "rgb(255, 165, 0)";
		this.ctx.stroke();

		let polygons = [];
		
		this.camera.viewPortWidth = this.ctx.canvas.width;
		this.camera.viewPortHeight = this.ctx.canvas.height;
		
		if ((this.crawler !== null) && (this.crawler !== undefined)) {
			polygons.push.apply(polygons, this.crawler.transformedPolygons (this.camera));
		}
		
		if ((this.treads !== null) && (this.treads !== undefined)) {
			for (let t = 0; t < this.treads.length; t++) {
				const oneTread = this.treads[t];
				polygons.push.apply(polygons, oneTread.transformedPolygons (this.camera));
			}
		}
		
		this._depthSort (polygons);
		
		if (polygons.length > 0) {
			for (let p = 0; p < polygons.length; p++) {
				const onePoly = polygons[p];
				if (onePoly.isBackface()) {
					continue;
				}
				this._drawPolygon (onePoly);
				
				const subfaces = onePoly.subfaces;
				if (subfaces) {
					for (let s = 0; s < subfaces.length; s++) {
						const oneSubface = subfaces[s];
						this._drawPolygon (oneSubface);
					}
				}
			}
		}
	}
	
	begin () {
		requestAnimationFrame(this.animationLoop);
	}
	
	_drawFPS (context, frameTime, fps) {
		context.font = "18px Arial";
		context.fillStyle = "#00BB00";
		context.textAlign = "right";
		context.fillText (frameTime|0 + 'ms', 126, 376);
		context.fillText (fps, 126, 396);
	}
	
	animationLoop = (currentTime) => {
		var fps = this.fps.fps ();
		var startTime = this.fps.startFrame ();
		
		if (this.crawler) {
			if (this.userControlling) {
				if (this.velocity < this.targetVelocity) {
					this.velocity += 0.001;
					if (this.velocity > this.targetVelocity) {
						this.velocity = this.targetVelocity;
					}
				} else if (this.velocity > this.targetVelocity) {
					this.velocity -= 0.001;
					if (this.velocity < this.targetVelocity) {
						this.velocity = this.targetVelocity;
					}
				}
				this.crawler.yRot += this.rotationalVelocity;
				this.crawler.x += Math.sin (this.crawler.yRot) * this.velocity;
				this.crawler.z -= Math.cos (this.crawler.yRot) * this.velocity;
			} else {
				this.crawler.yRot = this.crawler.yRot - this.rotYVel;
			}
		}
		
		this.draw ();
		
		// Display FPS.
		if (true) {
			var frameTime = this.fps.endFrame ();
			this._drawFPS (this.ctx, frameTime, fps);
		}
		
		// Kick off another animation loop.
		requestAnimationFrame (this.animationLoop);
	}
}