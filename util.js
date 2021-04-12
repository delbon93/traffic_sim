
function disableContextMenu() {
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}

function drawArrow(fromNode, toNode) {
    strokeWeight(2);

    let headAngle = QUARTER_PI / 3;
    let headLength = 12;
    let margin = 5;

    blendMode(EXCLUSION);

    let dir = p5.Vector.sub(toNode.pos, fromNode.pos);
    dir.normalize();
    let p1 = p5.Vector.add(fromNode.pos, p5.Vector.mult(dir, Node.RADIUS + margin));
    let p2 = p5.Vector.sub(toNode.pos, p5.Vector.mult(dir, Node.RADIUS + margin));
    line(p1.x, p1.y, p2.x, p2.y);
    dir.rotate(headAngle);
    p1 = p5.Vector.sub(toNode.pos, p5.Vector.mult(dir, headLength + margin));
    line(p1.x, p1.y, p2.x, p2.y);
    dir.rotate(-2 * headAngle);
    p1 = p5.Vector.sub(toNode.pos, p5.Vector.mult(dir, headLength + margin));
    line(p1.x, p1.y, p2.x, p2.y);

    blendMode(BLEND);

    strokeWeight(1);
}
