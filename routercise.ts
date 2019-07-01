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

var traceWidth = 0.5;

// Draw all the pads
for (let pad of pads) {
    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(pad.x));
    circle.setAttribute("cy", String(pad.y));
    circle.setAttribute("r", String(pad.diameter / 2));
    parentG.appendChild(circle);
}

function getCoordinates(e: MouseEvent) {
    let coord = svg.createSVGPoint();
    coord.x = e.x;
    coord.y = e.y;
    return coord.matrixTransform(parentG.getScreenCTM().inverse());
}

var currentLine: SVGLineElement;
var lastPoint: DOMPoint;

// Hook the mouse events to draw wires
svg.onmousemove = function(e) {
    if (currentLine) {
        let mouseEnd = getCoordinates(e);
        currentLine.setAttribute("x2", String(mouseEnd.x));
        currentLine.setAttribute("y2", String(mouseEnd.y));
        }
}

function maybeTerminateLineDrawing() {
    // Delete the current line
    parentG.removeChild(currentLine);
    // All done drawing now
    lastPoint = undefined;
    currentLine = undefined;
}

window.onkeydown = function(e: KeyboardEvent) {
    if (e.keyCode == 27) {
        console.log("Escape!");
        maybeTerminateLineDrawing();
    }
}

svg.onmouseup = function(e) {
    const mouseStart = getCoordinates(e);
    if ((lastPoint) && (mouseStart.x == lastPoint.x) && (mouseStart.y == lastPoint.y)) {
        maybeTerminateLineDrawing()
    }
    else {
        lastPoint = mouseStart;
        currentLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        currentLine.setAttribute("x1", String(mouseStart.x));
        currentLine.setAttribute("y1", String(mouseStart.y));
        currentLine.setAttribute("x2", String(mouseStart.x));
        currentLine.setAttribute("y2", String(mouseStart.y));
        currentLine.setAttribute("stroke", "black");
        currentLine.setAttribute("stroke-linecap", "round");
        currentLine.setAttribute("stroke-width", String(traceWidth));
        parentG.appendChild(currentLine);
    }
}
