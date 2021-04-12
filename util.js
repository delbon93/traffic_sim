
function disableContextMenu() {
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}

function drawArrow(from, to, margin, baseLength = 0) {
    strokeWeight(2);

    let headAngle = QUARTER_PI / 3;
    let headLength = 12;

    blendMode(EXCLUSION);

    let dir = p5.Vector.sub(to, from);
    dir.normalize();

    
    let p1 = p5.Vector.add(from, p5.Vector.mult(dir, margin));
    let p2 = p5.Vector.sub(to, p5.Vector.mult(dir, margin));
    
    let right = createVector(dir.x, dir.y);
    right.rotate(HALF_PI);
    let baseLeft = p5.Vector.sub(p1, p5.Vector.mult(right, baseLength / 2));
    let baseRight = p5.Vector.add(p1, p5.Vector.mult(right, baseLength / 2));
    line(baseLeft.x, baseLeft.y, baseRight.x, baseRight.y);

    line(p1.x, p1.y, p2.x, p2.y);
    dir.rotate(headAngle);
    p1 = p5.Vector.sub(to, p5.Vector.mult(dir, headLength + margin));
    line(p1.x, p1.y, p2.x, p2.y);
    dir.rotate(-2 * headAngle);
    p1 = p5.Vector.sub(to, p5.Vector.mult(dir, headLength + margin));
    line(p1.x, p1.y, p2.x, p2.y);

    blendMode(BLEND);

    strokeWeight(1);
}

function getRandomArrayItem(array) {
    return array[Math.floor((Math.random()*array.length))];
}