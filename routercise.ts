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
    padIndexes : number[];

    bind(bindPads: Pad[]) {
        for (let padIndex of this.padIndexes) {
            this.pads.push(bindPads[padIndex]);
        }
    }

    public constructor(name: string, padIndexes: number[]) {
        this.name = name;
        this.pads = [];
        this.padIndexes = padIndexes;
    }
}

class Level {
    pads: Pad[];
    nets: Net[];
    traceWidth: number;
    helptext: string;

    private bind() {
        for (let net of this.nets) {
            net.bind(this.pads);
        }
    }

    public constructor(pads: Pad[], nets: Net[], traceWidth: number, helptext: string) {
        this.pads = pads;
        this.nets = nets;
        this.traceWidth = traceWidth;
        this.helptext = helptext;
        this.bind();
    }
}

const levels: Level[] = [
    new Level([
        {id: 'A1', x: 10, y: 10, diameter: 2.54},
        {id: 'A2', x: 10, y: 20, diameter: 2.54},
        ], [
        new Net('A', [0, 1]),
        ], 0.5, "<p>Here's an easy one. Connect the dots.</p>"),
    new Level([
        {id: 'A1', x: 10, y: 10, diameter: 2.54},
        {id: 'A2', x: 10, y: 20, diameter: 2.54},
        {id: 'B1', x: 20, y: 10, diameter: 2.54},
        {id: 'B2', x: 20, y: 20, diameter: 2.54},
        ], [
        new Net('A', [0, 1]),
        new Net('B', [2, 3]),
        ], 0.5, "<p>OK, fine, try this one. Two pairs of dots.</p>"),
    new Level([
        {id: 'A1', x: 10, y: 10, diameter: 2.54},
        {id: 'A2', x: 10, y: 20, diameter: 2.54},
        {id: 'B1', x: 20, y: 10, diameter: 2.54},
        {id: 'B2', x: 20, y: 20, diameter: 2.54},
        ], [
        new Net('A', [0, 3]),
        new Net('B', [1, 2]),
        ], 0.5, "<p>Hey, wait, now they cross...</p>"),
    new Level([
        {id: 'A2', x: 10 + (0 * 1.27), y: 10 + (0 * 1.27), diameter: 0.787},
        {id: 'A1', x: 10 + (0 * 1.27), y: 10 + (1 * 1.27), diameter: 0.787},
        {id: 'A4', x: 10 + (1 * 1.27), y: 10 + (0 * 1.27), diameter: 0.787},
        {id: 'A3', x: 10 + (1 * 1.27), y: 10 + (1 * 1.27), diameter: 0.787},
        {id: 'A6', x: 10 + (2 * 1.27), y: 10 + (0 * 1.27), diameter: 0.787},
        {id: 'A5', x: 10 + (2 * 1.27), y: 10 + (1 * 1.27), diameter: 0.787},
        {id: 'B2', x: 15 + (0 * 1.27), y: 15 + (0 * 1.27), diameter: 0.787},
        {id: 'B1', x: 15 + (1 * 1.27), y: 15 + (0 * 1.27), diameter: 0.787},
        {id: 'B4', x: 15 + (0 * 1.27), y: 15 + (1 * 1.27), diameter: 0.787},
        {id: 'B3', x: 15 + (1 * 1.27), y: 15 + (1 * 1.27), diameter: 0.787},
        {id: 'B6', x: 15 + (0 * 1.27), y: 15 + (2 * 1.27), diameter: 0.787},
        {id: 'B5', x: 15 + (1 * 1.27), y: 15 + (2 * 1.27), diameter: 0.787},
        ], [
        new Net('A', [0, 6]),
        new Net('B', [1, 7]),
        new Net('C', [2, 8]),
        new Net('D', [3, 9]),
        new Net('E', [4, 10]),
        new Net('F', [5, 11]),
        ], 0.254, "<p>Welcome to the real world.</p>"),
];

let levelNumber: number = 0;

let pads: Pad[] = [];

let nets: Net[] = [];

let wires: Wire[] = [];

const svg = <SVGSVGElement> <any> document.getElementById("svg");
const parentG = <SVGGElement> svg.getElementsByTagName("g")[0];

let traceWidth: number;

let padUIElements: SVGElement[] = [];

function clearG() {
    while (parentG.firstChild) {
        parentG.removeChild(parentG.firstChild);
    }
    padUIElements = [];
}

function drawPads() {
    // Draw all the pads
    for (let pad of pads) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(pad.x));
        circle.setAttribute("cy", String(pad.y));
        circle.setAttribute("r", String(pad.diameter / 2));
        parentG.appendChild(circle);
        padUIElements.push(circle);
    }
}

function addAirwire(x1: number, y1: number, x2: number, y2: number) {
    const airwire = document.createElementNS("http://www.w3.org/2000/svg", "line");
    airwire.setAttribute("x1", String(x1));
    airwire.setAttribute("y1", String(y1));
    airwire.setAttribute("x2", String(x2));
    airwire.setAttribute("y2", String(y2));
    airwire.classList.add("airwire");
    parentG.appendChild(airwire);
}

