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

class Net {
    name : string;
    pads : Pad[];
}

let pads: Pad[] = [
    {id: 'A1', x: 10, y: 10, diameter: 2.54},
    {id: 'A2', x: 10, y: 20, diameter: 2.54},
    {id: 'B1', x: 20, y: 10, diameter: 2.54},
    {id: 'B2', x: 20, y: 20, diameter: 2.54},
];

let nets: Net[] = [
    { name: 'A', pads: [pads[0], pads[1]] },
    { name: 'B', pads: [pads[2], pads[3]] },
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

// Draw all the airwires
for (let net of nets) {
    for (let pad of net.pads) {
        let closestPad: Pad;
        let closestPadDistance: number = undefined;

        // Draw a line from this pad to the closest other pad
        for (let innerPad of net.pads) {
            const padDistance = Math.sqrt(
                Math.pow(pad.x - innerPad.x, 2) +
                Math.pow(pad.y - innerPad.y, 2)
                );

            if ((pad != innerPad) && ((closestPadDistance == undefined) || (padDistance < closestPadDistance))) {
                closestPadDistance = padDistance;
                closestPad = innerPad;
            }
        }

        const airwire = document.createElementNS("http://www.w3.org/2000/svg", "line");
        airwire.setAttribute("x1", String(pad.x));
        airwire.setAttribute("y1", String(pad.y));
        airwire.setAttribute("x2", String(closestPad.x));
        airwire.setAttribute("y2", String(closestPad.y));
        airwire.classList.add("airwire");
        parentG.appendChild(airwire);
    }
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

    return result ? true : false;
}

function padIntersectsWire(a: Pad, b: Wire) : boolean {
    // !!! Cheating
    // If either end of the wire is in the pad, they touch

    const padMinX = a.x - (a.diameter / 2);
    const padMaxX = a.x + (a.diameter / 2);
    const padMinY = a.y - (a.diameter / 2);
    const padMaxY = a.y + (a.diameter / 2);

    let result =  ((b.x1 >= padMinX) && (b.x1 <= padMaxX) && (b.y1 >= padMinY) && (b.y1 <= padMaxY)) ||
            ((b.x2 >= padMinX) && (b.x2 <= padMaxX) && (b.y2 >= padMinY) && (b.y2 <= padMaxY))
    // console.log(a, (result ? "intersects" : "does not intersect"), b);
    return result;
}

function buildConnectedWires(wire: Wire, currentNet: Wire[]) {
    if (currentNet.indexOf(wire) == -1) {
        currentNet.push(wire);
    }

    for (let innerWire of wires) {
        if ((currentNet.indexOf(innerWire) == -1) && (wiresIntersect(wire, innerWire))) {
            buildConnectedWires(innerWire, currentNet);
        }
    }
}

function checkEverything() {
    let wireNets: Wire[][] = [];
    let bad = false;

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
            buildConnectedWires(wire, currentNet);
        }
    }

    let usedWireNets: Wire[][] = [];

    for (let net of nets) {
        let foundHome = false;
        for (let wireNet of wireNets) {
            let thisNetStatus = undefined;
            for (let pad of net.pads) {
                let thisPadStatus = false;
                for (let wire of wireNet) {
                    // See if we touch any wire
                    if (padIntersectsWire(pad, wire)) {
                        thisPadStatus = true;
                        break;
                    }
                }

                if ((thisNetStatus == undefined) || (thisPadStatus == thisNetStatus)) {
                    thisNetStatus = thisPadStatus;
                }
                else {
                    // Pad doesn't match net status man
                    console.log(pad, "does not match status man");
                    bad = true;
                }
            }
            foundHome = (foundHome || thisNetStatus);

            if (thisNetStatus) {
                // Make sure some other net didn't grab this
                if (usedWireNets.indexOf(wireNet) != -1) {
                    console.log("Wire net used more than once!");
                    bad = true;
                }
                else {
                    usedWireNets.push(wireNet);
                }
            }
        }

        if (!foundHome) {
            console.log(net, "is homeless");
            bad = true;
        }
    }
    console.log(bad ? "It was bad, sorry" : "It was good!");
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
