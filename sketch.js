"use strict";

let drawables = [];

let fps_values = [];

let graph;
let agents = [];
let switches = [];

let spawningNode = null;
let draggedNode = null;
let isRepositioning = false;
let deleteBoxOrigin = null;
let nodeCollisionInfo;
let edgeCollisionInfo;

let __testSwitch;

let isSelectingNode = () => nodeCollisionInfo.distance < (PathNode.RADIUS * 2 + 5);
let isSelectingEdge = () => edgeCollisionInfo.hit;

function getAllNodesInDeleteBox() {
    if (deleteBoxOrigin === null) return [];
    let x0 = min(deleteBoxOrigin.x, mouseX);
    let y0 = min(deleteBoxOrigin.y, mouseY);
    let x1 = max(deleteBoxOrigin.x, mouseX);
    let y1 = max(deleteBoxOrigin.y, mouseY);
    return graph.getNodesInRect(x0, y0, x1, y1);
}

function constructNode(x, y, inGraph = true) {
    let node = new PathNode(x, y);
    if (inGraph) graph.addNode(node);
    node.collider = createCircleCollider(node, PathNode.RADIUS * 2 + 5);
    node.onPressedListener = function(event) {
        if (!node.collider.hit(event.x, event.y)) return false;

        if (event.mButtons.left) {
            if (event.modKeys.shift) {
                isRepositioning = true;
                draggedNode = node;
                node.dragged = true;
            }
            else {
                createGhostNode(event.x, event.y, node);
            }
            return true;
        }

        if (event.mButtons.middle) {
            if (event.modKeys.shift) {
                node.out.forEach(next => {
                    next.blocked = !next.blocked;
                });
            }
            else {
                node.blocked = !node.blocked;
            }
            return true;
        }

        if (event.mButtons.right) {
            destructNode(node);
            return true;
        }
        return false;
    };
    INPUT_EVENT_MANAGER.subscribe(MousePressedEvent, node.onPressedListener);
    node.onDraggedListener = function(event) {
        if (!node.dragged) return false;
        node.pos = createVector(event.x, event.y);
        return true;
    };
    INPUT_EVENT_MANAGER.subscribe(MouseDraggedEvent, node.onDraggedListener);
    node.onReleasedListener = function(event) {
        if (node.dragged) {
            node.dragged = false;
            draggedNode = null
            return true;
        }
        return false;
    };
    INPUT_EVENT_MANAGER.subscribe(MouseReleasedEvent, node.onReleasedListener);
    return node;
}

function destructNode(node) {
    graph.deleteNode(node);
    INPUT_EVENT_MANAGER.unsubscribe(node.onPressedListener);
    INPUT_EVENT_MANAGER.unsubscribe(node.onDraggedListener);
    INPUT_EVENT_MANAGER.unsubscribe(node.onReleasedListener);
}

function createGraph() {
    graph = new Graph();
    drawables.push(graph);
    let radius = 300;
    let outerRadius = 340;
    let resolution = 20;
    let origin = createVector(640, 450);

    let angleStep = TWO_PI / resolution;
    let pointer = createVector(radius, 0);
    let outerPointer = createVector(outerRadius, 0);
    let outerOffset = angleStep / 2;
    outerPointer.rotate(outerOffset);
    let innerNodes = [], outerNodes = [];

    for (let i = 0; i < resolution; i++) {
        // inner ring
        let pos = p5.Vector.add(origin, pointer);
        let node = constructNode(pos.x, pos.y);
        innerNodes.push(node);
        if (innerNodes.length > 1) {
            innerNodes[innerNodes.length - 2].addBranch(node);
        }
        pointer.rotate(angleStep);

        // outer ring
        pos = p5.Vector.add(origin, outerPointer);
        node = constructNode(pos.x, pos.y);
        outerNodes.push(node);
        if (outerNodes.length > 1) {
            outerNodes[outerNodes.length - 2].addBranch(node);
        }
        outerPointer.rotate(-angleStep);
    }
    innerNodes[innerNodes.length - 1].addBranch(innerNodes[0]);
    outerNodes[outerNodes.length - 1].addBranch(outerNodes[0]);
}

