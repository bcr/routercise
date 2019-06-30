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
