# Routercise

## Chit-Chat

### 2019-06-30

I want to make a system for learning routing in PCB designs. The idea is present incrementally harder routing scenarios and then see if you can devise a solution.

Considering that we have:

* "Layers" (independent layers for routing)
* "Vias" (inter-layer conductive connections)
* "Pads" (interconnection points)
* "Parts" (groups of pads)
* "Nets" (lists of electrically connected pads)
* "Wires" or "Traces" (conductive traces added to satisfy the nets)

There are some real-world constraints that are part of this, which can be introduced selectively:

* Interconnection of nets. Probably uniformly disallowed. No touching traces or pads for other nets.
* Movement of parts. This includes rotation and translation. Some parts cannot be moved due to mechanical limitations.
* Number of layers.
* Trace width.
* Trace / space constraints.
* Number of vias.
* Annular ring size.
* Drill size.
* Keepouts.
* Board shape / drills / cutouts.
* Pad / trace proximity to board edge / drills / cutouts.

A first set of user operations might be:

* Draw a wire from here to here
* Remove this wire
* Translate this part
* Rotate this part
* Undo stack

Units are integers in nm (nanometers) -- the rationale for this is .00001 (1E-05) inches = 254nm, and a 32 bit signed integer representation of nanometers would be 2147483647 m = 2.1 m which is plenty big with plenty of precision.
