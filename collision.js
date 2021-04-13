
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