class Pad {
    id : string;
    x : number;
    y : number;
    diameter : number;
}

let pads: Pad[] = [
    {id: 'A1', x: 10, y: 10, diameter: 2.54},
    {id: 'A2', x: 10, y: 20, diameter: 2.54},
    {id: 'B1', x: 20, y: 10, diameter: 2.54},
    {id: 'B2', x: 20, y: 20, diameter: 2.54},
];

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'green';

// Make things bigger so we can see them
ctx.scale(5, 5);

// Draw all the pads
for (let pad of pads) {
    ctx.fillRect(pad.x, pad.y, pad.diameter, pad.diameter);
}

var mouseStart = undefined;

// Hook the mouse events to draw wires
canvas.onmousedown = function(e) {
    console.log("mousedown", e.x, e.y);
    mouseStart = { x: e.x, y: e.y };
}

canvas.onmousemove = function(e) {
    if (mouseStart) {
        console.log("mousemove", e.x, e.y);
    }
}
canvas.onmouseup = function(e) {
    mouseStart = undefined;
}
