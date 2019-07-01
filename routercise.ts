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

const svg = <SVGSVGElement> <any> document.getElementById("svg");
const parentG = <SVGGElement> svg.getElementsByTagName("g")[0];

// Draw all the pads
for (let pad of pads) {
    let circle = <SVGCircleElement> document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(pad.x));
    circle.setAttribute("cy", String(pad.y));
    circle.setAttribute("r", String(pad.diameter / 2));
    parentG.appendChild(circle);
}

var mouseStart = undefined;

// Hook the mouse events to draw wires
svg.onmousedown = function(e) {
    mouseStart = svg.createSVGPoint();
    mouseStart.x = e.x;
    mouseStart.y = e.y;
    mouseStart = mouseStart.matrixTransform(parentG.getScreenCTM().inverse());
    console.log("mousedown", mouseStart.x, mouseStart.y);
}

svg.onmousemove = function(e) {
    if (mouseStart) {
        let mouseEnd = svg.createSVGPoint();
        mouseEnd.x = e.x;
        mouseEnd.y = e.y;
        mouseEnd = mouseEnd.matrixTransform(parentG.getScreenCTM().inverse());
        console.log("mousedown", mouseEnd.x, mouseEnd.y);
    }
}

svg.onmouseup = function(e) {
    mouseStart = undefined;
}
