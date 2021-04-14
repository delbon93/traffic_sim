function createCircleCollider(parent, r) {
    return {
        parent: parent,
        r: r,
        hit: function(x, y) {
            let dx = x - parent.pos.x;
            let dy = y - parent.pos.y;
            return (dx * dx + dy * dy) <= this.r * this.r;
        }
    };
}

function createCapsuleCollider(parent, x1, y1, x2, y2, r) {
    return {
        parent: parent,
        p1: createVector(x1, y1), p2: createVector(x2, y2), r: r,
        hit: function(x, y) {
            let v = createVector(x, y);
            let from = p5.Vector.add(this.p1, parent.pos);
            let to = p5.Vector.add(this.p2, parent.pos);
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
    graph.nodes.some(node => {
        node.out.some(to => {
            let x1 = min(to.pos.x, node.pos.x) - distanceThreshold; let y1 = min(to.pos.y, node.pos.y) - distanceThreshold;
            let x2 = max(to.pos.x, node.pos.x) + distanceThreshold; let y2 = max(to.pos.y, node.pos.y) + distanceThreshold;
            if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                let dir = p5.Vector.sub(to.pos, node.pos);
                let edgeLength = dir.mag();
                dir.normalize();
                let lambda = clamp(p5.Vector.dot(p5.Vector.sub(p, node.pos), dir), margin, edgeLength - margin);
                let closest = p5.Vector.add(p5.Vector.mult(dir, lambda), node.pos);
                let distanceToClosest = p5.Vector.sub(p, closest).mag();
                if (distanceToClosest < distanceThreshold) {
                    result = {hit: true, distance: distanceToClosest, closestPoint: closest, fromNode: node, toNode: to};
                    return true;
                }
            }
        });
        return result.hit;
    });
    return result;
    
}

function getSwitchCollision(sw, x, y) {
    let p = createVector(x, y);
    return p5.Vector.sub(p, sw.pos).mag() < Switch.RADIUS;
}