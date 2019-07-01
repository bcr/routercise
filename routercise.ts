class Pad {
    id : string;
    x : number;
    y : number;
    diameter : number;
}

class Wire {
    x1 : number;
    y1 : number;
    x2 : number;
    y2 : number;
    width : number;
}

let pads: Pad[] = [
    {id: 'A1', x: 10, y: 10, diameter: 2.54},
    {id: 'A2', x: 10, y: 20, diameter: 2.54},
    {id: 'B1', x: 20, y: 10, diameter: 2.54},
    {id: 'B2', x: 20, y: 20, diameter: 2.54},
];

let wires: Wire[] = [];

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

// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
// Adapted from: http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    // If any of the endpoints are the same, they intersect

    if (
        ((p0_x == p2_x) && (p0_y == p2_y)) ||
        ((p0_x == p3_x) && (p3_y == p2_y)) ||
        ((p1_x == p2_x) && (p1_y == p2_y)) ||
        ((p1_x == p3_x) && (p1_y == p2_y))
    ) {
        return true;
    }

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return 1;
    }

    return 0; // No collision
}

function wiresIntersect(a: Wire, b: Wire) : boolean {
    const result = line_intersects(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2);
    if (result) {
        console.log(a, b, "intersect");
    }
    else {
        console.log(a, b, "DO NOT intersect");
    }

    return result ? true : false;
}

function checkEverything() {
    let wireNets: Wire[][] = [];

    for (let wire of wires) {
        let currentNet: Wire[] = [];
        for (let wireNet of wireNets)
        {
            if (wireNet.indexOf(wire) != -1) {
                currentNet = wireNet;
                break;
            }
        }

        if (currentNet.length == 0) {
            wireNets.push(currentNet);
        }

        for (let innerWire of wires) {
            if ((currentNet.indexOf(innerWire) == -1) && (wiresIntersect(wire, innerWire))) {
                currentNet.push(innerWire);
            }
        }
    }

    console.log(wireNets);

    // let nets = [];
    // for (let pad of pads) {
    //     let net: Pad[] = [];
    //     net.push(pad);

    //     for (let wire of wires) {

    //     }
    // }
}

var currentLine: SVGLineElement;
var currentWire: Wire;
var lastPoint: DOMPoint;

// Hook the mouse events to draw wires
svg.onmousemove = function(e) {
    if (currentLine) {
        let mouseEnd = getCoordinates(e);
        currentLine.setAttribute("x2", String(mouseEnd.x));
        currentWire.x2 = mouseEnd.x;
        currentLine.setAttribute("y2", String(mouseEnd.y));
        currentWire.y2 = mouseEnd.y;
        }
}

function maybeTerminateLineDrawing() {
    if (currentLine) {
        // Delete the current line
        parentG.removeChild(currentLine);
        wires.pop();
        // All done drawing now
        lastPoint = undefined;
        currentLine = undefined;
        currentWire = undefined;
    }
}

window.onkeydown = function(e: KeyboardEvent) {
    if (e.keyCode == 27) {
        // Escape pressed
        maybeTerminateLineDrawing();
    } else if (e.key == 'c') {
        // Letter C pressed
        console.log("C is for character");
        checkEverything();
    }
}

svg.onmouseup = function(e) {
    const mouseStart = getCoordinates(e);
    if ((lastPoint) && (mouseStart.x == lastPoint.x) && (mouseStart.y == lastPoint.y)) {
        maybeTerminateLineDrawing()
    }
    else {
        if (currentLine) {
            currentLine.classList.remove("target");
        }
        lastPoint = mouseStart;
        currentLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        currentWire = new Wire();
        currentLine.setAttribute("x1", String(mouseStart.x));
        currentWire.x1 = mouseStart.x;
        currentLine.setAttribute("y1", String(mouseStart.y));
        currentWire.y1 = mouseStart.y;
        currentLine.setAttribute("x2", String(mouseStart.x));
        currentWire.x2 = mouseStart.x;
        currentLine.setAttribute("y2", String(mouseStart.y));
        currentWire.y2 = mouseStart.y;
        currentLine.setAttribute("stroke", "black");
        currentLine.setAttribute("stroke-linecap", "round");
        currentLine.setAttribute("stroke-width", String(traceWidth));
        currentLine.classList.add("target");
        // currentLine.setAttribute("class", "target");
        parentG.appendChild(currentLine);
        wires.push(currentWire);
    }
}
