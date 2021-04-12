"use strict";

let graph = new Graph();
let draggedNode = null;
let isRepositioning = false;
let deleteBoxOrigin = null;
let closestNodeInfo;

let isHoveringOverNode = () => closestNodeInfo.distance < (Node.RADIUS * 2 + 5);

function getAllNodesInDeleteBox() {
    if (deleteBoxOrigin == null) return [];
    let x0 = min(deleteBoxOrigin.x, mouseX);
    let y0 = min(deleteBoxOrigin.y, mouseY);
    let x1 = max(deleteBoxOrigin.x, mouseX);
    let y1 = max(deleteBoxOrigin.y, mouseY);
    return graph.getNodesInRect(x0, y0, x1, y1);
}

function setup() {
    createCanvas(1280, 900);
    disableContextMenu();
    let n1 = graph.createNode(200, 200);
    let n2 = graph.createNode(300, 400);
    let n3 = graph.createNode(400, 300);
    let n4 = graph.createNode(500, 250);
    let n5 = graph.createNode(425, 500);
    n1.addBranch(n2);
    n1.addBranch(n3);
    n3.addBranch(n2);
    n3.addBranch(n4);
    n2.next = n5;
}

function draw() {
    background(24);
    graph.draw();
    if (draggedNode != null) draggedNode.draw();
    if (deleteBoxOrigin != null) {
        fill(255, 0, 0, 30); stroke(255, 0, 0);
        rectMode(CORNER); rect(deleteBoxOrigin.x, deleteBoxOrigin.y, mouseX - deleteBoxOrigin.x, mouseY - deleteBoxOrigin.y);
    }

    getAllNodesInDeleteBox().forEach(node => {
        noFill(); stroke(255, 0, 0);
        circle(node.pos.x, node.pos.y, Node.RADIUS * 2 + 5);
    });

    closestNodeInfo = graph.getClosestNodeTo(mouseX, mouseY);
    if (isHoveringOverNode()) {
        noFill(); stroke(200, 200, 200);
        circle(closestNodeInfo.node.pos.x, closestNodeInfo.node.pos.y, Node.RADIUS * 2 + 5);
    }
}

function mousePressed() {
    if (deleteBoxOrigin != null) return;
    if (isHoveringOverNode() && mouseButton == LEFT) {
        if (keyIsDown(SHIFT)) {
            isRepositioning = true;
            draggedNode = closestNodeInfo.node;
        }
        else {
            draggedNode = new Node(mouseX, mouseY);
            draggedNode.__debug_id = -420;
            closestNodeInfo.node.addBranch(draggedNode);
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
            draggedNode.in[0].out.pop();
            if (keyIsDown(CONTROL)) {
                draggedNode.in[0].deleteBranch(closestNodeInfo.node);
            }
            else {
                draggedNode.in[0].addBranch(closestNodeInfo.node);
            }
        } 
        else {
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

