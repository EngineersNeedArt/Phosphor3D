// phosphor3D.js -- tweaks made by DeepSeek.

import { Matrix4 } from './matrix4.js';
import { Camera } from './camera.js';
import { Face } from './face.js';
import { Model3D } from './model3d.js';
import { FPS } from './fps.js';

export class Phosphor3D {
    // Private fields
    #canvas = null;
    #ctx = null;
    #cameraMatrix = new Matrix4();
    #camera = new Camera();
    #lmAscent = null;
    #lmDescent = null;
    #crawler = null;
    #treads = [];
    #rotXVel = Math.PI / 500;
    #rotYVel = Math.PI / 500;
    #rotZVel = Math.PI / 500;
    #fps = new FPS();
    #velocity = 0;
    #targetVelocity = 0;
    #rotationalVelocity = 0;
    #userControlling = false;
    #upKeyDown = false;
    #downKeyDown = false;
    #crawlerDemo = false;
    #animationFrameId = null;

    constructor() {
        this.#initKeyListeners();
    }

    // Getters and setters for private fields
    get canvas() {
        return this.#canvas;
    }

    get ctx() {
        return this.#ctx;
    }

    get camera() {
        return this.#camera;
    }

    get lmAscent() {
        return this.#lmAscent;
    }

    get lmDescent() {
        return this.#lmDescent;
    }

    get crawler() {
        return this.#crawler;
    }

    get treads() {
        return this.#treads;
    }

    get crawlerDemo() {
        return this.#crawlerDemo;
    }

    set crawlerDemo(value) {
        this.#crawlerDemo = value;
    }

    /**
     * Initializes the Phosphor3D instance with a canvas element.
     * @param {HTMLCanvasElement} canvasElement - The canvas element to render on.
     */
    init(canvasElement) {
        if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error('Invalid canvas element.');
        }

        this.#canvas = canvasElement;
        this.#ctx = this.#canvas.getContext('2d');

        this.#camera.y = 15;

