// phosphor3D.js (Grok 3 optimized)

import { Matrix4 } from './matrix4.js';
import { Camera } from './camera.js';
import { Face } from './face.js';
import { Model3D } from './model3d.js';
import { FPS } from './fps.js';

export class Phosphor3D {
    #canvas = null;
    #ctx = null;
    #camera = new Camera();
    #models = new Map(); // name -> Model3D
    #fps = new FPS();
    #velocity = 0;
    #targetVelocity = 0;
    #rotationalVelocity = 0;
    #userControlling = false;
    #upKeyDown = false;
    #downKeyDown = false;
    #crawlerDemo = false;
    #animationFrameId = null;
    #rotVel = Math.PI / 500;

    constructor() {
        this.#initKeyListeners();
    }

    get canvas() { return this.#canvas; }
    get ctx() { return this.#ctx; }
    get camera() { return this.#camera; }
    get crawlerDemo() { return this.#crawlerDemo; }
    set crawlerDemo(value) { this.#crawlerDemo = value; }

    init(canvasElement) {
        if (!(canvasElement instanceof HTMLCanvasElement)) throw new Error('Invalid canvas element.');
        this.#canvas = canvasElement;
        this.#ctx = canvasElement.getContext('2d');
        this.#camera.y = 0;      // Center vertically
        this.#camera.z = -200;   // Move camera farther back to see large models
        this.#camera.fov = Math.PI / 3; // 60° FOV for wider view
        this.#camera.near = 1;          // Keep near reasonable
        this.#camera.far = 1000;        // Extend far plane for large models
        
        if (this.#crawlerDemo) {
            this.loadPixieModel('models/crawler.json', 'crawler');
            this.loadPixieModel('models/tread.json', 'tread', () => this.#initTreads());
        } else {
            this.loadPixieModel('models/lm_ascent.json', 'lmAscent');
            this.loadPixieModel('models/lm_descent.json', 'lmDescent', data => {
                const descent = this.#models.get('lmDescent');
                descent.parent = this.#models.get('lmAscent');
            });
        }
        console.log('Initialized models:', this.#models); // Debug log
    }

    loadPixieModel(filePath, name, callback) {
        fetch(filePath)
            .then(response => response.json())
            .then(data => {
                console.log(`Loaded ${name} from ${filePath}`, data); // Debug log
                const model = new Model3D();
                model.initFromJSONData(data);
                if (name === 'lmAscent') model.xRot = -Math.PI / 2;
                else if (name === 'crawler') model.yRot = -Math.PI / 2;
                model.z = -10;    // Move model back
                model.scale = 1;  // Ensure reasonable scale
                this.#models.set(name, model);
                if (callback) callback(data);
            })
            .catch(error => console.error('Error loading model:', error));
    }

    #initTreads() {
        const treadData = this.#models.get('tread');
        const crawler = this.#models.get('crawler');
        const positions = [
            [-0.5, -1], [-8.5, -1],
            [-0.5, -15], [-8.5, -15]
        ];
        for (const [x, y] of positions) {
            const tread = new Model3D(treadData.vertices, treadData.faces, treadData.subfaces);
            tread.initFromJSONData(treadData);
            tread.parent = crawler;
            tread.x = x;
            tread.y = y;
            this.#models.set(`tread${x}${y}`, tread);
        }
        this.#models.delete('tread');
    }

    #initKeyListeners() {
        const keyActions = {
            'Space': this.#primaryAction.bind(this),
            'Enter': this.#primaryAction.bind(this),
            'KeyZ': this.#secondaryAction.bind(this),
            'ArrowUp': this.#upAction.bind(this),
            'KeyW': this.#upAction.bind(this),
            'ArrowDown': this.#downAction.bind(this),
            'KeyS': this.#downAction.bind(this),
            'ArrowLeft': this.#leftAction.bind(this),
            'KeyA': this.#leftAction.bind(this),
            'ArrowRight': this.#rightAction.bind(this),
            'KeyD': this.#rightAction.bind(this)
        };

        document.addEventListener('keydown', e => {
            const action = keyActions[e.code];
            if (action) {
                e.preventDefault();
                action(true);
            }
        });

        document.addEventListener('keyup', e => {
            const action = keyActions[e.code];
            if (action) action(false);
        });
    }

    #primaryAction(down) {}
    #secondaryAction(down) {}
    #upAction(down) {
        if (down) {
            if (this.#upKeyDown) return;
            this.#upKeyDown = true;
            this.#targetVelocity = this.#targetVelocity < 0 ? 0 : 0.2;
            this.#userControlling = true;
        } else this.#upKeyDown = false;
    }

    #downAction(down) {
        if (down) {
            if (this.#downKeyDown) return;
            this.#downKeyDown = true;
            this.#targetVelocity = this.#targetVelocity > 0 ? 0 : -0.2;
            this.#userControlling = true;
        } else this.#downKeyDown = false;
    }

    #leftAction(down) {
        this.#rotationalVelocity = down ? -this.#rotVel : 0;
        this.#userControlling = true;
    }

    #rightAction(down) {
        this.#rotationalVelocity = down ? this.#rotVel : 0;
        this.#userControlling = true;
    }

    #depthSort(faces) {
        faces.sort((a, b) => b.depth - a.depth);
    }

    #drawFace(face) {
        const ctx = this.#ctx;
        const verts = face.vertices;
        ctx.beginPath();
        ctx.moveTo(verts[0][0], verts[0][1]);
        for (let v = 1; v < verts.length; v++) {
            ctx.lineTo(verts[v][0], verts[v][1]);
        }
        if (face.fill) {
            ctx.fillStyle = face.fill;
            ctx.fill();
        }
        if (face.stroke) {
            ctx.lineWidth = this.#crawlerDemo ? 128 / face.depth : 256 / face.depth;
            ctx.strokeStyle = face.stroke;
            ctx.stroke();
        }
    }

    draw() {
        const ctx = this.#ctx;
        const canvas = this.#canvas;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgb(32, 32, 32)';
        ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height);
        ctx.lineJoin = 'bevel';

        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.5);
        ctx.lineTo(canvas.width, canvas.height * 0.5);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(128, 128, 128)';
        ctx.stroke();

