# traffic_sim
A simple agent based traffic simulation using Javascript and p5.js

[Click here](https://delbon93.github.io/traffic_sim/index.html) to try it in your browser!

## Current features

This simulation is based on a directed graph, with edges being connections agents can move along. Nodes are considered
simple path nodes if they have at most one outgoing connection. In this case, that node is represented by a circle and
it and its outgoing connection are colored red.
If the node has at least two connections, it turns green and is represented by a square. It is now considered a control node, because these nodes 
will (at some point ;]) employ more sophisticated flow control mechanisms, this is where actual pathfinding will happen.

Nodes can block incoming connections. If a node is blocking, it turns yellow regardless of its type (it will still keep its
shape) and no agent can start moving along its ingoing connections. The arrow representing the connection(s) towards this node
will also display a line at their base to emphasize the fact that no agent can move past this line while it is blocked.

Agents will spawn and have a random node set as their first destination. Agents will travel towards their current
destination. Currently there is no real pathfinding, so whenever an agent reaches its target node, it will choose
any unblocked outgoing connection as its next target. If all outgoing connections are blocked, it will wait until
a free connection becomes available.

While travelling towards a node, the agent reserves this connection. A connection turns blue while it is reserved. When
deciding on a new path, agents will consider reserved connections as blocked. The reservation is removed once the
reserving agent starts moving along another connection. This way collisions can be avoided.

If at any point the node which an agent consideres its target gets deleted, the agent will consider the nearest node to
be the new target.

Nodes can also be deferred nodes, indicated by a yellow outline. Deferred nodes behave differently when it comes to
reservations and blocking:
>A deferred node is considered blocked not only if its own block state is set (fully yellow), but also if ALL of the
nodes it has outgoing connections to are blocked aswell. These nodes can be deferred themselves, so you can create
a chain of deferred nodes. This allows entire path segments consisting of multiple nodes in a row to be blocked if the
furthermost non-deferred node is blocked. Note that "blocked" in this sense also includes reservations by default.
>Additionally, if a deferred block is being reserved by an agent, this reservation too is carried ahead to the next node.
If this node also is deferred it again reserves the next node and so forth. This continues until either a non-deferred
node is reached (that node however will then still be reserved) or until a node branches of in multiple directions (that
node too will be reserved). This allows agents to reserve an entire multi-segment path


## Controls

Left click on a node to drag out a new connected node. Drag it onto an existing node to create 
a connection to that node instead.
Simply clicking onto a connection inserts a node into the path. If you keep dragging out, you can draw out
a new node or connection, just like dragging out from a node.
A new node can be dragged onto a connection too. This also inserts a node into the path at that point and
then creates a connection to it.

Hold shift and left click a node to just move it around.

Hold control and left click anywhere in open space to create a new node without any connections.

Right click a node or connection to delete it. Right click and drag anywhere to delete multiple nodes at once.

Middle click on a node to block or free its ingoing connections.
Hold shift and middle click on a node to toggle all outgoing connections as blocked instead (it actually toggles the
blocking state of all nodes this node has outgoing connections to).

Hover over a node and press 'd' to toggle this node being deferred.