function clearAirwires() {
    // Clear any existing airwires
    let airwires = parentG.getElementsByClassName('airwire');

    while(airwires[0]) {
        airwires[0].parentNode.removeChild(airwires[0]);
    }​
}

function isPadConnected(pad: Pad) : boolean{
    return !padUIElements[pads.indexOf(pad)].classList.contains("drcerror");
}

function findClosestPad(pad: Pad, pads: Pad[]) : Pad {
    let closestPad: Pad;
    let closestPadDistance: number = undefined;

    // Draw a line from this pad to the closest other pad
    for (let innerPad of pads) {
        const padDistance = Math.sqrt(
            Math.pow(pad.x - innerPad.x, 2) +
            Math.pow(pad.y - innerPad.y, 2)
            );

        if ((pad != innerPad) && ((closestPadDistance == undefined) || (padDistance < closestPadDistance))) {
            closestPadDistance = padDistance;
            closestPad = innerPad;
        }
    }

    return closestPad;
}

function updateAirwires() {
    clearAirwires();

    // Draw all the airwires
    for (let net of nets) {
        for (let pad of net.pads) {
            if (isPadConnected(pad)) {
                // This pad is cool, no airwire needed for him
                continue;
            }

            let closestPad = findClosestPad(pad, net.pads);
            addAirwire(pad.x, pad.y, closestPad.x, closestPad.y);
        }
    }
}

function startCurrentLevel() {
    console.log("Starting level", JSON.stringify(levels[levelNumber]));
    pads = levels[levelNumber].pads;
    nets = levels[levelNumber].nets;
    traceWidth = levels[levelNumber].traceWidth;
    document.getElementById("helptext").innerHTML = levels[levelNumber].helptext;

    wires = [];

    clearG();
    drawPads();
    checkEverything();
}

function advanceToNextLevel() {
    // All done with level
    console.log("Solution was", JSON.stringify(wires));
    ++levelNumber;
    startCurrentLevel();
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
        ((p0_x == p3_x) && (p0_y == p3_y)) ||
        ((p1_x == p2_x) && (p1_y == p2_y)) ||
        ((p1_x == p3_x) && (p1_y == p3_y))
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

function clearBadPads() {
    for (let pad of padUIElements) {
        pad.classList.remove("drcerror");
    }
}

function setPadsBad(parr: Pad[]) {
    for (let p of parr) {
        padUIElements[pads.indexOf(p)].classList.add("drcerror");
    }
}

function checkEverything() {
    let wireNets: Wire[][] = [];
    let bad = false;

    clearBadPads();

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
                    setPadsBad([pad]);
                    bad = true;
                }
            }
            foundHome = (foundHome || thisNetStatus);

            if (thisNetStatus) {
                // Make sure some other net didn't grab this
                if (usedWireNets.indexOf(wireNet) != -1) {
                    console.log("Wire net used more than once!");
                    setPadsBad(net.pads);
                    bad = true;
                }
                else {
                    usedWireNets.push(wireNet);
                }
            }
        }

        if (!foundHome) {
            console.log(net, "is homeless");
            setPadsBad(net.pads);
            bad = true;
        }
    }
    console.log(bad ? "It was bad, sorry" : "It was good!");
    updateAirwires();
    return !bad;
}

var currentLine: SVGLineElement;
var currentWire: Wire;
var lastPoint: DOMPoint;

// Hook the mouse events to draw wires
svg.onmousemove = function(e) {
    if (currentLine) {
        let mouseEnd = gridCoordinate(getCoordinates(e));
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

const grid = { x: 0.1, y: 0.1 };

function gridCoordinate(p: DOMPoint) : DOMPoint {
    let coord = svg.createSVGPoint();
    coord.x = Math.round(p.x / grid.x) * grid.x;
    coord.y = Math.round(p.y / grid.y) * grid.y;

    return coord;
}

function maybeCommitCurrentLine() {
    if (currentLine) {
        currentLine.classList.remove("target");
        lastPoint = undefined;
        currentLine = undefined;
        currentWire = undefined;
    }
}

svg.onmouseup = function(e) {
    const mouseStart = gridCoordinate(getCoordinates(e));
    if ((lastPoint) && (mouseStart.x == lastPoint.x) && (mouseStart.y == lastPoint.y)) {
        maybeTerminateLineDrawing()
    }
    else {
        maybeCommitCurrentLine();
        if (checkEverything()) {
            advanceToNextLevel();
        }
        else {
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
            currentWire.width = traceWidth;
            currentLine.classList.add("target");
            // currentLine.setAttribute("class", "target");
            parentG.appendChild(currentLine);
            wires.push(currentWire);
        }
    }
}

startCurrentLevel();