function createAgents() {
    for (let i = 0; i < 30; i++) {
        let agent = new TrafficAgent(640, 450, graph);
        agent.vmax = Math.random() * 50 + 75;
        agent.col = randomShadeOfBlue();
        agent.setTarget(getRandomArrayItem(graph.nodes));
        agent.pos = createVector(agent.targetNode.pos.x, agent.targetNode.pos.y);
        agents.push(agent);
        drawables.push(agent);
    }
}

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    disableContextMenu();

    createGraph();
    createAgents();

    __testSwitch = new Switch(CENTER_X, CENTER_Y);
    for(let i = 0; i < 3; i++) {
        __testSwitch.addNode(getRandomArrayItem(graph.nodes));
    }
    drawables.push(__testSwitch);
    switches.push(__testSwitch);

    console.log("Nodes: " + graph.nodes.length, "Agents: " + agents.length);
}

function draw() {
    frameRate(60);
    background(24);

    // Draw the ghost node and the ghost arrow pointing to it
    if (draggedNode != null) {
        draggedNode.draw();
        if (spawningNode != null) {
            stroke(100, 100, 100);
            drawArrow(spawningNode.pos, draggedNode.pos, PathNode.RADIUS + 5);
        }
    }

    // Draw the delete box if it exists
    if (deleteBoxOrigin != null) {
        fill(255, 0, 0, 30); stroke(255, 0, 0);
        rectMode(CORNER); rect(deleteBoxOrigin.x, deleteBoxOrigin.y, mouseX - deleteBoxOrigin.x, mouseY - deleteBoxOrigin.y);
    }

    // If there is a delete box, highlight all nodes that will be deleted once released
    getAllNodesInDeleteBox().forEach(node => {
        noFill(); stroke(255, 0, 0);
        circle(node.pos.x, node.pos.y, PathNode.RADIUS * 2 + 5);
    });

    // Determine if the mouse is close enough to a node to interact with
    nodeCollisionInfo = graph.getClosestNodeTo(mouseX, mouseY);
    if (isSelectingNode()) {
        noFill(); stroke(200, 200, 200);
        circle(nodeCollisionInfo.node.pos.x, nodeCollisionInfo.node.pos.y, PathNode.RADIUS * 2 + 5);
    }

    // Determine if the mouse is on an edge
    edgeCollisionInfo = getEdgeCollision(graph, mouseX, mouseY, 10, PathNode.RADIUS * 6);
    if (isSelectingEdge()) {
        noStroke(); fill(255, 255, 255, 200); ellipseMode(CENTER);
        ellipse(edgeCollisionInfo.closestPoint.x, edgeCollisionInfo.closestPoint.y, 10, 10);
    }

    // Update agents
    agents.forEach(agent => {
        agent.update(deltaTime);
    });
    
    // Draw stuff
    drawables.forEach(drawable => {
        drawable.draw();
    });

    // DEBUG: draw delta time
    fill(230); stroke(230); textSize(16); 
    text("frame time: " + str(deltaTime) + "ms", 40, 40); 
    let fps = 1/(deltaTime / 1000);
    fps_values.push(fps);
    if (fps_values.length > 180) fps_values.shift();
    fps = round(average(fps_values));
    text("fps: " + str(fps), 40, 60);
}

function createGhostNode(x, y, originNode) {
    draggedNode = constructNode(x, y, false);
    draggedNode.dragged = true;
    draggedNode.__debug_id = -1;
    spawningNode = originNode;
}

function keyPressed() {
    if (isSelectingNode() && key === "d") {
        nodeCollisionInfo.node.deferred = !nodeCollisionInfo.node.deferred;
    }
}

