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

const svg = document.getElementById("svg");
// svg.setAttribute('transform','scale(5, 5)');

// Draw all the pads
for (let pad of pads) {
    let circle = <SVGCircleElement> document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(pad.x));
    circle.setAttribute("cy", String(pad.y));
    circle.setAttribute("r", String(pad.diameter / 2));
    svg.appendChild(circle);
}

var mouseStart = undefined;

// Hook the mouse events to draw wires
svg.onmousedown = function(e) {
    console.log("mousedown", e.x, e.y);
    mouseStart = { x: e.x, y: e.y };
}

svg.onmousemove = function(e) {
    if (mouseStart) {
        console.log("mousemove", e.x, e.y);
    }
}
svg.onmouseup = function(e) {
    mouseStart = undefined;
}
