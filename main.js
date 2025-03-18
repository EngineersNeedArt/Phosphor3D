// main.js (Grok 3 optimized)

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

window.addEventListener('resize', () => {
    resize();
    phosphor.draw();
});