        this.#camera.viewPortWidth = canvas.width;
        this.#camera.viewPortHeight = canvas.height;

        const faces = [];
        for (const model of this.#models.values()) {
            faces.push(...model.transformedFaces(this.#camera));
        }
        
        this.#depthSort(faces);
        
        for (const face of faces) {
            face.vertices = this.#camera.projectPoints(face.vertices);
            face.computeIsBackface();
            if (!face.backface) {
                this.#drawFace(face);
                for (const subface of face.subfaces) {
                    subface.vertices = this.#camera.projectPoints(subface.vertices);
                    this.#drawFace(subface);
                }
            }
        }
    }

    begin() {
        if (!this.#animationFrameId) {
            this.#animationFrameId = requestAnimationFrame(this.#animationLoop.bind(this));
        }
    }

    stop() {
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
    }

    #animationLoop(currentTime) {
        const fps = this.#fps.fps();
        const startTime = this.#fps.startFrame();
    
        const crawler = this.#models.get('crawler');
        const ascent = this.#models.get('lmAscent');
        // const descent = this.#models.get('lmDescent');
    
        if (ascent) ascent.zRot -= this.#rotVel; // Rotate ascent
        // Descent inherits rotation via parenting; don’t override unless desired
        if (crawler) {
            // ... crawler logic ...
        }
    
        this.draw();
        const frameTime = this.#fps.endFrame();
        this.#drawFPS(this.#ctx, frameTime, fps);
    
        this.#animationFrameId = requestAnimationFrame(this.#animationLoop.bind(this));
    }
    
//     #animationLoop(currentTime) {
//         const fps = this.#fps.fps();
//         const startTime = this.#fps.startFrame();
// 
//         const crawler = this.#models.get('crawler');
//         const ascent = this.#models.get('lmAscent');
//         // if (ascent) ascent.yRot -= this.#rotVel;
//         if (ascent) ascent.zRot -= this.#rotVel;
//         
//         if (crawler) {
//             if (this.#userControlling) {
//                 this.#velocity += (this.#targetVelocity - this.#velocity) * 0.05;
//                 crawler.yRot += this.#rotationalVelocity;
//                 crawler.x += Math.sin(crawler.yRot) * this.#velocity;
//                 crawler.z -= Math.cos(crawler.yRot) * this.#velocity;
//             } else {
//                 crawler.yRot -= this.#rotVel;
//             }
//         }
// 
//         this.draw();
//         const frameTime = this.#fps.endFrame();
//         this.#drawFPS(this.#ctx, frameTime, fps);
// 
//         this.#animationFrameId = requestAnimationFrame(this.#animationLoop.bind(this));
//     }

    #drawFPS(context, frameTime, fps) {
        context.font = '18px Arial';
        context.fillStyle = '#00BB00';
        context.textAlign = 'right';
        context.fillText(`${frameTime | 0}ms`, 126, 376);
        context.fillText(`${fps}`, 126, 396);
    }
}