        if (this.#crawlerDemo) {
            this.loadPixieModel('models/crawler.json', this.initCrawler.bind(this));
            this.loadPixieModel('models/tread.json', this.initTread.bind(this));
        } else {
            this.loadPixieModel('models/lm_ascent.json', this.initLunarAscent.bind(this));
            this.loadPixieModel('models/lm_descent.json', this.initLunarDescent.bind(this));
        }
    }

    /**
     * Loads a 3D model from a JSON file.
     * @param {string} filePath - The path to the JSON file.
     * @param {Function} operation - The function to call with the loaded data.
     */
    loadPixieModel(filePath, operation) {
        fetch(filePath)
            .then(response => response.json())
            .then(data => operation(data))
            .catch(error => console.error('Error loading model:', error));
    }

    /**
     * Initializes the lunar ascent module.
     * @param {Object} jsonData - The JSON data for the lunar ascent module.
     */
    initLunarAscent(jsonData) {
        this.#lmAscent = new Model3D();
        this.#lmAscent.initFromJSONData(jsonData);
        this.#lmAscent.xRot = Math.PI / -2;
    }

    /**
     * Initializes the lunar descent module.
     * @param {Object} jsonData - The JSON data for the lunar descent module.
     */
    initLunarDescent(jsonData) {
        this.#lmDescent = new Model3D();
        this.#lmDescent.initFromJSONData(jsonData);
        this.#lmDescent.parent = this.#lmAscent;
    }

    /**
     * Initializes the crawler module.
     * @param {Object} jsonData - The JSON data for the crawler module.
     */
    initCrawler(jsonData) {
        this.#crawler = new Model3D();
        this.#crawler.initFromJSONData(jsonData);
        this.#crawler.yRot = Math.PI / -2;
    }

    /**
     * Initializes the tread modules.
     * @param {Object} jsonData - The JSON data for the tread modules.
     */
    initTread(jsonData) {
        for (let i = 0; i < 4; i++) {
            const tread = new Model3D();
            tread.initFromJSONData(jsonData);
            tread.parent = this.#crawler;
            this.#treads.push(tread);

            switch (i) {
                case 0:
                    tread.x = -0.5;
                    tread.y = -1;
                    break;
                case 1:
                    tread.x = -8.5;
                    tread.y = -1;
                    break;
                case 2:
                    tread.x = -0.5;
                    tread.y = -15;
                    break;
                case 3:
                    tread.x = -8.5;
                    tread.y = -15;
                    break;
            }
        }
    }

    /**
     * Initializes key listeners for user input.
     */
    #initKeyListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    this.#primaryAction(true);
                    break;
                case 'KeyZ':
                    this.#secondaryAction(true);
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.#upAction(true);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.#downAction(true);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.#leftAction(true);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.#rightAction(true);
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'Space':
                case 'Enter':
                    this.#primaryAction(false);
                    break;
                case 'KeyZ':
                    this.#secondaryAction(false);
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.#upAction(false);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.#downAction(false);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.#leftAction(false);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.#rightAction(false);
                    break;
            }
        });
    }

    /**
     * Handles the primary action (e.g., space/enter key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #primaryAction(down) {
        // Implement primary action logic here
    }

    /**
     * Handles the secondary action (e.g., Z key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #secondaryAction(down) {
        // Implement secondary action logic here
    }

    /**
     * Handles the up action (e.g., up arrow/W key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #upAction(down) {
        if (down) {
            if (this.#upKeyDown) return;
            this.#upKeyDown = true;
            this.#targetVelocity = this.#targetVelocity < 0 ? 0 : 0.2;
            this.#userControlling = true;
        } else {
            this.#upKeyDown = false;
        }
    }

    /**
     * Handles the down action (e.g., down arrow/S key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #downAction(down) {
        if (down) {
            if (this.#downKeyDown) return;
            this.#downKeyDown = true;
            this.#targetVelocity = this.#targetVelocity > 0 ? 0 : -0.2;
            this.#userControlling = true;
        } else {
            this.#downKeyDown = false;
        }
    }

    /**
     * Handles the left action (e.g., left arrow/A key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #leftAction(down) {
        this.#rotationalVelocity = down ? Math.PI / -500 : 0;
        this.#userControlling = true;
    }

    /**
     * Handles the right action (e.g., right arrow/D key).
     * @param {boolean} down - Whether the key is pressed down.
     */
    #rightAction(down) {
        this.#rotationalVelocity = down ? Math.PI / 500 : 0;
        this.#userControlling = true;
    }

    /**
     * Sorts faces by depth in descending order.
     * @param {Array<Face>} faces - The array of faces to sort.
     */
    #depthSort(faces) {
        faces.sort((a, b) => b.depth - a.depth);
    }

    /**
     * Draws a face on the canvas.
     * @param {Face} face - The face to draw.
     */
    #drawFace(face) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(face.vertices[0][0], face.vertices[0][1]);

        for (let v = 1; v < face.vertices.length; v++) {
            this.#ctx.lineTo(face.vertices[v][0], face.vertices[v][1]);
        }

        if (face.fill) {
            this.#ctx.fillStyle = face.fill;
            this.#ctx.fill();
        }

        if (face.stroke) {
            this.#ctx.lineWidth = this.#crawlerDemo ? 128 / face.depth : 256 / face.depth;
            this.#ctx.strokeStyle = face.stroke;
            this.#ctx.stroke();
        }
    }

    /**
     * Draws the scene on the canvas.
     */
    draw() {
        this.#ctx.fillStyle = 'black';
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.fillStyle = 'rgb(32, 32, 32)';
        this.#ctx.fillRect(0, this.#canvas.height / 2, this.#canvas.width, this.#canvas.height);
        this.#ctx.lineJoin = 'bevel';

        this.#ctx.beginPath();
        this.#ctx.moveTo(0, this.#canvas.height / 2);
        this.#ctx.lineTo(this.#canvas.width, this.#canvas.height / 2);
        this.#ctx.lineWidth = 3;
        this.#ctx.strokeStyle = 'rgb(128, 128, 128)';
        this.#ctx.stroke();

        let faces = [];

        this.#camera.viewPortWidth = this.#canvas.width;
        this.#camera.viewPortHeight = this.#canvas.height;

        if (this.#lmAscent) {
            faces.push(...this.#lmAscent.transformedFaces(this.#camera));
        }
        if (this.#lmDescent) {
            faces.push(...this.#lmDescent.transformedFaces(this.#camera));
        }
        if (this.#crawler) {
            faces.push(...this.#crawler.transformedFaces(this.#camera));
        }
        if (this.#treads.length > 0) {
            this.#treads.forEach(tread => {
                faces.push(...tread.transformedFaces(this.#camera));
            });
        }

        this.#depthSort(faces);

        for (const face of faces) {
            face.vertices = this.#camera.projectPoints(face.vertices);
            face.computeIsBackface();

            if (!face.backface) {
                this.#drawFace(face);

                if (face.subfaces) {
                    face.subfaces.forEach(subface => {
                        subface.vertices = this.#camera.projectPoints(subface.vertices);
                        this.#drawFace(subface);
                    });
                }
            }
        }
    }

    /**
     * Starts the animation loop.
     */
    begin() {
        if (!this.#animationFrameId) {
            this.#animationFrameId = requestAnimationFrame(this.#animationLoop);
        }
    }

    /**
     * Stops the animation loop.
     */
    stop() {
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
    }

    /**
     * The animation loop.
     * @param {number} currentTime - The current time in milliseconds.
     */
    #animationLoop = (currentTime) => {
        const fps = this.#fps.fps();
        const startTime = this.#fps.startFrame();

        if (this.#lmAscent) {
            this.#lmAscent.yRot -= this.#rotYVel;
        }

        if (this.#crawler) {
            if (this.#userControlling) {
                if (this.#velocity < this.#targetVelocity) {
                    this.#velocity += 0.001;
                    if (this.#velocity > this.#targetVelocity) {
                        this.#velocity = this.#targetVelocity;
                    }
                } else if (this.#velocity > this.#targetVelocity) {
                    this.#velocity -= 0.001;
                    if (this.#velocity < this.#targetVelocity) {
                        this.#velocity = this.#targetVelocity;
                    }
                }
                this.#crawler.yRot += this.#rotationalVelocity;
                this.#crawler.x += Math.sin(this.#crawler.yRot) * this.#velocity;
                this.#crawler.z -= Math.cos(this.#crawler.yRot) * this.#velocity;
            } else {
                this.#crawler.yRot -= this.#rotYVel;
            }
        }

        this.draw();

        if (true) {
            const frameTime = this.#fps.endFrame();
            this.#drawFPS(this.#ctx, frameTime, fps);
        }

        this.#animationFrameId = requestAnimationFrame(this.#animationLoop);
    };

    /**
     * Draws the FPS and frame time on the canvas.
     * @param {CanvasRenderingContext2D} context - The canvas context.
     * @param {number} frameTime - The frame time in milliseconds.
     * @param {number} fps - The frames per second.
     */
    #drawFPS(context, frameTime, fps) {
        context.font = '18px Arial';
        context.fillStyle = '#00BB00';
        context.textAlign = 'right';
        context.fillText(`${frameTime | 0}ms`, 126, 376);
        context.fillText(`${fps}`, 126, 396);
    }
}