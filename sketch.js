"use strict";

let graph;
let agents = [];

let spawningNode = null;
let draggedNode = null;
let isRepositioning = false;
let deleteBoxOrigin = null;
let closestNodeInfo;

let isHoveringOverNode = () => closestNodeInfo.distance < (PathNode.RADIUS * 2 + 5);

function getAllNodesInDeleteBox() {
    if (deleteBoxOrigin == null) return [];
    let x0 = min(deleteBoxOrigin.x, mouseX);
    let y0 = min(deleteBoxOrigin.y, mouseY);
    let x1 = max(deleteBoxOrigin.x, mouseX);
    let y1 = max(deleteBoxOrigin.y, mouseY);
    return graph.getNodesInRect(x0, y0, x1, y1);
}

function createGraph() {
    graph = new Graph();
    let radius = 300;
    let resolution = 20;
    let origin = createVector(640, 450);

    let angleStep = TWO_PI / resolution;
    let pointer = createVector(radius, 0);

    for (let i = 0; i < resolution; i++) {
        let pos = p5.Vector.add(origin, pointer);
        let node = graph.createNode(pos.x, pos.y);
        if (graph.nodes.length > 1) {
            graph.nodes[graph.nodes.length - 2].addBranch(node);
        }
        pointer.rotate(angleStep);
    }
    graph.nodes[graph.nodes.length - 1].addBranch(graph.nodes[0]);
}

function setup() {
    createCanvas(1280, 900);
    disableContextMenu();

    createGraph();

    for (let i = 0; i < 50; i++) {
        let agent = new TrafficAgent(640, 450);
        agent.vmax = Math.random() * 15 + 10;
        agent.setTarget(getRandomArrayItem(graph.nodes));
        agents.push(agent);
    }

    console.log("Nodes: " + graph.nodes.length, "Agents: " + agents.length);
}

function draw() {
    frameRate(120);
    background(24);

    graph.draw();

    if (draggedNode != null) {
        draggedNode.draw();
        if (spawningNode != null) {
            stroke(100, 100, 100);
            drawArrow(spawningNode.pos, draggedNode.pos, PathNode.RADIUS + 5);
        }
    }
    if (deleteBoxOrigin != null) {
        fill(255, 0, 0, 30); stroke(255, 0, 0);
        rectMode(CORNER); rect(deleteBoxOrigin.x, deleteBoxOrigin.y, mouseX - deleteBoxOrigin.x, mouseY - deleteBoxOrigin.y);
    }

    getAllNodesInDeleteBox().forEach(node => {
        noFill(); stroke(255, 0, 0);
        circle(node.pos.x, node.pos.y, PathNode.RADIUS * 2 + 5);
    });

    closestNodeInfo = graph.getClosestNodeTo(mouseX, mouseY);
    if (isHoveringOverNode()) {
        noFill(); stroke(200, 200, 200);
        circle(closestNodeInfo.node.pos.x, closestNodeInfo.node.pos.y, PathNode.RADIUS * 2 + 5);
    }

    agents.forEach(agent => {
        agent.update(deltaTime);
        agent.draw();
    });
}

function mousePressed() {
    if (deleteBoxOrigin != null) return;
    if (isHoveringOverNode() && mouseButton == LEFT) {
        if (keyIsDown(SHIFT)) {
            isRepositioning = true;
            draggedNode = closestNodeInfo.node;
        }
        else {
            draggedNode = new PathNode(mouseX, mouseY);
            draggedNode.__debug_id = -420;
            spawningNode = closestNodeInfo.node;
        }
    }
    else if (isHoveringOverNode() && mouseButton == CENTER) {
        closestNodeInfo.node.printDebugInfo();
    }
    else if (isHoveringOverNode() && mouseButton == RIGHT) {
        graph.deleteNode(closestNodeInfo.node);
    }
    else if (mouseButton == LEFT && keyIsDown(CONTROL)) {
        graph.createNode(mouseX, mouseY);
    }
    else if (mouseButton == RIGHT) {
        deleteBoxOrigin = createVector(mouseX, mouseY);
    }
}

function mouseDragged() {
    if (draggedNode != null) {
        draggedNode.pos = createVector(mouseX, mouseY);
    }
}

function mouseReleased() {
    if (draggedNode != null) {
        if (isRepositioning) {
            isRepositioning = false;
        }
        else if (isHoveringOverNode()) {
            if (keyIsDown(CONTROL)) {
                spawningNode.deleteBranch(closestNodeInfo.node);
            }
            else {
                spawningNode.addBranch(closestNodeInfo.node);
            }
        } 
        else {
            spawningNode.addBranch(draggedNode);
            graph.addNode(draggedNode);
        }
        draggedNode = null;
    }
    if (deleteBoxOrigin != null) {
        getAllNodesInDeleteBox().forEach(node => {
            graph.deleteNode(node);
        });
        deleteBoxOrigin = null;
    }
}

