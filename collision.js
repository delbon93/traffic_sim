function createCircleCollider(r) {
    return {
        r: r,
        point: function(offsetX, offsetY, x, y) {
            let dx = x - offsetX;
            let dy = y - offsetY;
            return (dx * dx + dy * dy) <= this.r * this.r;
        }
    };
}

function createCapsuleCollider(x1, y1, x2, y2, r) {
    return {
        p1: createVector(x1, y1), p2: createVector(x2, y2), r: r,
        point: function(offsetX, offsetY, x, y) {
            let v = createVector(x, y);
            let offset = createVector(offsetX, offsetY);
            let from = p5.Vector.add(this.p1, offset);
            let to = p5.Vector.add(this.p2, offset);
            let dir = p5.Vector.sub(from, to);
            let edgeLength = dir.mag();
            dir.normalize();
            let lambda = clamp(p5.Vector.dot(p5.Vector.sub(v, from), dir), 0, edgeLength);
            let closest = p5.Vector.add(p5.Vector.mult(dir, lambda), from);
            let distanceToClosest = p5.Vector.sub(p, closest).mag();
            return distanceToClosest <= this.r;
        }
    };
}

function getEdgeCollision(graph, x, y, distanceThreshold, margin = 0) {
    let p = createVector(x, y);
    result = {hit: false, distance: Infinity, closestPoint: null, fromNode: null, toNode: null};
    graph.nodes.forEach(node => {
        node.out.forEach(to => {
            if (result.hit) return;
            let dir = p5.Vector.sub(to.pos, node.pos);
            let edgeLength = dir.mag();
            dir.normalize();
            let lambda = clamp(p5.Vector.dot(p5.Vector.sub(p, node.pos), dir), margin, edgeLength - margin);
            let closest = p5.Vector.add(p5.Vector.mult(dir, lambda), node.pos);
            let distanceToClosest = p5.Vector.sub(p, closest).mag();
            if (distanceToClosest < distanceThreshold) {
                result = {hit: true, distance: distanceToClosest, closestPoint: closest, fromNode: node, toNode: to};
            }
        });
        if (result.hit) return;
    });
    return result;
}

function getSwitchCollision(sw, x, y) {
    let p = createVector(x, y);
    return p5.Vector.sub(p, sw.pos).mag() < Switch.RADIUS;
}