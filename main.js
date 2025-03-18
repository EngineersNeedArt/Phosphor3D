// main.js

import { Phosphor3D } from './phosphor3D.js';

const phosphor = new Phosphor3D();
const canvasElement = document.getElementById('myCanvas');
resize();
phosphor.init(canvasElement);
phosphor.begin();

function resize() {
	canvasElement.width = window.innerWidth;
	canvasElement.height = window.innerHeight - 160;
}

function windowDidResize() {
	resize();
	phosphor.draw();
}

// Resize the canvas when the window is resized
window.addEventListener('resize', windowDidResize);