function mousePressed() {
    INPUT_EVENT_MANAGER.raise(MousePressedEvent(mouseX, mouseY,
        {left: mouseButton === LEFT, right: mouseButton === RIGHT, middle: mouseButton === CENTER},
        {shift: keyIsDown(SHIFT), control: keyIsDown(CONTROL), alt: keyIsDown(ALT)}));

    // Are we still dragging a delete box? Then do nothing.
    if (deleteBoxOrigin != null) return;

    if (isSelectingEdge() && mouseButton === LEFT) {
        let p = edgeCollisionInfo.closestPoint;
        let inlineNode = constructNode(p.x, p.y);
        edgeCollisionInfo.fromNode.deleteBranch(edgeCollisionInfo.toNode);
        edgeCollisionInfo.fromNode.addBranch(inlineNode);
        inlineNode.addBranch(edgeCollisionInfo.toNode);
        createGhostNode(mouseX, mouseY, inlineNode);
    }
    // Right click on an edge: delete the edge
    else if (edgeCollisionInfo.hit && mouseButton === RIGHT) {
        edgeCollisionInfo.fromNode.deleteBranch(edgeCollisionInfo.toNode);
    }
    // Ctrl-Left click in open space: create a new lonely node
    else if (mouseButton === LEFT && keyIsDown(CONTROL)) {
        constructNode(mouseX, mouseY);
    }
    // Right click in open space: start selecting nodes for deletion
    else if (mouseButton === RIGHT) {
        deleteBoxOrigin = createVector(mouseX, mouseY);
    }

    switches.forEach(sw => {
        if (getSwitchCollision(sw, mouseX, mouseY)) {
            sw.press();
        }
    });
}

function mouseDragged() {
    INPUT_EVENT_MANAGER.raise(MouseDraggedEvent(mouseX, mouseY,
        {left: mouseButton === LEFT, right: mouseButton === RIGHT, middle: mouseButton === CENTER},
        {shift: keyIsDown(SHIFT), control: keyIsDown(CONTROL), alt: keyIsDown(ALT)}));
}

function mouseReleased() {
    INPUT_EVENT_MANAGER.raise(MouseReleasedEvent(mouseX, mouseY,
        {left: mouseButton === LEFT, right: mouseButton === RIGHT, middle: mouseButton === CENTER},
        {shift: keyIsDown(SHIFT), control: keyIsDown(CONTROL), alt: keyIsDown(ALT)}));

    // Are we dragging a node?
    if (draggedNode != null) {
        if (isRepositioning) {
            // If we release when dragging an existing node we just drop it
            isRepositioning = false;
        }
        else if (isSelectingNode()) {
            // If we drag a new ghost node onto an existing node  we create the connection 
            // from the spawning node to the existing node
            spawningNode.addBranch(nodeCollisionInfo.node);
        }
        else if (isSelectingEdge()) {
            // If we drag a ghost node onto an edge we create an inline node at that point
            // and create a connection from the spawning node to that inline node
            let p = edgeCollisionInfo.closestPoint;
            let inlineNode = constructNode(p.x, p.y);
            edgeCollisionInfo.fromNode.deleteBranch(edgeCollisionInfo.toNode);
            edgeCollisionInfo.fromNode.addBranch(inlineNode);
            inlineNode.addBranch(edgeCollisionInfo.toNode);
            spawningNode.addBranch(inlineNode);
        }
        else {
            // If we drag a ghost node into open space, we add it to the
            // graph as a new node and create a connection to it from
            // the spawning node
            spawningNode.addBranch(draggedNode);
            graph.addNode(draggedNode);
        }
        // In any case, after releasing we clear the cached nodes
        spawningNode = null;
        draggedNode = null;
    }
    // Are we dragging the delete box? Kill all nodes inside! >:]
    if (deleteBoxOrigin != null) {
        getAllNodesInDeleteBox().forEach(node => {
            destructNode(node);
        });
        deleteBoxOrigin = null;
    }
}

