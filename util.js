
function disableContextMenu() {
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}

function drawArrow(from, to, margin, baseLength = 0, thickness = 2) {
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
    strokeWeight(thickness + 1);
    line(baseLeft.x, baseLeft.y, baseRight.x, baseRight.y);
    strokeWeight(thickness);

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

function clamp(x, lower, upper) {
    return min(max(x, lower), upper);
}

function average(array) {
    if (array.length == 0) return 0;
    let a = 0;
    array.forEach(x => {
        a += x;
    });
    return a / array.length;
}

function randomColor() {
    let variation = 180; let base = 40;
    let r = Math.random() * variation + base;
    let g = Math.random() * variation + base;
    let b = Math.random() * variation + base;
    return color(r, g, b);
}

function randomShadeOfBlue() {
    let s = Math.random();
    let shade1 = color(20, 20, 230);
    let shade2 = color(230, 20, 230);
    return lerpColor(shade1, shade2, s);
}

function lol() {
    return 420;
}